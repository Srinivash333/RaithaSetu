const express = require('express');
const router = express.Router();
const { sendMessage, getJobWorkerMessages, getMyMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/my-messages', protect, getMyMessages);
router.get('/job/:jobId/worker/:workerId', protect, getJobWorkerMessages);

module.exports = router;
