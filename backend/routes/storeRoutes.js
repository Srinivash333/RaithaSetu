const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById, updateStoreProfile } = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllStores);
router.get('/:id', getStoreById);
router.put('/profile', protect, authorize('store'), updateStoreProfile);

module.exports = router;
