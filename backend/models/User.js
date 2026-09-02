const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    default: [77.5946, 12.9716] // Default Bengaluru coordinates
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  phoneVerified: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: true
  },
  isAccountActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['farmer', 'worker', 'store', 'trader', 'admin'],
    required: [true, 'Role is required']
  },
  location: {
    type: LocationSchema,
    required: true
  },
  address: {
    type: String,
    default: 'Bengaluru, Karnataka, India'
  },
  languagePreference: {
    type: String,
    enum: ['en', 'kn'],
    default: 'en'
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  if (this.mobileNumber && !this.phone) {
    this.phone = this.mobileNumber;
  } else if (this.phone && !this.mobileNumber) {
    this.mobileNumber = this.phone;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);