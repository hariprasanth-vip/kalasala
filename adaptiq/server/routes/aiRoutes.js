const express = require('express');
const router = express.Router();
const {
  diagnoseStudentInput,
  processStudentInteraction,
  verifyStudentAnswer,
  getTopicAssessment,
  submitTopicAssessment
} = require('../controllers/aiController');

// Diagnose student input without committing full cycle
router.post('/diagnose', diagnoseStudentInput);

// Full adaptive pedagogical response cycle
router.post('/respond', processStudentInteraction);

// Active recall verification answer check
router.post('/verify', verifyStudentAnswer);

// Real-time 5-Question Dynamic Assessment via Ollama
router.post('/assessment', getTopicAssessment);
router.get('/assessment', getTopicAssessment);

// Submit 5-Question Assessment and update Mastery in DB
router.post('/submit-assessment', submitTopicAssessment);

module.exports = router;
