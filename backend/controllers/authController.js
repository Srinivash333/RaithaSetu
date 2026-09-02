const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');
const FarmerProfile = require('../models/FarmerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const StoreProfile = require('../models/StoreProfile');
const TraderProfile = require('../models/TraderProfile');
const { generateOtp, sendEmailOtp } = require('../services/emailService');

/**
 * Mask Phone Number for Privacy (e.g. +91 9876543210 -> +91 ******3210)
 */
const maskPhoneNumber = (phone) => {
  if (!phone) return '+91 ******1234';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '******';
  const lastFour = cleaned.slice(-4);
  const prefix = cleaned.startsWith('+') ? cleaned.slice(0, 3) : '';
  return `${prefix} ******${lastFour}`;
};

/**
 * Mask Email Address for Privacy (e.g. srinivash044@gmail.com -> sr***4@gmail.com)
 */
const maskEmail = (email) => {
  if (!email) return 'e***@gmail.com';
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1] || 'gmail.com';
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
};

/**
 * Hash OTP using SHA-256 for secure backend storage
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
};

/**
 * Issue JWT token after authentication
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'raithasetu_super_secret_jwt_key_2026_safe',
    { expiresIn: '30d' }
  );

  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj
  });
};

/**
 * DIRECT LOGIN (NO OTP FOR LOGIN)
 * Verify Email/Mobile & Password, issue JWT token immediately
 */
exports.login = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = identifier || email;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email/mobile and password.' });
    }

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase().trim() },
        { phone: loginId.trim() },
        { mobileNumber: loginId.trim() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.isAccountActive === false) {
      return res.status(403).json({ success: false, error: 'Your account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // DIRECT LOGIN — NO OTP REQUIRED FOR LOGIN
    sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Unable to login. Please try again.' });
  }
};

/**
 * Legacy Login OTP Verification (kept for backward compatibility)
 */
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide challenge session ID and 6-digit OTP.' });
    }

    const challenge = await OtpChallenge.findOne({ challengeId, purpose: 'LOGIN' });
    if (!challenge || challenge.verifiedAt) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP session. Please login again.' });
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP.' });
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    const inputHash = hashOtp(otp);
    if (inputHash !== challenge.otpHash) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    challenge.verifiedAt = new Date();
    await challenge.save();

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    sendTokenResponse(user, 200, res, 'OTP verified successfully. Welcome back!');
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP code.' });
  }
};

/**
 * Legacy Resend Login OTP
 */
exports.resendLoginOtp = async (req, res) => {
  res.status(400).json({ success: false, error: 'OTP is not required for login. Please use direct login.' });
};

/**
 * STEP 1 REGISTRATION REQUEST: Validate Details, Generate Email OTP, Dispatch Nodemailer Email
 */
exports.registerRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      mobileNumber,
      role,
      address,
      latitude,
      longitude,
      languagePreference,
      cropsGrown,
      farmSizeAcres,
      farmingExperienceYears,
      skills,
      experienceYears,
      expectedWagePerDay,
      preferredWorkTypes,
      storeName,
      productCategories,
      isDeliveryAvailable,
      deliveryRadiusKm,
      businessName,
      interestedCrops,
      purchaseCapacity
    } = req.body;

    const userPhone = (mobileNumber || phone || '').trim();
    const userEmail = (email || '').toLowerCase().trim();

    if (!name || !userEmail || !password || !userPhone || !role) {
      return res.status(400).json({ success: false, error: 'Please fill in all required registration fields.' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: userEmail },
        { phone: userPhone },
        { mobileNumber: userPhone }
      ]
    });

    if (existingUser) {
      if (existingUser.email === userEmail) {
        return res.status(400).json({ success: false, error: 'This email is already registered. Please login or use a different email.' });
      }
      return res.status(400).json({ success: false, error: 'This phone number is already registered. Please use a different phone number.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rawOtp = generateOtp(6);
    const otpHash = hashOtp(rawOtp);
    const challengeId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const pendingUserData = {
      name,
      email: userEmail,
      password: hashedPassword,
      phone: userPhone,
      mobileNumber: userPhone,
      role,
      address: address || 'Karnataka, India',
      languagePreference: languagePreference || 'en',
      latitude: latitude ? parseFloat(latitude) : 12.9716,
      longitude: longitude ? parseFloat(longitude) : 77.5946,
      cropsGrown,
      farmSizeAcres,
      farmingExperienceYears,
      skills,
      experienceYears,
      expectedWagePerDay,
      preferredWorkTypes,
      storeName,
      productCategories,
      isDeliveryAvailable,
      deliveryRadiusKm,
      businessName,
      interestedCrops,
      purchaseCapacity
    };

    await OtpChallenge.create({
      challengeId,
      phoneNumber: userPhone,
      otpHash,
      purpose: 'REGISTRATION',
      pendingUserData,
      attempts: 0,
      resendCount: 0,
      lastResendAt: new Date(),
      expiresAt
    });

    // Send Email Verification OTP via Nodemailer
    const emailResult = await sendEmailOtp(userEmail, rawOtp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: emailResult.error || 'Unable to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      requiresOtp: true,
      challengeId,
      maskedEmail: maskEmail(userEmail),
      message: 'Verification OTP sent to your email address.'
    });
  } catch (error) {
    console.error('Register Request Error:', error);
    res.status(500).json({ success: false, error: 'Registration request failed. Please try again.' });
  }
};

/**
 * STEP 2 VERIFY REGISTRATION EMAIL OTP: Create User & Role Profile in MongoDB
 */
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide registration session ID and 6-digit OTP.' });
    }

    const challenge = await OtpChallenge.findOne({ challengeId, purpose: 'REGISTRATION' });
    if (!challenge || challenge.verifiedAt) {
      return res.status(400).json({ success: false, error: 'Registration session expired or invalid. Please fill out form again.' });
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP.' });
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    const inputHash = hashOtp(otp);
    if (inputHash !== challenge.otpHash) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    challenge.verifiedAt = new Date();
    await challenge.save();

    const data = challenge.pendingUserData;

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || data.mobileNumber,
      mobileNumber: data.mobileNumber || data.phone,
      phoneVerified: true,
      emailVerified: true,
      role: data.role,
      address: data.address,
      languagePreference: data.languagePreference,
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      }
    });

    if (data.role === 'farmer') {
      await FarmerProfile.create({
        userId: user._id,
        cropsGrown: data.cropsGrown || ['Tomato', 'Paddy'],
        farmSizeAcres: data.farmSizeAcres || 2,
        farmingExperienceYears: data.farmingExperienceYears || 3,
        farmLocationName: data.address || 'Farm'
      });
    } else if (data.role === 'worker') {
      await WorkerProfile.create({
        userId: user._id,
        skills: data.skills || ['Harvesting', 'Sowing', 'Pesticide Spraying'],
        experienceYears: data.experienceYears || 2,
        preferredWorkTypes: data.preferredWorkTypes || ['Daily', 'Weekly'],
        expectedWagePerDay: data.expectedWagePerDay || 650,
        isAvailable: true
      });
    } else if (data.role === 'store') {
      await StoreProfile.create({
        userId: user._id,
        storeName: data.storeName || `${data.name}'s Agro Store`,
        productCategories: data.productCategories || ['seeds', 'fertilizers', 'pesticides', 'tools'],
        isDeliveryAvailable: data.isDeliveryAvailable !== undefined ? data.isDeliveryAvailable : true,
        deliveryRadiusKm: data.deliveryRadiusKm || 20,
        storeAddress: data.address || 'Main Market, Karnataka'
      });
    } else if (data.role === 'trader') {
      await TraderProfile.create({
        userId: user._id,
        businessName: data.businessName || `${data.name} Traders`,
        interestedCrops: data.interestedCrops || ['Paddy', 'Maize', 'Tomato'],
        purchaseCapacity: data.purchaseCapacity || 'High (50+ Quintals)'
      });
    }

    sendTokenResponse(user, 201, res, 'Email verified and account created successfully!');
  } catch (error) {
    console.error('Verify Register OTP Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create account.' });
  }
};

/**
 * RESEND REGISTRATION EMAIL OTP
 */
exports.resendRegisterOtp = async (req, res) => {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Challenge ID is required to resend OTP.' });
    }

    const challenge = await OtpChallenge.findOne({ challengeId, purpose: 'REGISTRATION' });
    if (!challenge || challenge.verifiedAt) {
      return res.status(400).json({ success: false, error: 'Registration session expired. Please register again.' });
    }

    const elapsedSeconds = Math.floor((Date.now() - new Date(challenge.lastResendAt).getTime()) / 1000);
    if (elapsedSeconds < 60) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${60 - elapsedSeconds} seconds before requesting a new OTP.`
      });
    }

    const rawOtp = generateOtp(6);
    challenge.otpHash = hashOtp(rawOtp);
    challenge.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    challenge.attempts = 0;
    challenge.resendCount += 1;
    challenge.lastResendAt = new Date();
    await challenge.save();

    const emailResult = await sendEmailOtp(challenge.pendingUserData.email, rawOtp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: emailResult.error || 'Unable to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      challengeId: challenge.challengeId,
      message: 'A new 6-digit OTP has been sent to your email address.'
    });
  } catch (error) {
    console.error('Resend Register OTP Error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend registration OTP.' });
  }
};

// Aliases for backwards compatibility
exports.sendOtp = exports.login;
exports.register = exports.registerRequest;
exports.verifyOtp = exports.verifyLoginOtp;
exports.resendOtp = exports.resendLoginOtp;

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'worker') {
      profile = await WorkerProfile.findOne({ userId: user._id });
    } else if (user.role === 'store') {
      profile = await StoreProfile.findOne({ userId: user._id });
    } else if (user.role === 'trader') {
      profile = await TraderProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, languagePreference, latitude, longitude, ...roleFields } = req.body;
    const userId = req.user._id;

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (address) userUpdate.address = address;
    if (languagePreference) userUpdate.languagePreference = languagePreference;

    if (latitude && longitude) {
      userUpdate.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdate, { new: true, runValidators: true });

    let updatedProfile = null;
    if (req.user.role === 'farmer') {
      updatedProfile = await FarmerProfile.findOneAndUpdate({ userId }, roleFields, { new: true, upsert: true });
    } else if (req.user.role === 'worker') {
      updatedProfile = await WorkerProfile.findOneAndUpdate({ userId }, roleFields, { new: true, upsert: true });
    } else if (req.user.role === 'store') {
      updatedProfile = await StoreProfile.findOneAndUpdate({ userId }, roleFields, { new: true, upsert: true });
    } else if (req.user.role === 'trader') {
      updatedProfile = await TraderProfile.findOneAndUpdate({ userId }, roleFields, { new: true, upsert: true });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
