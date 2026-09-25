const express = require('express');
const router = express.Router();
const { diagnoseStudentInput, processStudentInteraction, verifyStudentAnswer } = require('../controllers/aiController');

// Diagnose student input without committing full cycle
router.post('/diagnose', diagnoseStudentInput);

// Full adaptive pedagogical response cycle
router.post('/respond', processStudentInteraction);

// Active recall verification answer check
router.post('/verify', verifyStudentAnswer);

module.exports = router;
