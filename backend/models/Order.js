const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: String,
  category: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderType: {
    type: String,
    enum: ['crop_purchase', 'agro_product'],
    required: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: String,
    default: ''
  },
  deliveryOption: {
    type: String,
    enum: ['store_delivery', 'store_pickup', 'trader_pickup'],
    default: 'store_delivery'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'cod'],
    default: 'upi'
  },
  paymentStatus: {
    type: String,
    enum: ['demo_paid', 'pending_cod', 'failed'],
    default: 'demo_paid'
  },
  orderStatus: {
    type: String,
    enum: ['new', 'pending', 'accepted', 'completed', 'cancelled', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'ready_for_collection', 'collected', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
