const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  getStudentDna,
  updateStudentDna,
  getCurriculum
} = require('../controllers/studentController');

// Curriculum listing
router.get('/curriculum', getCurriculum);

// Student profile & DNA endpoints
router.get('/:id/dna', getStudentDna);
router.put('/:id/dna', updateStudentDna);
router.get('/:id', getStudentProfile);

module.exports = router;
