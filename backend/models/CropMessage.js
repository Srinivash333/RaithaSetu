const mongoose = require('mongoose');

const CropMessageSchema = new mongoose.Schema({
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
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['farmer', 'trader'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CropMessage', CropMessageSchema);
