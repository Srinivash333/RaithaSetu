const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getMyPostedJobs, updateJobStatus } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/my-posted', protect, authorize('farmer'), getMyPostedJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('farmer'), createJob);
router.patch('/:id/status', protect, authorize('farmer'), updateJobStatus);

module.exports = router;
