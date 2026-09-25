const Session = require('../models/Session');
const Interaction = require('../models/Interaction');

// In-memory sessions store for demo resilience
let inMemorySessions = {
  'session-demo-001': {
    _id: 'session-demo-001',
    studentId: '65f000000000000000000001',
    topicId: 'recursion-foundations',
    title: 'Recursion Call Stacks & Return Flow',
    status: 'active',
    currentScore: 35, // Demo starting state: 35% error
    dominantStrategy: 'visual',
    totalInteractions: 1,
    startedAt: new Date()
  }
};

let inMemoryInteractions = [
  {
    _id: 'inter-001',
    sessionId: 'session-demo-001',
    studentId: '65f000000000000000000001',
    topicId: 'recursion-foundations',
    studentPrompt: 'I ran factorial(3), and it returned 1 because factorial(1) hits the base case. Then the program stops right?',
    diagnosis: {
      understandingScore: 35,
      misconceptionDetected: true,
      misconceptionKey: 'unwinding_amnesia',
      diagnosisSummary: 'Student displays Unwinding Amnesia: assuming execution halts once base case returns 1, forgetting suspended stack frames must resume.',
      confidenceScore: 0.94
    },
    strategyUsed: 'visual',
    dnaSnapshot: {
      socratic: 15,
      analogical: 25,
      firstPrinciples: 15,
      visual: 35,
      codeExecution: 10
    },
    tutorResponse: {
      headline: 'Visualizing the Call Stack: The Winding & Unwinding Journey',
      coreExplanation: 'Recursion is not a single loop; it is a stack of frozen moments. Every time factorial(n) invokes factorial(n - 1), the active function pauses mid-sentence and places an activation frame onto the execution stack. When factorial(1) hits the base case, it doesn’t end the story—it begins the return descent.',
      visualDiagram: `
┌──────────────────────────────────────────────┐
│ [Frame 3] factorial(3)  PAUSED waiting for n=2 │
│   └─ returns: 3 * [waiting for factorial(2)]  │
├──────────────────────────────────────────────┤
│ [Frame 2] factorial(2)  PAUSED waiting for n=1 │
│   └─ returns: 2 * [waiting for factorial(1)]  │
├──────────────────────────────────────────────┤
│ [Frame 1] factorial(1)  ACTIVE BASE CASE      │
│   └─ returns: 1  ──────┐                      │
└────────────────────────│─────────────────────┘
                         ▼
             UNWINDING RESOLUTION:
             Frame 2 resumes: 2 * 1 = 2
             Frame 3 resumes: 3 * 2 = 6!
      `.trim(),
      analogyMetaphor: 'Think of cafeteria lunch trays being stacked one on top of another. You can only wash the tray on the very top before you can reach the trays underneath.',
      codeSnippet: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}`,
      socraticCheck: 'If Frame 1 returns 1, which frame wakes up first: factorial(2) or factorial(3)?',
      practicePrompt: {
        question: 'What is the exact value received by the paused factorial(3) call when its child factorial(2) finishes unwinding?',
        options: ['1', '2', '6', 'undefined'],
        correctIndex: 1,
        hint: 'Remember: factorial(2) evaluates 2 * 1 before passing its result up.'
      }
    },
    modelSource: 'heuristic-engine',
    createdAt: new Date()
  }
];

const startSession = async (req, res, next) => {
  try {
    const { studentId, topicId, title } = req.body;
    let session;

    try {
      session = await Session.create({
        studentId: studentId || '65f000000000000000000001',
        topicId: topicId || 'recursion-foundations',
        title: title || 'Adaptive Tutoring Session',
        currentScore: 35
      });
    } catch (dbErr) {
      const sid = 'session-' + Date.now();
      session = {
        _id: sid,
        studentId: studentId || '65f000000000000000000001',
        topicId: topicId || 'recursion-foundations',
        title: title || 'Adaptive Tutoring Session',
        status: 'active',
        currentScore: 35,
        dominantStrategy: 'visual',
        totalInteractions: 0,
        startedAt: new Date()
      };
      inMemorySessions[sid] = session;
    }

    return res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

const getSessionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let session = await Session.findById(id).catch(() => null);
    let interactions = [];

    if (session) {
      interactions = await Interaction.find({ sessionId: id }).sort({ createdAt: 1 });
    } else {
      session = inMemorySessions[id] || inMemorySessions['session-demo-001'];
      interactions = inMemoryInteractions;
    }

    return res.json({
      success: true,
      session,
      interactions
    });
  } catch (error) {
    next(error);
  }
};

const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    let session = await Session.findById(id).catch(() => null);
    if (session) {
      session.status = 'completed';
      session.endedAt = new Date();
      await session.save();
    } else if (inMemorySessions[id]) {
      inMemorySessions[id].status = 'completed';
      inMemorySessions[id].endedAt = new Date();
      session = inMemorySessions[id];
    }

    return res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  getSessionDetails,
  completeSession,
  inMemorySessions,
  inMemoryInteractions
};
