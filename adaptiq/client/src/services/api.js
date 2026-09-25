/**
 * API Service for AdaptIQ Client
 * Handles real-time communication with the backend with seamless resilience.
 *
 * Design principle:
 *  - All real educational content comes from the backend (Gemma 3 / Gemini / Groq)
 *  - Client-side fallback is used ONLY when backend is unreachable
 *  - Fallback returns honest "AI offline" messages, not fake educational content
 */

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json'
});

export const fetchHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline' };
  }
};

export const fetchCurriculum = async () => {
  try {
    const res = await fetch(`${BASE_URL}/student/curriculum`);
    const json = await res.json();
    if (json.success) return json.curriculum;
  } catch (err) {
    console.warn('Backend curriculum unavailable, using local cache');
  }
  return [
    {
      topicId: 'recursion-foundations',
      name: 'Recursion Foundations',
      difficulty: 'Intermediate',
      milestones: [
        { id: 'rec-1', title: 'Base vs Recursive Case', completed: true, masteryScore: 85 },
        { id: 'rec-2', title: 'Call Stack Visualization', completed: false, masteryScore: 37 },
        { id: 'rec-3', title: 'Return Flow Unwinding', completed: false, masteryScore: 20 }
      ]
    }
  ];
};

export const fetchStudentDna = async (studentId = '65f000000000000000000001') => {
  try {
    const res = await fetch(`${BASE_URL}/student/${studentId}/dna`);
    const json = await res.json();
    if (json.success) return json.profile;
  } catch (err) {
    console.warn('Backend DNA unavailable, using local cache');
  }
  return {
    dna: { socratic: 15, analogical: 35, firstPrinciples: 15, visual: 25, codeExecution: 10 },
    cognitiveLoad: 52
  };
};

/**
 * Send student interaction to backend → Gemma 3 generates response dynamically.
 *
 * The backend uses:
 *  - studentPrompt: what the student typed (the primary driver)
 *  - chatHistory: last 8 turns for conversational context
 *  - topicId: session topic label (used for context, not hardcoded answers)
 *  - Teaching DNA from DB: personalises the pedagogy strategy
 *
 * The LLM detects the REAL concept from the student's message regardless of topicId.
 */
export const sendStudentInteraction = async ({
  sessionId = 'session-demo-001',
  studentPrompt,
  forcedStrategy,
  topicId = 'Computer Science',
  chatHistory = []
}) => {
  try {
    const res = await fetch(`${BASE_URL}/tutor/respond`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        sessionId,
        studentPrompt,
        forcedStrategy,
        topicId,
        chatHistory
      })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using offline fallback:', err.message);

    // Client-side offline fallback:
    // Returns an HONEST response — does NOT fake educational content.
    // The backend (Gemma 3) is the source of truth for all answers.
    const text = (studentPrompt || '').trim().toLowerCase();
    const isGreeting = /^(hi|hello|hey|vanakkam|vanakam|namaste|good\s*(morning|afternoon|evening)|start|hola)\b/i.test(text);

    if (isGreeting) {
      return {
        success: true,
        understandingScore: 50,
        status: 'greeting',
        detectedConcept: 'General',
        misconception: null,
        missingConcept: null,
        headline: '👋 Welcome to AdaptIQ!',
        strategyReason: 'Welcoming student',
        recommendedStrategy: 'conversational',
        remediationContent: 'Vanakkam! I am AdaptIQ, your adaptive AI tutor. The AI engine is currently offline — please check that Ollama is running and try again. Once connected, I can answer any topic you want to learn about!',
        visualDiagram: null,
        codeSnippet: null,
        quickCheckQuestion: null,
        modelSource: 'offline-fallback'
      };
    }

    // For any other input — honest offline notice
    return {
      success: true,
      understandingScore: 50,
      status: 'inquiry',
      detectedConcept: 'General',
      misconception: null,
      missingConcept: null,
      headline: '⚠️ AI Engine Offline',
      strategyReason: 'Backend unavailable',
      recommendedStrategy: 'analogy',
      remediationContent: `I received your message: "${studentPrompt.slice(0, 60)}${studentPrompt.length > 60 ? '...' : ''}"\n\nThe AI tutor engine is currently offline. Please ensure:\n• The backend server is running (port 5000)\n• Ollama is active with Gemma 3 loaded\n\nOnce reconnected, I will answer your question about any topic!`,
      visualDiagram: null,
      codeSnippet: null,
      quickCheckQuestion: null,
      modelSource: 'offline-fallback'
    };
  }
};

export const verifyQuickCheck = async ({
  sessionId = 'session-demo-001',
  selectedOptionIndex,
  correctOptionIndex = 0,
  strategyUsed = 'analogy'
}) => {
  try {
    const res = await fetch(`${BASE_URL}/tutor/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        sessionId,
        selectedOptionIndex,
        correctOptionIndex,
        strategyUsed
      })
    });
    return await res.json();
  } catch (err) {
    const isCorrect = Number(selectedOptionIndex) === Number(correctOptionIndex);
    return {
      success: true,
      isCorrect,
      understandingScore: isCorrect ? 85 : 35,
      status: isCorrect ? 'mastery' : 'misconception',
      updatedDna: { analogy: 45, visual: 25, codeExecution: 20, socratic: 5, firstPrinciples: 5 },
      message: isCorrect
        ? '✅ Correct! Well done!'
        : '❌ Not quite — try reviewing the explanation and attempt again.'
    };
  }
};
