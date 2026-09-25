const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Student',
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  studentPrompt: {
    type: String,
    required: true
  },
  diagnosis: {
    understandingScore: { type: Number, required: true },
    misconceptionDetected: { type: Boolean, default: false },
    misconceptionKey: { type: String, default: null },
    diagnosisSummary: { type: String, default: '' },
    confidenceScore: { type: Number, default: 0.8 }
  },
  strategyUsed: {
    type: String,
    required: true
  },
  dnaSnapshot: {
    socratic: Number,
    analogical: Number,
    firstPrinciples: Number,
    visual: Number,
    codeExecution: Number
  },
  tutorResponse: {
    headline: String,
    coreExplanation: String,
    visualDiagram: String,
    analogyMetaphor: String,
    codeSnippet: String,
    socraticCheck: String,
    practicePrompt: {
      question: String,
      options: [String],
      correctIndex: Number,
      hint: String
    }
  },
  modelSource: {
    type: String,
    enum: ['gemini-2.5', 'gemma', 'gemma-3 (local)', 'groq-fallback', 'heuristic-engine', 'offline-fallback'],
    default: 'offline-fallback'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interaction', InteractionSchema);
