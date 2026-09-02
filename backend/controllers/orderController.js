const Order = require('../models/Order');
const AgroProduct = require('../models/AgroProduct');
const CropListing = require('../models/CropListing');
const Notification = require('../models/Notification');

// Create Order with simulated payment & stock management
exports.createOrder = async (req, res) => {
  try {
    const { sellerId, orderType, items, totalAmount, shippingAddress, deliveryOption, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order items cannot be empty' });
    }

    // If agro product order, validate stock and decrement inventory
    if (orderType === 'agro_product') {
      for (const item of items) {
        if (item.itemId) {
          const product = await AgroProduct.findById(item.itemId);
          if (!product) {
            return res.status(400).json({ success: false, error: `Product "${item.name || 'item'}" no longer exists` });
          }
          if (product.stockQuantity < item.quantity) {
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for "${product.productName}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
            });
          }
        }
      }

      // Deduct stock safely
      for (const item of items) {
        if (item.itemId) {
          const prod = await AgroProduct.findById(item.itemId);
          if (prod) {
            const newStock = Math.max(0, prod.stockQuantity - Number(item.quantity));
            prod.stockQuantity = newStock;
            prod.inStock = newStock > 0;
            await prod.save();
          }
        }
      }
    }

    const order = await Order.create({
      buyerId: req.user._id,
      sellerId,
      orderType: orderType || 'agro_product',
      items,
      totalAmount: Number(totalAmount),
      shippingAddress: deliveryOption === 'store_pickup' ? '' : (shippingAddress || req.user.address || ''),
      deliveryOption: deliveryOption || 'store_delivery',
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: paymentMethod === 'cod' ? 'pending_cod' : 'demo_paid',
      orderStatus: 'pending' // Starts in PENDING state awaiting Store Owner acceptance
    });

    // Notify Seller
    await Notification.create({
      userId: sellerId,
      title: 'New Customer Order Received',
      message: `You received a new order (#${order._id.toString().slice(-6).toUpperCase()}) from ${req.user.name}`,
      type: 'order_status'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Awaiting store confirmation.',
      order
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to place order' });
  }
};

// Get User's Orders (as buyer or seller)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
    })
      .populate('buyerId', 'name phone mobileNumber email address')
      .populate('sellerId', 'name phone mobileNumber email address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order history' });
  }
};

// Update Order Status (Accept/Reject/Progress)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.sellerId.toString() !== req.user._id.toString() && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this order' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    await order.save();

    // If order was rejected or cancelled, restore product stock
    if ((orderStatus === 'rejected' || orderStatus === 'cancelled') && previousStatus !== 'rejected' && previousStatus !== 'cancelled') {
      if (order.orderType === 'agro_product' && order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.itemId) {
            const prod = await AgroProduct.findById(item.itemId);
            if (prod) {
              prod.stockQuantity += Number(item.quantity || 1);
              prod.inStock = true;
              await prod.save();
            }
          }
        }
      }
    }

    // Notify buyer about status update
    await Notification.create({
      userId: order.buyerId,
      title: 'Order Status Update',
      message: `Your order (#${order._id.toString().slice(-6).toUpperCase()}) status is now: ${orderStatus.toUpperCase()}`,
      type: 'order_status'
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};
