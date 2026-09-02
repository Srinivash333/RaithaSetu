const express = require('express');
const router = express.Router();
const { getWorkerRecommendations, getWageEstimate } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/workers/:jobId', protect, getWorkerRecommendations);
router.post('/wages/estimate', getWageEstimate);

module.exports = router;
