const mongoose = require('mongoose');

const FarmerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cropsGrown: [{
    type: String,
    trim: true
  }],
  farmSizeAcres: {
    type: Number,
    default: 1
  },
  farmingExperienceYears: {
    type: Number,
    default: 1
  },
  farmLocationName: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('FarmerProfile', FarmerProfileSchema);
