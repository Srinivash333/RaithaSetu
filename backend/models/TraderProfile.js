const mongoose = require('mongoose');

const TraderProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  interestedCrops: [{
    type: String,
    trim: true
  }],
  ownerName: {
    type: String,
    default: ''
  },
  businessDescription: {
    type: String,
    default: 'Licensed APMC wholesale commodity trading firm specializing in direct farm crop procurement.'
  },
  businessLocation: {
    type: String,
    default: 'Mysuru Wholesale APMC Yard'
  },
  contactNumber: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    default: 'APMC Wholesale Grain & Produce Buyer'
  },
  openingHours: {
    type: String,
    default: '7:00 AM - 7:00 PM'
  },
  businessStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  businessImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'
  },
  purchaseCapacity: {
    type: String,
    default: 'Medium (10-50 Quintals)'
  }
}, { timestamps: true });

module.exports = mongoose.model('TraderProfile', TraderProfileSchema);
