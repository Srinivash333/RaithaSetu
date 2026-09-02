const Review = require('../models/Review');
const WorkerProfile = require('../models/WorkerProfile');
const StoreProfile = require('../models/StoreProfile');

exports.createReview = async (req, res) => {
  try {
    const { targetId, targetRole, transactionType, transactionId, rating, comment } = req.body;

    // Prevent duplicate review for the same transaction
    const existing = await Review.findOne({ reviewerId: req.user._id, transactionId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already submitted a review for this transaction' });
    }

    const review = await Review.create({
      reviewerId: req.user._id,
      targetId,
      targetRole,
      transactionType,
      transactionId,
      rating: Number(rating),
      comment: comment || ''
    });

    // Update target user's average rating in profile
    if (targetRole === 'worker') {
      const allReviews = await Review.find({ targetId, targetRole: 'worker' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await WorkerProfile.findOneAndUpdate(
        { userId: targetId },
        { ratingAverage: Math.round(avg * 10) / 10, ratingCount: allReviews.length }
      );
    } else if (targetRole === 'store') {
      const allReviews = await Review.find({ targetId, targetRole: 'store' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await StoreProfile.findOneAndUpdate(
        { userId: targetId },
        { ratingAverage: Math.round(avg * 10) / 10, ratingCount: allReviews.length }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to submit review' });
  }
};

exports.getReviewsForTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    const reviews = await Review.find({ targetId })
      .populate('reviewerId', 'name role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};
