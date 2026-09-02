const express = require('express');
const router = express.Router();
const { createReview, getReviewsForTarget } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/target/:targetId', getReviewsForTarget);

module.exports = router;
