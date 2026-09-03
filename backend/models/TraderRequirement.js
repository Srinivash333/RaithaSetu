const mongoose = require('mongoose');

const TraderRequirementSchema = new mongoose.Schema({
  traderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
    default: 'Standard'
  },
  quantityNeeded: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton', 'box', 'bag'],
    default: 'quintal'
  },
  offeredPricePerUnit: {
    type: Number,
    required: true
  },
  preferredLocation: {
    type: String,
    default: 'Karnataka'
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('TraderRequirement', TraderRequirementSchema);
