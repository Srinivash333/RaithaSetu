const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Job = require('../models/Job');

// Calculate Haversine distance in Km
const calculateDistanceKm = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

// Calculate transparent score and explanation for worker matching
exports.rankWorkersForJob = async (jobId, options = {}) => {
  const job = await Job.findById(jobId).populate('farmerId');
  if (!job) throw new Error('Job not found');

  // Fetch available workers
  const workerProfiles = await WorkerProfile.find({ isAvailable: true }).populate('userId');

  const rankedWorkers = workerProfiles.map(profile => {
    const workerUser = profile.userId;
    if (!workerUser) return null;

    // Gender Filter / Preference Check
    const pref = (job.genderPreference || 'ANY').toUpperCase();
    const workerGender = (profile.gender || workerUser.gender || 'Unspecified').toString().toLowerCase();

    if (pref === 'MALE' && workerGender === 'female') {
      return null; // Exclude female workers when job specifically requests Male
    }
    if (pref === 'FEMALE' && workerGender === 'male') {
      return null; // Exclude male workers when job specifically requests Female
    }

    // 1. Distance Calculation (Max 25km radius preferred)
    const distanceKm = calculateDistanceKm(job.location.coordinates, workerUser.location.coordinates);
    let distanceScore = 0;
    if (distanceKm <= 5) distanceScore = 100;
    else if (distanceKm <= 10) distanceScore = 85;
    else if (distanceKm <= 20) distanceScore = 70;
    else if (distanceKm <= 35) distanceScore = 50;
    else distanceScore = 20;

    // 2. Skill Match Score
    const requiredSkills = job.requiredSkills || [];
    let matchedSkills = [];
    let skillScore = 70; // Base skill score

    if (requiredSkills.length > 0) {
      matchedSkills = profile.skills.filter(s =>
        requiredSkills.some(req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase()))
      );
      skillScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      if (skillScore > 100) skillScore = 100;
    }

    // 3. Work Experience Score
    const years = profile.experienceYears || 1;
    let experienceScore = Math.min(100, years * 20);

    // 4. Rating Score (scale 1 to 5 -> 20 to 100)
    const ratingScore = Math.round((profile.ratingAverage / 5) * 100);

    // 5. Wage Compatibility Score
    const wageDiff = job.wage - profile.expectedWagePerDay;
    let wageScore = 100;
    if (wageDiff < 0) {
      // Offered wage is lower than expected
      const pct = Math.abs(wageDiff) / profile.expectedWagePerDay;
      wageScore = Math.max(20, Math.round(100 - (pct * 100)));
    }

    // Weighted Overall Score Formula
    // Skill: 30%, Experience: 20%, Distance: 20%, Availability: 10%, Rating: 10%, History: 5%, Wage: 5%
    const totalScore = Math.round(
      (skillScore * 0.30) +
      (experienceScore * 0.20) +
      (distanceScore * 0.20) +
      (100 * 0.10) + // Available
      (ratingScore * 0.10) +
      (Math.min(100, profile.completedJobsCount * 10) * 0.05) +
      (wageScore * 0.05)
    );

    // Generate Natural Language Match Explanation
    const reasons = [];
    if (matchedSkills.length > 0) {
      reasons.push(`skilled in ${matchedSkills.join(', ')}`);
    } else {
      reasons.push(`experienced in general ${job.workType}`);
    }
    reasons.push(`located ${distanceKm} km away`);
    reasons.push(`rated ${profile.ratingAverage}/5 stars`);
    if (years >= 2) reasons.push(`${years} years of farm experience`);

    const explanation = `Recommended because this worker is ${reasons.join(', ')}, and is currently available for work.`;

    return {
      worker: {
        _id: workerUser._id,
        name: workerUser.name,
        phone: workerUser.phone,
        email: workerUser.email,
        address: workerUser.address,
        avatar: workerUser.avatar
      },
      profile: {
        skills: profile.skills,
        experienceYears: profile.experienceYears,
        expectedWagePerDay: profile.expectedWagePerDay,
        ratingAverage: profile.ratingAverage,
        completedJobsCount: profile.completedJobsCount,
        isAvailable: profile.isAvailable,
        gender: profile.gender || workerUser.gender || 'Unspecified'
      },
      matchPercentage: totalScore,
      distanceKm,
      breakdown: {
        skillMatchPct: skillScore,
        experienceYears: years,
        distanceKm,
        rating: `${profile.ratingAverage}/5`,
        availability: 'Available',
        wageCompatibilityPct: wageScore
      },
      explanation
    };
  }).filter(Boolean);

  // Sort by match percentage descending
  rankedWorkers.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return rankedWorkers;
};

// Baseline AI wage estimation based on crop, work type, location, and skills
exports.estimateWage = (params) => {
  const { crop, workType, duration, skillLevel, locationName } = params;

  let baseRate = 600; // Base daily rate in INR

  // Work type adjustment
  const workTypeRates = {
    'Harvesting': 750,
    'Sowing': 650,
    'Pesticide Spraying': 800,
    'Tilling': 700,
    'Irrigation': 600,
    'Weeding': 550,
    'General Labour': 600
  };

  if (workTypeRates[workType]) {
    baseRate = workTypeRates[workType];
  }

  // Crop multiplier
  if (crop && ['Cotton', 'Sugarcane', 'Arecanut', 'Coffee'].includes(crop)) {
    baseRate += 100;
  }

  // Duration multiplier adjustment
  let estimatedMin = Math.round(baseRate * 0.9);
  let estimatedMax = Math.round(baseRate * 1.15);
  let suggested = Math.round(baseRate);

  let explanation = `Estimated fair market wage based on regional agricultural trends for ${workType || 'agricultural work'} in ${crop || 'general crops'}. Higher complexity tasks like pesticide application or specialty crop harvesting carry a premium.`;

  return {
    crop: crop || 'General Crop',
    workType: workType || 'Daily Labour',
    duration: duration || 'Daily',
    minWage: estimatedMin,
    maxWage: estimatedMax,
    suggestedWage: suggested,
    currency: 'INR',
    unit: duration === 'Hourly' ? '/ hour' : '/ day',
    explanation
  };
};
