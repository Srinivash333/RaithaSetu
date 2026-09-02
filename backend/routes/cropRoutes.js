const express = require('express');
const router = express.Router();
const { createCropListing, getCropListings, getMyCropListings } = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCropListings);
router.get('/my-listings', protect, authorize('farmer'), getMyCropListings);
router.post('/', protect, authorize('farmer'), createCropListing);

module.exports = router;
