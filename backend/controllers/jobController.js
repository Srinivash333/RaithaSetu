const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Calculate Haversine distance between two [lng, lat] pairs in kilometers
const calculateDistanceKm = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

// Create a new job (Farmer only)
exports.createJob = async (req, res) => {
  try {
    const { title, crop, workType, description, requiredSkills, workersNeeded, locationName, startDate, duration, wage, latitude, longitude, genderPreference } = req.body;

    let validGender = 'ANY';
    if (genderPreference) {
      const gInput = genderPreference.toString().toUpperCase();
      if (['ANY', 'MALE', 'FEMALE'].includes(gInput)) {
        validGender = gInput;
      }
    }

    const coords = [
      longitude ? parseFloat(longitude) : req.user.location.coordinates[0],
      latitude ? parseFloat(latitude) : req.user.location.coordinates[1]
    ];

    const job = await Job.create({
      farmerId: req.user._id,
      title,
      crop,
      workType,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      workersNeeded: Number(workersNeeded) || 1,
      genderPreference: validGender,
      location: {
        type: 'Point',
        coordinates: coords
      },
      locationName: locationName || req.user.address || 'Farm Location',
      startDate: startDate || new Date(),
      duration: duration || 'Daily',
      wage: Number(wage)
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create job' });
  }
};

// Get jobs (Worker / Farmer / General) with filters & geospatial calculation
exports.getJobs = async (req, res) => {
  try {
    const { crop, workType, maxDistanceKm, duration, status, latitude, longitude } = req.query;
    let query = {};

    if (crop) query.crop = new RegExp(crop, 'i');
    if (workType) query.workType = new RegExp(workType, 'i');
    if (duration) query.duration = duration;
    if (status) query.status = status;
    else query.status = { $in: ['open', 'applications_received', 'worker_selected', 'in_progress'] };

    let userCoords = req.user && req.user.location ? req.user.location.coordinates : [77.5946, 12.9716];
    if (longitude && latitude) {
      userCoords = [parseFloat(longitude), parseFloat(latitude)];
    }

    if (maxDistanceKm) {
      const maxDistanceMeters = parseFloat(maxDistanceKm) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoords
          },
          $maxDistance: maxDistanceMeters
        }
      };
    }

    const jobs = await Job.find(query)
      .populate('farmerId', 'name phone email address location')
      .sort({ createdAt: -1 })
      .lean();

    // Attach distance calculation for display
    const jobsWithDistance = jobs.map(job => {
      const dist = calculateDistanceKm(userCoords, job.location.coordinates);
      return {
        ...job,
        distanceKm: dist
      };
    });

    res.status(200).json({
      success: true,
      count: jobsWithDistance.length,
      jobs: jobsWithDistance
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
};

// Get single job details with applicants count
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('farmerId', 'name phone email address location')
      .populate('selectedWorkerIds', 'name phone email location')
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const applicationsCount = await Application.countDocuments({ jobId: job._id });

    let distanceKm = null;
    if (req.user && req.user.location) {
      distanceKm = calculateDistanceKm(req.user.location.coordinates, job.location.coordinates);
    }

    res.status(200).json({
      success: true,
      job: {
        ...job,
        applicationsCount,
        distanceKm
      }
    });
  } catch (error) {
    console.error('Get Job By Id Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job details' });
  }
};

// Get jobs created by logged-in farmer
exports.getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithCounts = await Promise.all(jobs.map(async job => {
      const applicantCount = await Application.countDocuments({ jobId: job._id });
      return {
        ...job,
        applicantCount
      };
    }));

    res.status(200).json({
      success: true,
      jobs: jobsWithCounts
    });
  } catch (error) {
    console.error('Get My Jobs Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch farmer jobs' });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this job' });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    console.error('Update Job Status Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update job status' });
  }
};
