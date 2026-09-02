/**
 * RaithaSetu AI — Email OTP Generation & Delivery Service via Nodemailer
 * Generates secure 6-digit numeric OTPs and sends verification emails via Gmail SMTP.
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Generate a cryptographically secure numeric OTP of specified length (default 6 digits)
 * @param {number} length - Number of digits (default 6)
 * @returns {string} - String representation of generated numeric OTP (e.g. '482915')
 */
const generateOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Send Email OTP via Nodemailer (Gmail SMTP) with rich HTML layout & plain text fallback
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - Purpose of OTP ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET')
 * @returns {Promise<{success: boolean, provider: string, messageId?: string, error?: string}>}
 */
const sendEmailOtp = async (toEmail, otp, purpose = 'REGISTRATION') => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_APP_PASSWORD || '').trim();

  const titleMap = {
    REGISTRATION: 'Verify Your RaithaSetu AI Account',
    LOGIN: 'Your RaithaSetu AI Login OTP Code',
    PASSWORD_RESET: 'Reset Your RaithaSetu AI Password'
  };

  const subjectText = titleMap[purpose] || 'RaithaSetu AI - Verification OTP';

  // Console logging for terminal development debugging
  console.log(`\n==================================================`);
  console.log(`📧 [NODEMAILER OTP SERVICE] DISPATCHING EMAIL OTP`);
  console.log(`Recipient Email: ${toEmail}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`Generated 6-Digit OTP: ${otp}`);
  console.log(`==================================================\n`);

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subjectText}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #14532d; padding: 28px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">🌾 RaithaSetu AI</h1>
                  <p style="color: #86efac; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">Smart Agricultural Workforce & Marketplace Platform</p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 30px; color: #1e293b;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 700;">${subjectText}</h2>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    Use the 6-digit One-Time Password (OTP) below to complete your <strong>${purpose.toLowerCase().replace('_', ' ')}</strong> request on RaithaSetu AI:
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #15803d; display: block;">${otp}</span>
                    <span style="font-size: 12px; color: #166534; font-weight: 600; margin-top: 8px; display: block;">⏰ Valid for 5 minutes only</span>
                  </div>

                  <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                    <strong>Security Tip:</strong> Never share this OTP code with anyone. RaithaSetu AI staff will never ask for your verification code.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0 0 6px 0;">If you did not request this email, please ignore it or contact support.</p>
                  <p style="margin: 0; font-weight: 600;">&copy; 2026 RaithaSetu AI. Empowering Agricultural Communities.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"RaithaSetu AI" <${emailUser || 'noreply@raithasetu.com'}>`,
    to: toEmail,
    subject: subjectText,
    text: `Hello,\n\nYour 6-digit OTP code for ${purpose.toLowerCase().replace('_', ' ')} on RaithaSetu AI is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\nDo not share this code with anyone.\n\nRegards,\nRaithaSetu AI Team`,
    html: htmlTemplate
  };

  if (!emailUser || !emailPass) {
    console.log('[Nodemailer Email Service] ℹ️ EMAIL_USER or EMAIL_APP_PASSWORD not set in .env. OTP printed to terminal log above.');
    return {
      success: true,
      provider: 'console',
      message: 'Email OTP logged to backend terminal console.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer Email Service] ✅ OTP email sent via Gmail SMTP to ${toEmail}. Message ID: ${info.messageId}`);

    return {
      success: true,
      provider: 'gmail',
      messageId: info.messageId
    };
  } catch (err) {
    console.error(`[Nodemailer Email Service] ❌ Failed to send email via Nodemailer: ${err.message}`);
    return {
      success: false,
      provider: 'gmail',
      error: `Unable to send OTP email: ${err.message}`
    };
  }
};

module.exports = {
  generateOtp,
  sendEmailOtp
};

