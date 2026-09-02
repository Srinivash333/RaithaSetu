const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'offered', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'completed'],
    default: 'applied'
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
