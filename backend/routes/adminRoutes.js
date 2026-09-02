const express = require('express');
const router = express.Router();
const { getAdminDashboard } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
