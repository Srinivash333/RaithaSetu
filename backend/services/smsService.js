/**
 * RaithaSetu AI — Pluggable SMS Service Abstraction Layer
 * Supports Fast2SMS (official REST API), Twilio, and Console DEMO OTP mode
 */

let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  // twilio package optional
}

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/[^0-9+]/g, '').trim();
  if (cleaned.length === 10) {
    cleaned = `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = `+${cleaned}`;
  } else if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  return cleaned;
};

const get10DigitIndianNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const sendSMS = async (phoneNumber, otpMessage, rawOtp = null) => {
  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase().trim();
  const tenDigitNumber = get10DigitIndianNumber(phoneNumber);
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const extractedOtp = rawOtp || (otpMessage.match(/\b\d{6}\b/) ? otpMessage.match(/\b\d{6}\b/)[0] : '');

  // PRODUCTION FAST2SMS PROVIDER (Do not fall back to console if configured)
  if (provider === 'fast2sms') {
    const apiKey = (process.env.FAST2SMS_API_KEY || '').trim();
    const templateId = (process.env.FAST2SMS_OTP_TEMPLATE_ID || '').trim();

    if (!apiKey) {
      console.error('[SMS Service] ❌ FAST2SMS_API_KEY is missing in environment configuration.');
      return {
        success: false,
        provider: 'fast2sms',
        error: 'Unable to send OTP. Please configure FAST2SMS_API_KEY in backend environment.'
      };
    }

    try {
      const payload = {
        route: 'otp',
        variables_values: extractedOtp,
        numbers: tenDigitNumber
      };

      if (templateId) {
        payload.template_id = templateId;
      }

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data && (data.return === true || data.status_code === 200)) {
        console.log(`[SMS Service] ✅ Fast2SMS OTP dispatched successfully to ${tenDigitNumber}. Request ID: ${data.request_id || 'N/A'}`);
        return {
          success: true,
          provider: 'fast2sms',
          requestId: data.request_id
        };
      } else {
        console.error(`[SMS Service] ❌ Fast2SMS API error response: ${JSON.stringify(data)}`);
        return {
          success: false,
          provider: 'fast2sms',
          error: (data && data.message) ? data.message : 'Fast2SMS SMS delivery failed. Please check API key and template.'
        };
      }
    } catch (err) {
      console.error(`[SMS Service] ❌ Fast2SMS SMS delivery failed: ${err.message}`);
      return {
        success: false,
        provider: 'fast2sms',
        error: `Fast2SMS delivery error: ${err.message}`
      };
    }
  }

  // PRODUCTION TWILIO PROVIDER
  if (provider === 'twilio') {
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const fromNumber = (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || '').trim();

    if (!accountSid || !authToken || !fromNumber) {
      console.error('[SMS Service] ❌ TWILIO configuration is missing in environment variables.');
      return {
        success: false,
        provider: 'twilio',
        error: 'Unable to send OTP. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.'
      };
    }

    try {
      const client = twilio ? twilio(accountSid, authToken) : require('twilio')(accountSid, authToken);
      const message = await client.messages.create({
        body: otpMessage,
        from: fromNumber,
        to: formattedPhone
      });

      console.log(`[SMS Service] ✅ Twilio OTP dispatched successfully to ${formattedPhone}. Message SID: ${message.sid}`);
      return {
        success: true,
        provider: 'twilio',
        sid: message.sid
      };
    } catch (err) {
      console.error(`[SMS Service] ❌ Twilio SMS delivery failed: ${err.message}`);
      return {
        success: false,
        provider: 'twilio',
        error: `Twilio delivery failed: ${err.message}`
      };
    }
  }

  // DEVELOPMENT / CONSOLE DEMO MODE ONLY (SMS_PROVIDER=console)
  console.log(`\n==================================================`);
  console.log(`📱 [COLLEGE DEMO OTP MODE] GENERATED RANDOM 6-DIGIT OTP`);
  console.log(`Recipient Mobile: ${phoneNumber}`);
  console.log(`Random 6-Digit OTP Code: ${extractedOtp}`);
  console.log(`Message: ${otpMessage}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: 'console',
    demoOtp: extractedOtp,
    message: 'Demo OTP generated for college demonstration mode.'
  };
};

module.exports = { sendSMS };






