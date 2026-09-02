const mongoose = require('mongoose');

const OfferItemSchema = new mongoose.Schema({
  offeredBy: {
    type: String,
    enum: ['trader', 'farmer'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const NegotiationSchema = new mongoose.Schema({
  cropListingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropListing',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  traderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initialAskingPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  status: {
    type: String,
    enum: ['pending', 'countered', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  currentPrice: {
    type: Number,
    required: true
  },
  finalTotalAmount: {
    type: Number,
    required: true
  },
  offerHistory: [OfferItemSchema],
  dealConfirmed: {
    type: Boolean,
    default: false
  },
  confirmedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Negotiation', NegotiationSchema);
