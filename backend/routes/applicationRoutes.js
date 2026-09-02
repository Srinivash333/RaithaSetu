const express = require('express');
const router = express.Router();
const { 
  applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus,
  sendJobOffer, respondJobOffer 
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/apply', protect, authorize('worker'), applyForJob);
router.post('/offer', protect, authorize('farmer'), sendJobOffer);
router.patch('/:id/respond', protect, authorize('worker'), respondJobOffer);
router.get('/my-applications', protect, authorize('worker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('farmer'), getJobApplicants);
router.patch('/:id/status', protect, authorize('farmer'), updateApplicationStatus);

module.exports = router;

