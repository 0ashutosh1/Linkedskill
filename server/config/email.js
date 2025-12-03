const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'your-app-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'LinkedSkill <noreply@linkedskill.com>';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email service not configured properly:', error.message);
    console.warn('   Add EMAIL_USER and EMAIL_PASSWORD to .env file');
  } else {
    console.log('✅ Email service ready to send messages');
  }
});

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  // For development: If email not configured, just log OTP
  if (!EMAIL_USER || EMAIL_USER === 'your-email@gmail.com' || !EMAIL_PASSWORD || EMAIL_PASSWORD === 'your-app-password') {
    console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
    console.log('   Configure EMAIL_USER and EMAIL_PASSWORD in .env to send actual emails');
    return true;
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'LinkedSkill - Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 LinkedSkill</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up with LinkedSkill. To complete your registration, please verify your email address.</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This code will expire in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> Do not share this code with anyone. LinkedSkill staff will never ask for your verification code.</p>
            
            <p>If you didn't request this verification code, please ignore this email or contact support if you have concerns.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The LinkedSkill Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>© 2025 LinkedSkill. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendOTPEmail,
  transporter
};
