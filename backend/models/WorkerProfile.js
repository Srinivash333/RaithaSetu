const mongoose = require('mongoose');

const WorkerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceYears: {
    type: Number,
    default: 1
  },
  preferredWorkTypes: [{
    type: String,
    trim: true
  }],
  expectedWagePerDay: {
    type: Number,
    default: 500
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preferredDistanceKm: {
    type: Number,
    default: 25
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  completedJobsCount: {
    type: Number,
    default: 0
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Unspecified'],
    default: 'Unspecified'
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkerProfile', WorkerProfileSchema);
