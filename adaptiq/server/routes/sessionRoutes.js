const express = require('express');
const router = express.Router();
const {
  startSession,
  getSessionDetails,
  completeSession
} = require('../controllers/sessionController');

router.post('/start', startSession);
router.get('/:id', getSessionDetails);
router.post('/:id/complete', completeSession);

module.exports = router;
