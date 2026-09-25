/**
 * Conversation Context & Continuity Service
 *
 * Guarantees:
 * 1. ZERO DB Leakage: Never inject unrelated database interactions across topics.
 * 2. Strict Topic Separation: A topic's content is NEVER confused or merged with another topic's content.
 * 3. Topic Continuation: Real follow-up questions (puriyala, explain more, etc.) or same-topic queries
 *    preserve conversation context to provide deeper, continuous pedagogical support.
 * 4. Off-Topic & Chit-chat Isolation: Off-topic questions or greetings during an active session
 *    do NOT pollute or break the technical topic context.
 */

// Pure greetings
const GREETING_REGEX = /^\s*(hi|hello|hey|vanakkam|vanakam|namaste|good\s*(morning|afternoon|evening)|hola|yo|sup|start|halo)\b/i;

// Conversational chit-chat / meta queries that are NOT technical inquiries
const CHITCHAT_REGEX = /^\s*(who are you|what is your name|how are you|what can you do|who created you|thank you|thanks|nandri|bye|goodbye|see you|ok|okay|fine|cool|super|nice|got it|purinjidhu|understood|yes|no)\b/i;

// Pedagogical continuation cues (Tamil, English, Tanglish)
const CONTINUATION_CUES = [
  // Tamil / Tanglish
  'puriyala', 'purila', 'puriyavillai', 'innum', 'adutha', 'marubadiyum', 'thirumba',
  'example kudunga', 'oru example', 'diagram kaatunga', 'explain pannunga', 'solli kudunga',
  'epdi', 'edhukku', 'enna aagum', 'adhanala', 'adhukku apram', 'next enna',
  // English follow-up cues
  'explain more', 'explain again', 'did not understand', "didn't understand", "don't understand",
  'give an example', 'another example', 'show diagram', 'show code', 'why', 'how',
  'what about', 'what if', 'next', 'continue', 'and then', 'can you elaborate',
  'tell me more', 'is it because', 'does that mean', 'step by step', 'what happens next',
  'difference between them', 'more details', 'clarify', 'give code', 'implement this',
  'what does that mean', 'can you simplify', 'simpler way'
];

/**
 * Classifies the student turn and decides whether conversation history should be included.
 *
 * @param {string} studentPrompt - What the student typed
 * @param {string} currentTopic  - Current active session topic
 * @param {Array}  chatHistory   - [{role, content}]
 * @returns {object}
 */
function analyzeTurnContext(studentPrompt = '', currentTopic = 'Computer Science', chatHistory = []) {
  const prompt = (studentPrompt || '').trim();
  const promptLower = prompt.toLowerCase();
  const words = prompt.split(/\s+/).filter(Boolean);

  // ── 1. GREETING CHECK ───────────────────────────────────────────────────────
  // Pure greeting: "hi", "hello there", "vanakkam", "hey adaptiq", etc.
  if (GREETING_REGEX.test(promptLower) && words.length <= 4) {
    return {
      type: 'greeting',
      isGreeting: true,
      isContinuation: false,
      isNewTopic: false,
      isChitChat: false,
      effectiveTopic: 'General Learning',
      relevantHistory: [], // ZERO history! Never pull past topics into a greeting
      guidanceNote: 'This is a friendly greeting. Output status="greeting", score=50, headline="👋 Welcome to AdaptIQ!". Warm welcoming response in remediationContent asking what they want to study. Set visualDiagram=null, codeSnippet=null, quickCheckQuestion=null.'
    };
  }

  // ── 2. CHIT-CHAT / ASIDE (e.g. "thanks", "who are you", "ok", "how are you") ──
  if (CHITCHAT_REGEX.test(promptLower) && words.length <= 6 && !CONTINUATION_CUES.some(cue => promptLower.includes(cue))) {
    return {
      type: 'chitchat',
      isGreeting: false,
      isContinuation: false,
      isNewTopic: false,
      isChitChat: true,
      effectiveTopic: currentTopic,
      relevantHistory: [], // Do NOT pollute with technical history
      guidanceNote: `The student made a conversational remark ("${studentPrompt}"). Respond politely and conversationally. Set visualDiagram=null, codeSnippet=null, quickCheckQuestion=null.`
    };
  }

  // ── 3. CONTINUATION CHECK ───────────────────────────────────────────────────
  // A turn is a continuation ONLY if:
  // - There is prior conversation in chatHistory
  // - AND the prompt contains follow-up cues (puriyala, explain more, etc.)
  // - OR the prompt explicitly mentions keywords from the currentTopic
  const hasContinuationCue = CONTINUATION_CUES.some(cue => promptLower.includes(cue));

  const topicKeywords = (currentTopic || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'foundations', 'basics', 'general', 'learning'].includes(w));

  const mentionsCurrentTopic = topicKeywords.length > 0 && topicKeywords.some(kw => promptLower.includes(kw));

  const isContinuation = chatHistory.length > 0 && (hasContinuationCue || mentionsCurrentTopic);

  if (isContinuation) {
    // Relevant history: take the last 4-6 turns of the continuous conversation
    const relevantHistory = chatHistory.slice(-6);
    return {
      type: 'continuation',
      isGreeting: false,
      isContinuation: true,
      isNewTopic: false,
      isChitChat: false,
      effectiveTopic: currentTopic,
      relevantHistory,
      guidanceNote: `This is a follow-up or clarification on "${currentTopic}". Use the recent conversation history to provide a seamless, continuous explanation. Focus strictly on "${currentTopic}". NEVER mix in unrelated topics.`
    };
  }

  // ── 4. NEW TOPIC / INDEPENDENT QUESTION ────────────────────────────────────
  // Fresh question or new topic introduction (e.g. switching from DSA to Networking)
  return {
    type: 'new_topic',
    isGreeting: false,
    isContinuation: false,
    isNewTopic: true,
    isChitChat: false,
    effectiveTopic: 'Computer Science', // Will be detected dynamically from prompt
    relevantHistory: [], // Fresh slate! Zero past history to prevent ANY cross-topic confusion!
    guidanceNote: 'This is a new topic. Detect the specific concept from the student message and explain it clearly and completely without dragging in unrelated previous topics or database content.'
  };
}

module.exports = {
  analyzeTurnContext,
  GREETING_REGEX,
  CHITCHAT_REGEX,
  CONTINUATION_CUES
};
