const mongoose = require('mongoose');

const StoreProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  productCategories: [{
    type: String,
    trim: true
  }],
  isDeliveryAvailable: {
    type: Boolean,
    default: true
  },
  deliveryRadiusKm: {
    type: Number,
    default: 15
  },
  ownerName: {
    type: String,
    default: ''
  },
  shopDescription: {
    type: String,
    default: 'Quality agricultural inputs, seeds, fertilizers, pesticides and farming tools.'
  },
  contactNumber: {
    type: String,
    default: ''
  },
  openingHours: {
    type: String,
    default: '8:00 AM - 8:00 PM'
  },
  shopStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  shopImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
  },
  storeAddress: {
    type: String,
    default: ''
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreProfile', StoreProfileSchema);
