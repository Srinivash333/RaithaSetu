const mongoose = require('mongoose');

const PendingRegistrationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  registrationData: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Automatically deleted after 15 minutes
  }
});

module.exports = mongoose.model('PendingRegistration', PendingRegistrationSchema);
