const Student = require('../models/Student');
const TeachingProfile = require('../models/TeachingProfile');
const { defaultCurriculum } = require('../constants/defaultCurriculum');
const { DEFAULT_DNA } = require('../services/strategyService');

// In-memory demo store in case MongoDB is temporarily offline
let inMemoryStudent = {
  _id: '65f000000000000000000001',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@kalasala.edu',
  gradeLevel: 'Undergraduate CS - Year 2',
  currentTopicId: 'recursion-foundations',
  overallMastery: 42,
  activeMisconceptions: [
    {
      tag: 'unwinding_amnesia',
      topicId: 'recursion-foundations',
      detectedAt: new Date(),
      resolved: false
    }
  ]
};

let inMemoryProfile = {
  studentId: '65f000000000000000000001',
  dna: {
    socratic: 15,
    analogical: 25,
    firstPrinciples: 15,
    visual: 35, // Demo preset: Visual-forward for call stacks!
    codeExecution: 10
  },
  cognitiveLoad: 48,
  learningPace: 'steady'
};

const getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).catch(() => null);
    if (!student) {
      return res.json({ success: true, student: inMemoryStudent, source: 'fallback-cache' });
    }
    return res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

const getStudentDna = async (req, res, next) => {
  try {
    const profile = await TeachingProfile.findOne({ studentId: req.params.id }).catch(() => null);
    if (!profile) {
      return res.json({ success: true, profile: inMemoryProfile, source: 'fallback-cache' });
    }
    return res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const updateStudentDna = async (req, res, next) => {
  try {
    const { dna, cognitiveLoad } = req.body;
    let profile = await TeachingProfile.findOne({ studentId: req.params.id }).catch(() => null);

    if (profile) {
      if (dna) profile.dna = { ...profile.dna, ...dna };
      if (cognitiveLoad !== undefined) profile.cognitiveLoad = cognitiveLoad;
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      if (dna) inMemoryProfile.dna = { ...inMemoryProfile.dna, ...dna };
      if (cognitiveLoad !== undefined) inMemoryProfile.cognitiveLoad = cognitiveLoad;
      profile = inMemoryProfile;
    }

    return res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const getCurriculum = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      curriculum: defaultCurriculum
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProfile,
  getStudentDna,
  updateStudentDna,
  getCurriculum,
  inMemoryStudent,
  inMemoryProfile
};
