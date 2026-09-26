const { processCognitiveTurn } = require('../services/aiModelService');
const { updateTeachingDna, selectOptimalStrategy } = require('../services/strategyService');
const { analyzeTurnContext } = require('../services/conversationContextService');
const Interaction = require('../models/Interaction');
const Session = require('../models/Session');
const TeachingProfile = require('../models/TeachingProfile');
const { inMemoryStudent, inMemoryProfile } = require('./studentController');
const { inMemorySessions, inMemoryInteractions } = require('./sessionController');

/**
 * Endpoint: POST /api/tutor/diagnose
 * Quick diagnostic pass on student statement
 */
const diagnoseStudentInput = async (req, res, next) => {
  try {
    const { studentResponse, topicId = 'Computer Science' } = req.body;
    if (!studentResponse) {
      return res.status(400).json({ success: false, error: 'studentResponse is required.' });
    }

    const diagnosis = await processCognitiveTurn({
      studentSubmission: studentResponse,
      topicContext: topicId
    });

    return res.json({
      success: true,
      diagnosis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint: POST /api/tutor/respond
 *
 * Core pedagogical loop powered by Gemma 3:
 *
 * Data flow:
 *   DB → Student Teaching DNA (dnaProfile)      ← context for personalisation
 *   DB → Past interactions from this session    ← context for conversation memory
 *   Client → chatHistory (last 6 turns)         ← context for current conversation
 *   Client → studentPrompt                      ← the actual input to process
 *
 *   All above → Gemma 3 system prompt → Fresh LLM-generated response
 *
 * DB data is NEVER returned as the answer — it provides context to the LLM.
 */
const processStudentInteraction = async (req, res, next) => {
  try {
    const {
      sessionId = 'session-demo-001',
      studentId = '65f000000000000000000001',
      topicId = 'Computer Science',
      studentPrompt,
      forcedStrategy,
      chatHistory = []
    } = req.body;

    if (!studentPrompt) {
      return res.status(400).json({ success: false, error: 'studentPrompt is required.' });
    }

    // ── Step 1: Fetch student Teaching DNA from DB (or use in-memory fallback) ──
    // This is CONTEXT for the LLM, not the answer
    let profile = await TeachingProfile.findOne({ studentId }).catch(() => null);
    if (!profile) {
      profile = inMemoryProfile;
    }

    // ── Step 2: Determine Conversational Intent & History Relevance ────────────
    // Cleanly separates:
    //  - Greetings: NO past history, warm welcome, general topic
    //  - Continuations: feeds recent same-topic turns for continuous deep learning
    //  - New Topics: clean slate, no mixing of past topic luggage
    const clientHistory = (chatHistory || [])
      .filter(m => m && (m.content || m.text))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || m.text || ''
      }));

    const turnContext = analyzeTurnContext(studentPrompt, topicId, clientHistory);

    // ── Step 2B: Fetch past interactions from DB (Topic-Aware & Continuation-Only) ──
    // Retains full DB history capability without mixing different topics!
    let dbHistory = [];
    if (turnContext.isContinuation) {
      try {
        const dbInteractions = await Interaction
          .find({ sessionId, studentId, topicId: turnContext.effectiveTopic })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean();

        dbHistory = dbInteractions
          .reverse()
          .flatMap(inter => [
            inter.studentPrompt ? { role: 'user', content: inter.studentPrompt } : null,
            inter.tutorResponse?.coreExplanation ? { role: 'assistant', content: inter.tutorResponse.coreExplanation } : null
          ])
          .filter(Boolean);
      } catch (dbErr) {
        dbHistory = (inMemoryInteractions || [])
          .filter(i => i.sessionId === sessionId && i.topicId === turnContext.effectiveTopic)
          .slice(-4)
          .flatMap(inter => [
            inter.studentPrompt ? { role: 'user', content: inter.studentPrompt } : null,
            inter.tutorResponse?.coreExplanation ? { role: 'assistant', content: inter.tutorResponse.coreExplanation } : null
          ])
          .filter(Boolean);
      }
    }

    // Merge relevant history: keeps same-topic context seamless across page reloads
    const combinedHistory = turnContext.isContinuation
      ? [...dbHistory, ...turnContext.relevantHistory].slice(-6)
      : [];

    // ── Step 3: Determine optimal strategy from UCB1 MAB algorithm ─────────────
    const strategyToUse = forcedStrategy || selectOptimalStrategy(profile);

    // ── Step 4: Call Gemma 3 (or fallback tier) with relevant context ──────────
    const cognitiveResult = await processCognitiveTurn({
      studentSubmission: studentPrompt,
      topicContext: turnContext.effectiveTopic || topicId,
      dnaProfile: profile.dna,
      activeStrategy: strategyToUse,
      chatHistory: combinedHistory,
      turnContext
    });

    const activeStrategy = cognitiveResult.recommendedStrategy || strategyToUse;
    const isGreeting = cognitiveResult.status === 'greeting' || turnContext.isGreeting;
    const isMisconception = !isGreeting && cognitiveResult.status === 'misconception';
    const score = cognitiveResult.understandingScore ?? (isGreeting ? 50 : 35);

    // ── Step 5: Update session score ─────────────────────────────────────────────
    let session = await Session.findById(sessionId).catch(() => null);
    const prevScore = session
      ? session.currentScore
      : (inMemorySessions[sessionId]?.currentScore || 35);

    const scoreDelta = isGreeting ? 0 : (score - prevScore);

    // ── Step 6: Update Teaching DNA with reward signal ────────────────────────────
    const dnaUpdate = isGreeting
      ? { dna: profile.dna }
      : updateTeachingDna(profile.dna, activeStrategy, scoreDelta, isMisconception);

    if (!isGreeting) {
      if (profile.save) {
        profile.dna = dnaUpdate.dna;
        profile.cognitiveLoad = Math.min(
          100,
          Math.max(10, (profile.cognitiveLoad || 45) + (isMisconception ? 10 : -8))
        );
        profile.updatedAt = new Date();
        await profile.save().catch(() => { });
      } else {
        inMemoryProfile.dna = dnaUpdate.dna;
        inMemoryProfile.cognitiveLoad = Math.min(
          100,
          Math.max(10, (inMemoryProfile.cognitiveLoad || 45) + (isMisconception ? 10 : -8))
        );
      }
    }

    // ── Step 7: Update session record ────────────────────────────────────────────
    if (session) {
      if (!isGreeting) session.currentScore = score;
      session.dominantStrategy = activeStrategy;
      session.totalInteractions = (session.totalInteractions || 0) + 1;
      await session.save().catch(() => { });
    } else if (inMemorySessions[sessionId]) {
      if (!isGreeting) inMemorySessions[sessionId].currentScore = score;
      inMemorySessions[sessionId].dominantStrategy = activeStrategy;
      inMemorySessions[sessionId].totalInteractions += 1;
    }

    // ── Step 8: Build tutor response object ──────────────────────────────────────
    // All content (headline, coreExplanation, diagram, code) comes directly from the LLM
    const dynamicHeadline = cognitiveResult.headline || (
      isGreeting ? '👋 Welcome to AdaptIQ!' :
        cognitiveResult.status === 'inquiry' ? `💡 Understanding ${cognitiveResult.detectedConcept || topicId}` :
          isMisconception ? `🎯 Strategy Pivot: Clarifying ${cognitiveResult.missingConcept || 'the Concept'}` :
            `🎉 Concept Mastered!`
    );

    const tutorResponse = {
      headline: cognitiveResult.headline || dynamicHeadline,
      strategyReason: cognitiveResult.strategyReason || '',
      coreExplanation: cognitiveResult.remediationContent || cognitiveResult.coreExplanation || '',
      visualDiagram: cognitiveResult.visualDiagram || null,
      codeSnippet: cognitiveResult.codeSnippet || null,
      socraticCheck: cognitiveResult.quickCheckQuestion?.question || null,
      practicePrompt: cognitiveResult.quickCheckQuestion ? {
        question: cognitiveResult.quickCheckQuestion.question,
        options: cognitiveResult.quickCheckQuestion.options,
        correctIndex: Number(cognitiveResult.quickCheckQuestion.correctOptionIndex ?? 0),
        hint: cognitiveResult.quickCheckQuestion.hint || ''
      } : null,
      modelSource: cognitiveResult.modelSource
    };

    // ── Step 9: Persist interaction to DB ─────────────────────────────────────────
    const interactionData = {
      sessionId,
      studentId,
      topicId: isGreeting ? 'General / Greeting' : (cognitiveResult.detectedConcept || topicId),
      studentPrompt,
      diagnosis: {
        understandingScore: score,
        status: cognitiveResult.status,
        misconception: isGreeting ? null : cognitiveResult.misconception,
        missingConcept: isGreeting ? null : cognitiveResult.missingConcept,
        misconceptionDetected: isMisconception,
        diagnosisSummary: cognitiveResult.diagnosisSummary,
        confidenceScore: cognitiveResult.confidenceScore
      },
      strategyUsed: activeStrategy,
      dnaSnapshot: dnaUpdate.dna,
      tutorResponse,
      modelSource: cognitiveResult.modelSource || 'gemma-3 (local)',
      createdAt: new Date()
    };

    let savedInteraction;
    try {
      savedInteraction = await Interaction.create(interactionData);
    } catch (saveErr) {
      savedInteraction = { _id: 'inter-' + Date.now(), ...interactionData };
      inMemoryInteractions.push(savedInteraction);
    }

    // ── Step 10: Return complete response to frontend ─────────────────────────────
    return res.status(200).json({
      success: true,
      understandingScore: score,
      status: cognitiveResult.status,
      detectedConcept: isGreeting ? 'General / Greeting' : cognitiveResult.detectedConcept,
      misconception: isGreeting ? null : cognitiveResult.misconception,
      missingConcept: isGreeting ? null : cognitiveResult.missingConcept,
      headline: dynamicHeadline,
      strategyReason: cognitiveResult.strategyReason,
      recommendedStrategy: activeStrategy,
      remediationContent: cognitiveResult.remediationContent,
      visualDiagram: cognitiveResult.visualDiagram || null,
      codeSnippet: cognitiveResult.codeSnippet || null,
      quickCheckQuestion: cognitiveResult.quickCheckQuestion || null,
      updatedDna: dnaUpdate.dna,
      dominantStrategy: activeStrategy,
      interaction: savedInteraction,
      modelSource: cognitiveResult.modelSource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint: POST /api/tutor/verify
 * Handles student submission to the active recall verification question.
 */
const verifyStudentAnswer = async (req, res, next) => {
  try {
    const {
      sessionId = 'session-demo-001',
      studentId = '65f000000000000000000001',
      selectedOptionIndex,
      correctOptionIndex = 0,
      strategyUsed = 'analogy'
    } = req.body;

    const isCorrect = Number(selectedOptionIndex) === Number(correctOptionIndex);
    const newScore = isCorrect ? 85 : 35;
    const newStatus = isCorrect ? 'mastery' : 'misconception';

    // Update session
    let session = await Session.findById(sessionId).catch(() => null);
    if (session) {
      session.currentScore = newScore;
      await session.save().catch(() => { });
    } else if (inMemorySessions[sessionId]) {
      inMemorySessions[sessionId].currentScore = newScore;
    }

    // Reward/penalise strategy in Teaching DNA
    let profile = await TeachingProfile.findOne({ studentId }).catch(() => null);
    if (!profile) profile = inMemoryProfile;

    const dnaUpdate = updateTeachingDna(
      profile.dna,
      strategyUsed,
      isCorrect ? 25 : -5,
      !isCorrect
    );

    if (profile.save) {
      profile.dna = dnaUpdate.dna;
      await profile.save().catch(() => { });
    } else {
      inMemoryProfile.dna = dnaUpdate.dna;
    }

    return res.json({
      success: true,
      isCorrect,
      understandingScore: newScore,
      status: newStatus,
      updatedDna: dnaUpdate.dna,
      message: isCorrect
        ? '✅ Correct! Well done — you have got it!'
        : '❌ Not quite. Try reviewing the explanation above and attempt again.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Real-Time 5-Question Diagnostic Assessment Generator via Ollama (Gemma 3)
 * Endpoint: POST /api/tutor/assessment
 * Generates 100% dynamic questions directly from local Ollama for any topic!
 */
const getTopicAssessment = async (req, res, next) => {
  try {
    const topic = (req.body.topicId || req.query.topic || 'Computer Science').trim();
    console.log(`[Assessment] Requesting 5 real-time diagnostic questions from Ollama for topic: "${topic}"...`);

    const prompt = `Generate exactly 5 multiple choice diagnostic questions to evaluate a student's deep conceptual understanding of: "${topic}".
Each question must test a different angle (definitions, mechanisms, common misconceptions, code logic, edge cases).
Return strictly a valid JSON object with this exact structure:
{
  "topicId": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;

    const systemInstruction = 'You are a Senior Computer Science Professor and Diagnostic Evaluator. Return ONLY valid JSON containing 5 multiple choice questions. Do NOT wrap in markdown fences. Output raw JSON only.';

    let rawOutput = null;
    let modelSource = 'ollama-gemma3-realtime';

    // 1. Try Ollama (Gemma 3) Local
    const ollama = require('../services/ollamaService');
    const isOllamaUp = await ollama.isAvailable();
    if (isOllamaUp) {
      try {
        rawOutput = await ollama.generateChatResponse(
          [{ role: 'user', content: prompt }],
          systemInstruction
        );
      } catch (ollamaErr) {
        console.warn(`[Assessment] Ollama generation failed (${ollamaErr.message}), trying cloud AI tier...`);
      }
    }

    // 2. Fallback to Gemini 2.5 if Ollama was down or errored
    if (!rawOutput && process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemInstruction}\n\n${prompt}`,
          config: { responseMimeType: 'application/json' }
        });
        rawOutput = geminiRes.text?.();
        modelSource = 'gemini-2.5-flash-realtime';
      } catch (geminiErr) {
        console.warn(`[Assessment] Gemini tier failed: ${geminiErr.message}`);
      }
    }

    // 3. Fallback to Groq if both failed
    if (!rawOutput && process.env.GROQ_API_KEY) {
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const groqRes = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        });
        rawOutput = groqRes.choices?.[0]?.message?.content;
        modelSource = 'groq-llama3.3-realtime';
      } catch (groqErr) {
        console.warn(`[Assessment] Groq tier failed: ${groqErr.message}`);
      }
    }

    rawOutput = (rawOutput || '').trim();
    if (rawOutput.startsWith('```json')) {
      rawOutput = rawOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    let parsed = null;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (parseErr) {
      console.warn('[Assessment] JSON parse failed, extracting via regex...');
      const match = rawOutput.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('AI did not return questions in expected JSON format: ' + (rawOutput.slice(0, 100) || 'empty'));
    }

    const formattedQuestions = parsed.questions.slice(0, 5).map((q, idx) => {
      const questionText = q.question || q.question_text || `Question ${idx + 1}`;
      const rawOptions = Array.isArray(q.options) && q.options.length >= 2
        ? q.options
        : (Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D']);

      let correctIndex = 0;
      if (typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < rawOptions.length) {
        correctIndex = q.correctIndex;
      } else if (q.correct_answer) {
        const found = rawOptions.findIndex((opt) => opt.trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase());
        correctIndex = found >= 0 ? found : 0;
      }

      return {
        id: q.id || q.question_id || idx + 1,
        question: questionText,
        options: rawOptions,
        correctIndex,
        explanation: q.explanation || (q.difficulty ? `${q.topic || topic} diagnostic check (${q.difficulty}).` : 'Review the core concept to understand this principle.')
      };
    });

    console.log(`[Assessment] Successfully generated ${formattedQuestions.length} dynamic questions via ${modelSource}`);

    return res.json({
      success: true,
      modelSource,
      topicId: topic,
      totalQuestions: formattedQuestions.length,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('[Assessment Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dynamic questions from AI: ' + error.message
    });
  }
};

/**
 * Handle 5-Question Assessment Submission & Score Update
 * Endpoint: POST /api/tutor/submit-assessment
 */
const submitTopicAssessment = async (req, res, next) => {
  try {
    const {
      studentId = '65f000000000000000000001',
      topicId = 'Concept Mastery',
      correctCount = 5,
      totalQuestions = 5
    } = req.body;

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70;

    // 1. Update Student in MongoDB
    const Student = require('../models/Student');
    let student = await Student.findById(studentId).catch(() => null);
    if (student) {
      student.overallMastery = Math.max(student.overallMastery || 40, percentage);
      student.updatedAt = new Date();
      await student.save().catch(() => {});
    }

    // 2. Save verified assessment interaction in MongoDB
    await Interaction.create({
      sessionId: 'session-demo-001',
      studentId,
      topicId,
      studentPrompt: `Completed 5-Question Diagnostic Assessment via Gemma 3: ${correctCount}/${totalQuestions} correct (${percentage}%)`,
      diagnosis: {
        understandingScore: percentage,
        misconceptionDetected: !passed,
        misconceptionKey: passed ? null : `${topicId}_misconception`,
        diagnosisSummary: passed ? `Student mastered ${topicId} with ${percentage}% score.` : `Review needed for ${topicId}.`,
        confidenceScore: 0.95
      },
      strategyUsed: passed ? 'codeExecution' : 'analogy',
      dnaSnapshot: { socratic: 20, analogical: 35, firstPrinciples: 15, visual: 20, codeExecution: 10 },
      tutorResponse: {
        headline: passed ? `🎉 ${topicId} Mastered (${percentage}%)!` : `🎯 Strategy Pivot for ${topicId}`,
        coreExplanation: `Student completed 5-question dynamic Ollama assessment with ${correctCount} of ${totalQuestions} correct answers.`,
        socraticCheck: null
      },
      modelSource: 'gemma-3 (local)'
    }).catch(() => {});

    return res.json({
      success: true,
      topicId,
      score: percentage,
      correctCount,
      totalQuestions,
      passed,
      recommendedStrategy: passed ? 'Code & Sandbox' : 'Analogy & Real-World Metaphor',
      feedback: passed
        ? `Outstanding work! You demonstrated mastery of ${topicId}. Understanding score updated to ${percentage}% in MongoDB.`
        : `Good effort! You scored ${percentage}%. We recommend reviewing key mechanisms using intuitive analogies.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  diagnoseStudentInput,
  processStudentInteraction,
  verifyStudentAnswer,
  getTopicAssessment,
  submitTopicAssessment
};
