const mongoose = require('mongoose');

const CropListingSchema = new mongoose.Schema({
  farmerId: {
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
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton', 'box', 'bag'],
    default: 'quintal'
  },
  expectedPricePerUnit: {
    type: Number,
    required: true
  },
  harvestDate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  locationName: {
    type: String,
    default: 'Farm Location'
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  soldQuantity: {
    type: Number,
    default: 0
  },
  targetTraderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'unlisted'],
    default: 'available'
  }
}, { timestamps: true });

CropListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CropListing', CropListingSchema);
