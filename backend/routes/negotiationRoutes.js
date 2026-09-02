const express = require('express');
const router = express.Router();
const {
  createOffer,
  counterOffer,
  acceptOffer,
  rejectOffer,
  getNegotiationById,
  getNegotiationsForCrop,
  getMyNegotiations,
  getAIGuidance
} = require('../controllers/negotiationController');
const { protect } = require('../middleware/auth');

router.post('/offer', protect, createOffer);
router.post('/:id/counter', protect, counterOffer);
router.post('/:id/accept', protect, acceptOffer);
router.post('/:id/reject', protect, rejectOffer);
router.get('/my-negotiations', protect, getMyNegotiations);
router.get('/crop/:cropId', protect, getNegotiationsForCrop);
router.get('/:id/ai-guidance', protect, getAIGuidance);
router.get('/:id', protect, getNegotiationById);

module.exports = router;
