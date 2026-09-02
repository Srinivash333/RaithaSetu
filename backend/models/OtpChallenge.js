const mongoose = require('mongoose');

const OtpChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['LOGIN', 'REGISTRATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET'],
    default: 'LOGIN'
  },
  pendingUserData: {
    type: Object // For registration challenges prior to user creation
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastResendAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 600 } // Auto TTL cleanup
  },
  verifiedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('OtpChallenge', OtpChallengeSchema);
