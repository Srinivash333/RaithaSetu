const express = require('express');
const router = express.Router();
const { 
  getAllTraders, getTraderById, updateTraderProfile,
  createRequirement, getRequirements, deleteRequirement 
} = require('../controllers/traderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllTraders);
router.get('/requirements', getRequirements);
router.post('/requirements', protect, authorize('trader'), createRequirement);
router.delete('/requirements/:reqId', protect, authorize('trader'), deleteRequirement);
router.get('/:id', getTraderById);
router.put('/profile', protect, authorize('trader'), updateTraderProfile);

module.exports = router;

