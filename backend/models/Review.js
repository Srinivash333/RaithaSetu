const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    enum: ['farmer', 'worker', 'store', 'trader'],
    required: true
  },
  transactionType: {
    type: String,
    enum: ['job', 'crop_order', 'store_order'],
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

ReviewSchema.index({ reviewerId: 1, transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
