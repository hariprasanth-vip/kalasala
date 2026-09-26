const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Sharvesh'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    default: 'sharvesh@adaptiq.com'
  },
  password: {
    type: String,
    default: 'adaptiq123'
  },
  studentIdNumber: {
    type: String,
    default: 'ADAPTIQ-2026'
  },
  gradeLevel: {
    type: String,
    default: 'Undergraduate Computer Science - Year 3'
  },
  currentTopicId: {
    type: String,
    default: 'recursion-foundations'
  },
  overallMastery: {
    type: Number,
    default: 50
  },
  activeMisconceptions: [
    {
      tag: String,
      topicId: String,
      detectedAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }
  ],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
