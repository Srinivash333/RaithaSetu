/**
 * RaithaSetu AI — Test Nodemailer Email OTP Generation & Delivery
 * Usage: node scripts/testEmailOtp.js <target-email>
 * Example: node scripts/testEmailOtp.js user@example.com
 */

require('dotenv').config();
const { generateOtp, sendEmailOtp } = require('../services/emailService');

const targetEmail = process.argv[2] || process.env.EMAIL_USER || 'test@example.com';

async function testOtp() {
  console.log('\n==================================================');
  console.log('🧪 TESTING NODEMAILER EMAIL OTP GENERATOR & SENDER');
  console.log('==================================================');

  // 1. Generate OTP
  const otp = generateOtp(6);
  console.log(`Generated OTP : ${otp}`);
  console.log(`Target Email  : ${targetEmail}`);
  console.log(`EMAIL_USER    : ${process.env.EMAIL_USER || '(Not configured in .env - Console Mode)'}`);

  // 2. Dispatch Email OTP
  console.log('\nSending Email OTP via Nodemailer...');
  const result = await sendEmailOtp(targetEmail, otp, 'REGISTRATION');

  console.log('\nResult output:');
  console.log(result);
  console.log('==================================================\n');
}

testOtp();
