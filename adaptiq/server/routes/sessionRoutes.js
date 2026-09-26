const express = require('express');
const router = express.Router();
const {
  startSession,
  getSessionDetails,
  completeSession,
  getHistory
} = require('../controllers/sessionController');

router.get('/history/all', getHistory);
router.post('/start', startSession);
router.get('/:id', getSessionDetails);
router.post('/:id/complete', completeSession);

module.exports = router;
