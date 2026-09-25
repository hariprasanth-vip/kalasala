/**
 * Cognitive Diagnosis Service
 *
 * IMPORTANT: This service now acts only as a JSON parser and normaliser for
 * Gemma 3's output. The actual intelligence (topic detection, concept diagnosis,
 * educational content generation) lives entirely in Gemma 3 via the system prompt.
 *
 * The legacy rule-based `evaluateRecursionConcept()` is kept ONLY as an absolute
 * last-resort when ALL LLM tiers fail AND we have no parseable content at all.
 * It will now return a generic "waiting for AI" response instead of fake recursion answers.
 */

/**
 * Generic fallback response — used ONLY when every LLM tier fails.
 * Returns an honest "I'm processing your message" response.
 * Topic-agnostic: does NOT fabricate educational content.
 *
 * @param {string} studentText
 * @returns {object}
 */
const buildGenericFallback = (studentText = '') => {
  const text = (studentText || '').trim().toLowerCase();

  // Detect greeting to give a friendly reply
  if (/^(hi|hello|hey|vanakkam|vanakam|namaste|good\s*(morning|afternoon|evening)|start|hola)\b/i.test(text)) {
    return {
      understandingScore: 50,
      status: 'greeting',
      detectedConcept: 'General',
      misconception: null,
      missingConcept: null,
      recommendedStrategy: 'conversational',
      strategyReason: 'Welcoming student',
      headline: '👋 Welcome to AdaptIQ!',
      remediationContent: 'Vanakkam! I am AdaptIQ, your adaptive AI tutor. Please ask me anything about your topic — I am here to help you understand it deeply!',
      visualDiagram: null,
      codeSnippet: null,
      quickCheckQuestion: null,
      misconceptionDetected: false,
      misconceptionKey: null,
      diagnosisSummary: 'Student initiated conversation with a greeting.',
      confidenceScore: 0.8
    };
  }

  // For any other input — honest response, no fake content
  return {
    understandingScore: 50,
    status: 'inquiry',
    detectedConcept: 'General',
    misconception: null,
    missingConcept: null,
    recommendedStrategy: 'analogy',
    strategyReason: 'Awaiting AI model response',
    headline: '⏳ Processing your message...',
    remediationContent: 'I am analyzing your message. The AI tutor is momentarily unavailable — please try again in a moment.',
    visualDiagram: null,
    codeSnippet: null,
    quickCheckQuestion: null,
    misconceptionDetected: false,
    misconceptionKey: null,
    diagnosisSummary: 'AI model unavailable; using generic fallback.',
    confidenceScore: 0.5
  };
};

/**
 * Parse and normalize Gemma 3's JSON response.
 *
 * This function:
 * 1. Strips any markdown code fences from the raw LLM output
 * 2. Parses the JSON
 * 3. Normalises all fields to match expected schema
 * 4. Applies score range guards (greeting=50, mastery≥70, misconception≤60)
 * 5. Falls back to buildGenericFallback() only if JSON parsing totally fails
 *
 * It does NOT override or replace the AI's content with hardcoded text.
 * The AI's `remediationContent`, `headline`, `visualDiagram`, `codeSnippet` are
 * trusted as-is.
 *
 * @param {string|null} rawContent - Raw text output from Gemma 3 / Gemini / Groq
 * @param {string} fallbackPrompt - The student's original message (for last-resort fallback)
 * @returns {object} Normalised diagnostic response
 */
const parseDiagnosisResponse = (rawContent, fallbackPrompt = '') => {
  // No content from any LLM tier → generic fallback
  if (!rawContent || !rawContent.trim()) {
    return buildGenericFallback(fallbackPrompt);
  }

  try {
    let cleaned = rawContent.trim();

    // Strip markdown code fences that some models add
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    // Some models emit trailing commas or comments — strip them
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    // Extract JSON block if model emitted text around it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    cleaned = jsonMatch[0];

    const parsed = JSON.parse(cleaned);

    // ── Status determination ──────────────────────────────────────────────
    const rawStatus = (parsed.status || '').toLowerCase().trim();
    const promptLower = (fallbackPrompt || '').trim().toLowerCase();

    // The student input is an actual greeting ONLY if the text is a greeting expression!
    const promptIsActualGreeting = /^\s*(hi|hello|hey|vanakkam|vanakam|namaste|good\s*(morning|afternoon|evening)|hola|yo|sup)\b/i.test(promptLower)
      && promptLower.split(/\s+/).length <= 4;

    const isGreeting = promptIsActualGreeting;
    const isMastery = !isGreeting && rawStatus === 'mastery';
    const isMisconception =
      !isGreeting &&
      !isMastery &&
      (rawStatus === 'misconception' || Boolean(parsed.misconception));
    const isInquiry = !isGreeting && !isMastery && !isMisconception;

    // ── Score normalisation ───────────────────────────────────────────────
    let score = Number(parsed.understandingScore ?? (isGreeting ? 50 : isInquiry ? 60 : isMastery ? 85 : 35));

    // Convert 0-1 scale to 0-100 if model returned a fraction
    if (score > 0 && score <= 1) score = Math.round(score * 100);

    if (isGreeting) {
      score = 50;
    } else if (isMisconception && score > 60) {
      score = Math.min(score, 55); // Cap misconception at 55
    } else if (isMastery && score < 70) {
      score = 80; // Minimum mastery threshold
    }

    score = Math.max(0, Math.min(100, score));

    // ── Status label ─────────────────────────────────────────────────────
    const status = isGreeting
      ? 'greeting'
      : isInquiry
      ? 'inquiry'
      : isMisconception
      ? 'misconception'
      : isMastery
      ? 'mastery'
      : 'partial';

    // ── Content fields — trust the AI, use its output directly ───────────
    const detectedConcept = parsed.detectedConcept || parsed.topic || (isGreeting ? 'General / Greeting' : 'Computer Science');
    const missingConcept = isMisconception ? (parsed.missingConcept || null) : null;
    const misconceptionText = isMisconception ? (parsed.misconception || null) : null;

    const recommendedStrategy = (
      parsed.recommendedStrategy ||
      (isGreeting ? 'conversational' : 'analogy')
    ).toLowerCase();

    const strategyReason =
      parsed.strategyReason ||
      (isGreeting
        ? 'Welcoming student into the topic'
        : 'Adapting pedagogical strategy to student DNA');

    // ── Headlines — use AI's headline first, build contextual fallback ───
    const headline =
      parsed.headline ||
      (isGreeting
        ? '👋 Welcome to AdaptIQ!'
        : isInquiry
        ? `💡 Understanding ${detectedConcept}`
        : isMisconception
        ? `🎯 Let me clarify ${missingConcept || detectedConcept}`
        : `🎉 ${detectedConcept} Mastered!`);

    // ── Remediation — MUST come from the AI (NEVER OVERRIDE WITH CANNED TEXT) ──
    const remediationContent =
      parsed.remediationContent ||
      parsed.coreExplanation ||
      (isGreeting
        ? 'Hello! I am AdaptIQ, your adaptive AI tutor. What would you like to learn today? You can ask me any concept in Computer Science, Data Structures, Networking, Web Development, or any specific problem!'
        : `Let me help you understand ${detectedConcept}.`);

    // ── Quick check question normalisation ───────────────────────────────
    let quickCheckQuestion = parsed.quickCheckQuestion || parsed.practicePrompt || null;

    if (typeof quickCheckQuestion === 'string') {
      quickCheckQuestion = {
        question: quickCheckQuestion,
        options: ['True', 'False', 'Not Sure'],
        correctOptionIndex: 0,
        hint: 'Think carefully about what you just learned.'
      };
    } else if (quickCheckQuestion && !Array.isArray(quickCheckQuestion.options)) {
      quickCheckQuestion = null; // Malformed — discard
    } else if (quickCheckQuestion && Array.isArray(quickCheckQuestion.options)) {
      quickCheckQuestion = {
        question: quickCheckQuestion.question || 'What did you learn from this explanation?',
        options: quickCheckQuestion.options,
        correctOptionIndex: Number(
          quickCheckQuestion.correctOptionIndex ??
            quickCheckQuestion.correctIndex ??
            0
        ),
        hint: quickCheckQuestion.hint || 'Think about the key concept explained.'
      };
    }

    return {
      understandingScore: score,
      status,
      detectedConcept: isGreeting ? 'General / Greeting' : detectedConcept,
      misconception: misconceptionText,
      missingConcept,
      recommendedStrategy,
      strategyReason,
      headline: parsed.headline || headline,
      remediationContent,
      visualDiagram: parsed.visualDiagram || null,
      codeSnippet: parsed.codeSnippet || null,
      quickCheckQuestion: isGreeting ? null : quickCheckQuestion,
      misconceptionDetected: isMisconception,
      misconceptionKey: missingConcept
        ? missingConcept.toLowerCase().replace(/\s+/g, '_')
        : null,
      diagnosisSummary:
        parsed.diagnosisSummary ||
        misconceptionText ||
        (isGreeting ? 'Greeting acknowledged.' : 'Diagnostic evaluation processed.'),
      confidenceScore: Number(parsed.confidenceScore ?? 0.9)
    };
  } catch (parseError) {
    console.warn(
      '⚠️  JSON parse failed from LLM response, using generic fallback. Error:',
      parseError.message
    );
    // Return honest generic fallback — do NOT inject hardcoded topic-specific content
    return buildGenericFallback(fallbackPrompt);
  }
};

module.exports = {
  buildGenericFallback,
  parseDiagnosisResponse,
  // Keep legacy export name for backwards compatibility
  evaluateRecursionConcept: buildGenericFallback
};
