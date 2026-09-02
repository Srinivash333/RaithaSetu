const mongoose = require('mongoose');

const AgroProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 10
  },
  unit: {
    type: String,
    default: 'packet'
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AgroProduct', AgroProductSchema);
