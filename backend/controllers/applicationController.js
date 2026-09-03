const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const WorkerProfile = require('../models/WorkerProfile');

// Worker applies for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, note } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Job is no longer open for applications' });
    }

    const existingApp = await Application.findOne({ jobId, workerId: req.user._id });
    if (existingApp) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job' });
    }

    const application = await Application.create({
      jobId,
      workerId: req.user._id,
      farmerId: job.farmerId,
      status: 'applied',
      note: note || ''
    });

    if (job.status === 'open') {
      job.status = 'applications_received';
      await job.save();
    }

    // Send notification to Farmer
    await Notification.create({
      userId: job.farmerId,
      title: 'New Job Application',
      message: `${req.user.name} applied for your job: "${job.title}"`,
      type: 'job_application'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to submit application' });
  }
};

// Get applications submitted by logged-in worker
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'farmerId', select: 'name phone email location' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get Worker Applications Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
};

// Get applications for a specific job (Farmer view)
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ jobId })
      .populate('workerId', 'name phone email location address')
      .sort({ createdAt: -1 })
      .lean();

    // Attach worker profile details (skills, rating, etc.)
    const enrichedApplications = await Promise.all(applications.map(async app => {
      const profile = await WorkerProfile.findOne({ userId: app.workerId._id }).lean();
      return {
        ...app,
        workerProfile: profile
      };
    }));

    res.status(200).json({
      success: true,
      count: enrichedApplications.length,
      applications: enrichedApplications
    });
  } catch (error) {
    console.error('Get Job Applicants Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job applicants' });
  }
};

// Update application status (Farmer accepts/rejects/shortlists)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this application' });
    }

    application.status = status;
    await application.save();

    const job = await Job.findById(application.jobId._id);
    if (status === 'accepted') {
      if (!Array.isArray(job.selectedWorkerIds)) {
        job.selectedWorkerIds = [];
      }
      if (!job.selectedWorkerIds.some(wId => wId && wId.toString() === application.workerId.toString())) {
        job.selectedWorkerIds.push(application.workerId);
      }
      job.status = 'worker_selected';
      await job.save();

      // Notify Worker
      await Notification.create({
        userId: application.workerId,
        title: 'Application Accepted!',
        message: `Your application for job "${job.title}" has been accepted by the farmer.`,
        type: 'job_accepted'
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update application status' });
  }
};

// Farmer sends job offer to a matched worker
exports.sendJobOffer = async (req, res) => {
  try {
    const { jobId, workerId, note } = req.body;

    if (!jobId || !workerId) {
      return res.status(400).json({ success: false, error: 'Job ID and Worker ID are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const isOwner = job.farmerId.toString() === req.user._id.toString();
    const isFarmer = (req.user.role || '').toLowerCase() === 'farmer' || (req.user.role || '').toLowerCase() === 'admin';

    if (!isOwner && !isFarmer) {
      return res.status(403).json({ success: false, error: 'Not authorized to send an offer for this job' });
    }

    if (!isOwner && isFarmer) {
      // Re-assign demo job to current authenticated farmer
      job.farmerId = req.user._id;
      await job.save();
    }

    let application = await Application.findOne({ jobId, workerId });
    if (application) {
      if (application.status === 'offered') {
        return res.status(409).json({
          success: false,
          error: 'Job offer already sent to this worker.',
          application
        });
      }
      application.status = 'offered';
      if (note) application.note = note;
      await application.save();
    } else {
      application = await Application.create({
        jobId,
        workerId,
        farmerId: req.user._id,
        status: 'offered',
        note: note || `Job offer sent by farmer for ${job.title}`
      });
    }

    // Safely send notification to Worker (never fails the offer transaction)
    try {
      await Notification.create({
        userId: workerId,
        title: 'New Job Offer Received! 🌾',
        message: `${req.user.name} sent you a job offer for "${job.title}" at ₹${job.wage}/${job.duration || 'day'}`,
        type: 'job_offer'
      });
    } catch (notifErr) {
      console.error('Non-fatal Notification Error:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Job offer sent successfully',
      application
    });
  } catch (error) {
    console.error('Send Job Offer Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send job offer' });
  }
};

// Worker responds to job offer (accept/reject)
exports.respondJobOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected' / 'declined'

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, status: 404, error: 'Job offer not found' });
    }

    const isWorkerUser = (req.user.role || '').toLowerCase() === 'worker' || (req.user.role || '').toLowerCase() === 'admin';
    const isTargetWorker = application.workerId.toString() === req.user._id.toString();

    if (!isTargetWorker && !isWorkerUser) {
      return res.status(403).json({ success: false, status: 403, error: 'Not authorized to respond to this offer' });
    }

    // Re-assign application workerId to current authenticated worker user if necessary
    if (!isTargetWorker && isWorkerUser) {
      application.workerId = req.user._id;
    }

    const job = await Job.findById(application.jobId._id || application.jobId);
    if (!job) {
      return res.status(404).json({ success: false, status: 404, error: 'Associated job not found' });
    }

    const targetStatus = (status || '').toLowerCase();

    if (targetStatus === 'accepted') {
      if (!Array.isArray(job.selectedWorkerIds)) {
        job.selectedWorkerIds = [];
      }
      const isAlreadySelected = job.selectedWorkerIds.some(wId => wId && wId.toString() === req.user._id.toString());
      
      const maxWorkers = job.workersNeeded || 1;
      if (!isAlreadySelected && job.selectedWorkerIds.length >= maxWorkers) {
        return res.status(409).json({
          success: false,
          status: 409,
          error: 'This job no longer has available worker positions.'
        });
      }

      application.status = 'accepted';
      await application.save();

      if (!isAlreadySelected) {
        job.selectedWorkerIds.push(req.user._id);
      }

      const totalAccepted = job.selectedWorkerIds.length;
      job.status = totalAccepted >= maxWorkers ? 'completed' : 'worker_selected';
      await job.save();

      // Safely increment worker completed/selected count
      try {
        await WorkerProfile.findOneAndUpdate(
          { userId: req.user._id },
          { $inc: { completedJobsCount: 1 } }
        );
      } catch (profErr) {
        console.error('WorkerProfile update warning:', profErr.message);
      }

      // Safe Notify Farmer
      try {
        await Notification.create({
          userId: application.farmerId,
          title: 'Job Offer Accepted! 🤝',
          message: `${req.user.name} accepted your job offer for "${job.title}"`,
          type: 'offer_accepted'
        });
      } catch (notifErr) {
        console.error('Non-fatal Notification Error:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Job offer accepted successfully',
        application
      });

    } else if (targetStatus === 'rejected' || targetStatus === 'declined') {
      application.status = 'rejected';
      await application.save();

      // Safe Notify Farmer
      try {
        await Notification.create({
          userId: application.farmerId,
          title: 'Job Offer Declined',
          message: `${req.user.name} declined your job offer for "${job.title}"`,
          type: 'offer_declined'
        });
      } catch (notifErr) {
        console.error('Non-fatal Notification Error:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Job offer declined successfully',
        application
      });
    }

    return res.status(400).json({ success: false, status: 400, error: 'Invalid response status' });

  } catch (error) {
    console.error('Respond Job Offer Error:', error);
    return res.status(500).json({ success: false, status: 500, error: error.message || 'Unable to accept the job offer. Please try again.' });
  }
};
