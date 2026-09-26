/**
 * Cognitive Prompt Builder & Intent Analyzer
 *
 * Acts as the intelligent orchestration bridge:
 * Student Submission
 *    ↓
 * Cognitive Prompt Builder (Analyzes intent, expands CS acronyms, enforces Teaching DNA)
 *    ↓
 * Ollama (Gemma 3)
 *    ↓
 * 100% Dynamic Model Response (Zero canned strings, zero overrides)
 */

// Common CS acronyms mapped to full concept names
const CS_ACRONYMS = {
  cse: 'Computer Science and Engineering (CSE)',
  cs: 'Computer Science',
  it: 'Information Technology',
  dsa: 'Data Structures and Algorithms',
  dbms: 'Database Management Systems',
  sql: 'Structured Query Language (SQL)',
  os: 'Operating Systems (Processes, Threads, Memory, Scheduling)',
  cn: 'Computer Networks',
  ai: 'Artificial Intelligence',
  ml: 'Machine Learning',
  dl: 'Deep Learning',
  nlp: 'Natural Language Processing',
  oop: 'Object-Oriented Programming (OOP Concepts)',
  oops: 'Object-Oriented Programming (OOP Concepts)',
  toc: 'Theory of Computation and Automata',
  daa: 'Design and Analysis of Algorithms',
  co: 'Computer Organization and Architecture',
  coa: 'Computer Organization and Architecture',
  c: 'C Programming Language',
  cpp: 'C++ Programming Language',
  'c++': 'C++ Programming Language',
  java: 'Java Programming Language',
  python: 'Python Programming Language',
  py: 'Python Programming Language',
  js: 'JavaScript and Web Architecture',
  html: 'HTML Web Structure',
  css: 'CSS Styling and Responsive Design',
  react: 'React.js UI Framework',
  api: 'Application Programming Interfaces (APIs)',
  rest: 'RESTful API Architecture',
  http: 'HTTP/HTTPS Web Protocols',
  tcp: 'TCP Transmission Control Protocol',
  udp: 'UDP User Datagram Protocol',
  ip: 'Internet Protocol (IP Addressing & Routing)'
};

const PURE_GREETINGS = /^\s*(hi|hello|hey|vanakkam|vanakam|namaste|good\s*(morning|afternoon|evening)|hola|yo|sup)\b/i;

/**
 * Analyzes student input and builds a targeted directive for Gemma 3
 *
 * @param {string} studentPrompt
 * @param {string} activeStrategy
 * @param {string} topicContext
 * @returns {object} { intent, detectedConcept, gemmaDirective }
 */
function buildCognitiveDirective(studentPrompt = '', activeStrategy = 'analogy', topicContext = 'Computer Science') {
  const clean = (studentPrompt || '').trim();
  const lower = clean.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  // 1. Pure Greeting Check
  if (PURE_GREETINGS.test(lower) && words.length <= 3) {
    return {
      intent: 'greeting',
      isGreeting: true,
      detectedConcept: 'General / Greeting',
      gemmaDirective: `Student message: "${clean}"
This is a friendly greeting. Output status="greeting", score=50, headline="👋 Welcome to AdaptIQ!". In remediationContent write a warm, friendly welcome message asking what computer science topic or programming question they would like to explore today. Set visualDiagram=null, codeSnippet=null, quickCheckQuestion=null. Respond ONLY with valid JSON.`
    };
  }

  // 2. Acronym or Single-Word Topic Lookup (e.g. "cse", "dbms", "os", "c++")
  const directMatch = CS_ACRONYMS[lower];
  if (directMatch || (words.length <= 3 && !lower.includes('why') && !lower.includes('how') && !lower.includes('what is'))) {
    const conceptName = directMatch || clean;
    return {
      intent: 'topic_exploration',
      isGreeting: false,
      detectedConcept: conceptName,
      gemmaDirective: `Student message: "${clean}"
The student wants to learn about "${conceptName}".
This is a core topic inquiry, NOT a greeting! Output status="inquiry", score=60, detectedConcept="${conceptName}".
In remediationContent, thoroughly explain what ${conceptName} is, its core pillars, why it matters, and how it is used in the real world using the "${activeStrategy}" teaching strategy.
CRITICAL: Do NOT put diagrams, flowcharts, or questions in remediationContent!
Put the ASCII structural diagram in visualDiagram.
Put the active recall multiple choice question with options array in quickCheckQuestion so the UI can render interactive option buttons below the chat.
Respond ONLY with valid JSON.`
    };
  }

  // 3. Extract Explicit Student Learning Preferences
  const prefersDiagram = /diagram|visual|padam|picture|chart|flow/i.test(lower);
  const prefersCode = /code|program|syntax|coding|snippet|script/i.test(lower);
  const prefersAnalogy = /analogy|story|metaphor|example|real[- ]?world|mathiri|mari/i.test(lower);
  const prefersSimple = /simple|easy|puriyala|puriyala|purila|kashtama|beginner/i.test(lower);

  const preferences = [];
  if (prefersDiagram) preferences.push('Student specifically requested visual diagrams: provide a clear, detailed ASCII diagram in visualDiagram.');
  if (prefersCode) preferences.push('Student requested code examples: provide clean, well-commented runnable code in codeSnippet.');
  if (prefersAnalogy) preferences.push('Student requested analogies/examples: use a vivid real-world metaphor in remediationContent.');
  if (prefersSimple) preferences.push('Student mentioned concept is difficult/unclear: explain simply from first principles without dense academic jargon.');

  const preferenceDirectives = preferences.length > 0 
    ? `\nSTUDENT PREFERENCES DETECTED:\n${preferences.map(p => `- ${p}`).join('\n')}` 
    : '';

  // 4. Technical Question or Problem Statement
  const isHowToOrConversion = /how\s+to|convert|migrate|transform|build|create|setup|steps|difference\s+between|import\b/i.test(lower);
  const technicalGuidance = isHowToOrConversion 
    ? `\nTECHNICAL IMPLEMENTATION & DEPTH GUIDELINES:
- For practical "how to", conversion, or framework questions (e.g. Java to Spring Boot):
  * Address common beginner traps (e.g. explicitly clarify why simply importing with 'import org.springframework...' is NOT enough and does NOT magically convert a Java file into a Spring Boot app).
  * Provide the concrete step-by-step technical requirements: 1) Build tool setup (Maven pom.xml / Gradle starters), 2) Main entry point (@SpringBootApplication & SpringApplication.run), 3) Inversion of Control & Dependency Injection (@Component/@Service/@Autowired vs manual 'new'), 4) Web controller layer (@RestController).
  * In codeSnippet, provide a clean, realistic code example demonstrating the transformation.
  * In visualDiagram, provide an architectural ASCII diagram illustrating how Spring Boot manages the application lifecycle.`
    : '';

  return {
    intent: 'concept_inquiry',
    isGreeting: false,
    detectedConcept: clean,
    preferences: {
      prefersDiagram,
      prefersCode,
      prefersAnalogy,
      prefersSimple
    },
    gemmaDirective: `Student message: "${clean}"
Context topic: "${topicContext}".
Strategy from Teaching DNA: "${activeStrategy}".${preferenceDirectives}${technicalGuidance}

Analyze the student's submission carefully:
- If asking what/how/why/explain: status="inquiry", score=60, explain thoroughly using "${activeStrategy}" strategy. Include visual diagram and code snippet if applicable.
- If student expresses misconception/flaw: status="misconception", score=30-50, pinpoint the missing concept and correct their mental model.
- If student demonstrates correct understanding: status="mastery", score=80-95, praise their understanding and deepen it.

CRITICAL: Keep remediationContent as PURE explanation only. Put ASCII diagram in visualDiagram and multiple choice question with options array in quickCheckQuestion so the UI displays interactive buttons!
Respond ONLY with valid JSON.`
  };
}

module.exports = {
  buildCognitiveDirective,
  CS_ACRONYMS,
  PURE_GREETINGS
};
