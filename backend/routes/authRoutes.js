const express = require('express');
const router = express.Router();
const {
  login,
  sendOtp,
  verifyLoginOtp,
  resendLoginOtp,
  registerRequest,
  verifyRegisterOtp,
  resendRegisterOtp,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/verify-otp', verifyLoginOtp); // Alias
router.post('/resend-login-otp', resendLoginOtp);
router.post('/resend-otp', resendLoginOtp); // Alias

router.post('/register', registerRequest);
router.post('/register-request', registerRequest);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/resend-register-otp', resendRegisterOtp);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

