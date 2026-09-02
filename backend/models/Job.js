const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  crop: {
    type: String,
    required: [true, 'Crop is required'],
    trim: true
  },
  workType: {
    type: String,
    required: [true, 'Work type is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  workersNeeded: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  locationName: {
    type: String,
    default: 'Farm Location'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: String,
    enum: ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Seasonal', 'Yearly'],
    default: 'Daily'
  },
  wage: {
    type: Number,
    required: [true, 'Wage is required']
  },
  status: {
    type: String,
    enum: ['open', 'applications_received', 'worker_selected', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  genderPreference: {
    type: String,
    enum: ['ANY', 'MALE', 'FEMALE'],
    default: 'ANY'
  }
}, { timestamps: true });

JobSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Job', JobSchema);
