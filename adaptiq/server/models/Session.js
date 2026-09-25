const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Student',
    required: true
  },
  topicId: {
    type: String,
    required: true,
    default: 'recursion-foundations'
  },
  title: {
    type: String,
    default: 'Recursion Call Stacks & Return Flow'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  currentScore: {
    type: Number,
    default: 35 // Demo seed: 35% Recursion error
  },
  dominantStrategy: {
    type: String,
    default: 'visual'
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Session', SessionSchema);
