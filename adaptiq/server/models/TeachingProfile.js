const mongoose = require('mongoose');

const TeachingProfileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  dna: {
    socratic: { type: Number, default: 20 },
    analogical: { type: Number, default: 20 },
    firstPrinciples: { type: Number, default: 20 },
    visual: { type: Number, default: 20 },
    codeExecution: { type: Number, default: 20 }
  },
  // Multi-Armed Bandit tracking weights (exploration vs exploitation)
  strategyRewards: {
    socratic: { attempts: { type: Number, default: 1 }, totalReward: { type: Number, default: 0.5 } },
    analogical: { attempts: { type: Number, default: 1 }, totalReward: { type: Number, default: 0.5 } },
    firstPrinciples: { attempts: { type: Number, default: 1 }, totalReward: { type: Number, default: 0.5 } },
    visual: { attempts: { type: Number, default: 1 }, totalReward: { type: Number, default: 0.5 } },
    codeExecution: { attempts: { type: Number, default: 1 }, totalReward: { type: Number, default: 0.5 } }
  },
  cognitiveLoad: {
    type: Number,
    default: 45 // 0-100 scale
  },
  learningPace: {
    type: String,
    enum: ['steady', 'accelerated', 'deep_reflective'],
    default: 'steady'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TeachingProfile', TeachingProfileSchema);
