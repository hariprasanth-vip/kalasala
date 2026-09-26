const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  getAllStudents,
  updateStudentProfile,
  loginStudent,
  registerStudent,
  getStudentDna,
  updateStudentDna,
  resetStudentDna,
  getCurriculum
} = require('../controllers/studentController');

// Curriculum listing
router.get('/curriculum', getCurriculum);

// Authentication & Student Management
router.post('/login', loginStudent);
router.post('/register', registerStudent);
router.get('/all', getAllStudents);

// Student profile & DNA endpoints
router.get('/:id/dna', getStudentDna);
router.put('/:id/dna', updateStudentDna);
router.post('/:id/reset-dna', resetStudentDna);
router.get('/:id', getStudentProfile);
router.put('/:id', updateStudentProfile);

module.exports = router;
