const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Aarav Sharma'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    default: 'aarav.sharma@kalasala.edu'
  },
  gradeLevel: {
    type: String,
    default: 'Undergraduate CS - Year 2'
  },
  currentTopicId: {
    type: String,
    default: 'recursion-foundations'
  },
  overallMastery: {
    type: Number,
    default: 42 // Demo starting level
  },
  activeMisconceptions: [
    {
      tag: String,
      topicId: String,
      detectedAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
