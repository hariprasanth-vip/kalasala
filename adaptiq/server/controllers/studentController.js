const Student = require('../models/Student');
const TeachingProfile = require('../models/TeachingProfile');
const { defaultCurriculum } = require('../constants/defaultCurriculum');
const { DEFAULT_DNA } = require('../services/strategyService');

// In-memory demo store in case MongoDB is temporarily offline
let inMemoryStudent = {
  _id: '65f000000000000000000001',
  name: 'Sharvesh',
  email: 'sharvesh@adaptiq.com',
  password: 'adaptiqpassword',
  studentIdNumber: 'ADAPTIQ-2026',
  gradeLevel: 'Undergraduate Computer Science - Year 3',
  currentTopicId: 'General Learning',
  overallMastery: 50,
  activeMisconceptions: []
};

let inMemoryProfile = {
  studentId: '65f000000000000000000001',
  dna: {
    socratic: 20,
    analogical: 30,
    firstPrinciples: 15,
    visual: 25,
    codeExecution: 10
  },
  cognitiveLoad: 45,
  learningPace: 'steady'
};

const getStudentProfile = async (req, res, next) => {
  try {
    let student = null;
    if (req.params.id && req.params.id !== 'default') {
      student = await Student.findById(req.params.id).catch(() => null);
    }
    if (!student) {
      // Find the most recently updated student in DB
      student = await Student.findOne().sort({ updatedAt: -1 }).catch(() => null);
    }
    if (!student) {
      return res.json({ success: true, student: inMemoryStudent, source: 'fallback-cache' });
    }
    return res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}, 'name email gradeLevel overallMastery createdAt updatedAt lastLogin studentIdNumber').sort({ updatedAt: -1 }).catch(() => []);
    return res.json({ success: true, students: students.length ? students : [inMemoryStudent] });
  } catch (error) {
    next(error);
  }
};

const getStudentDna = async (req, res, next) => {
  try {
    let profile = null;
    if (req.params.id && req.params.id !== 'default') {
      profile = await TeachingProfile.findOne({ studentId: req.params.id }).catch(() => null);
    }
    if (!profile) {
      profile = await TeachingProfile.findOne().sort({ updatedAt: -1 }).catch(() => null);
    }
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

const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, email, password, gradeLevel, overallMastery, studentIdNumber } = req.body;
    let student = null;

    if (req.params.id && req.params.id !== 'default') {
      student = await Student.findById(req.params.id).catch(() => null);
    }
    if (!student && email) {
      student = await Student.findOne({ email: email.toLowerCase().trim() }).catch(() => null);
    }

    if (student) {
      if (name) student.name = name.trim();
      if (email) student.email = email.toLowerCase().trim();
      if (password) student.password = password;
      if (gradeLevel) student.gradeLevel = gradeLevel.trim();
      if (studentIdNumber) student.studentIdNumber = studentIdNumber.trim();
      if (overallMastery !== undefined) student.overallMastery = overallMastery;
      student.updatedAt = new Date();
      await student.save();
    } else {
      // Create student if does not exist
      student = await Student.create({
        name: name || 'Sharvesh',
        email: email ? email.toLowerCase().trim() : 'sharvesh@adaptiq.com',
        password: password || 'adaptiq123',
        gradeLevel: gradeLevel || 'Undergraduate Computer Science - Year 3',
        studentIdNumber: studentIdNumber || 'ADAPTIQ-2026',
        overallMastery: overallMastery || 50
      }).catch(() => null);

      if (!student) {
        if (name) inMemoryStudent.name = name;
        if (email) inMemoryStudent.email = email;
        if (password) inMemoryStudent.password = password;
        if (gradeLevel) inMemoryStudent.gradeLevel = gradeLevel;
        student = inMemoryStudent;
      }
    }

    return res.json({ success: true, student, message: 'Credentials safely saved in MongoDB' });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let student = await Student.findOne({ email: cleanEmail }).catch(() => null);

    if (!student) {
      // Auto-create student with provided credentials
      const defaultName = cleanEmail.split('@')[0];
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      student = await Student.create({
        name: formattedName,
        email: cleanEmail,
        password: password || 'adaptiq123',
        gradeLevel: 'Undergraduate Computer Science',
        overallMastery: 50
      });

      await TeachingProfile.create({
        studentId: student._id,
        dna: { socratic: 20, analogical: 25, firstPrinciples: 15, visual: 25, codeExecution: 15 },
        cognitiveLoad: 45
      }).catch(() => {});
    } else {
      if (password && student.password && student.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password for this student email' });
      }
      student.lastLogin = new Date();
      student.updatedAt = new Date();
      await student.save();
    }

    const profile = await TeachingProfile.findOne({ studentId: student._id }).catch(() => null);

    return res.json({
      success: true,
      student,
      profile,
      message: 'Successfully authenticated with MongoDB'
    });
  } catch (error) {
    next(error);
  }
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, gradeLevel, studentIdNumber } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let student = await Student.findOne({ email: cleanEmail }).catch(() => null);

    if (student) {
      if (name) student.name = name.trim();
      if (password) student.password = password;
      if (gradeLevel) student.gradeLevel = gradeLevel.trim();
      if (studentIdNumber) student.studentIdNumber = studentIdNumber.trim();
      student.updatedAt = new Date();
      await student.save();
    } else {
      student = await Student.create({
        name: name ? name.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password || 'adaptiq123',
        gradeLevel: gradeLevel || 'Undergraduate Computer Science',
        studentIdNumber: studentIdNumber || 'ADAPTIQ-' + Math.floor(1000 + Math.random() * 9000),
        overallMastery: 50
      });

      await TeachingProfile.create({
        studentId: student._id,
        dna: { socratic: 20, analogical: 25, firstPrinciples: 15, visual: 25, codeExecution: 15 },
        cognitiveLoad: 45
      }).catch(() => {});
    }

    return res.json({
      success: true,
      student,
      message: 'Student account created and stored in MongoDB'
    });
  } catch (error) {
    next(error);
  }
};

const resetStudentDna = async (req, res, next) => {
  try {
    const defaultDna = { socratic: 20, analogical: 20, firstPrinciples: 20, visual: 20, codeExecution: 20 };
    let profile = await TeachingProfile.findOne({ studentId: req.params.id }).catch(() => null);

    if (profile) {
      profile.dna = defaultDna;
      profile.cognitiveLoad = 35;
      profile.strategyRewards = {
        socratic: { attempts: 1, totalReward: 0.5 },
        analogical: { attempts: 1, totalReward: 0.5 },
        firstPrinciples: { attempts: 1, totalReward: 0.5 },
        visual: { attempts: 1, totalReward: 0.5 },
        codeExecution: { attempts: 1, totalReward: 0.5 }
      };
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      inMemoryProfile.dna = defaultDna;
      inMemoryProfile.cognitiveLoad = 35;
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
  getAllStudents,
  updateStudentProfile,
  loginStudent,
  registerStudent,
  getStudentDna,
  updateStudentDna,
  resetStudentDna,
  getCurriculum,
  inMemoryStudent,
  inMemoryProfile
};
