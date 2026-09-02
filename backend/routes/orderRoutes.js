const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.patch('/:id/status', protect, updateOrderStatus);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
