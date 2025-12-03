const express = require('express');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/email');

const router = express.Router();

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * POST /otp/send
 * Send OTP to email for verification
 */
router.post('/send', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered. Please login instead.' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp: otp
    });

    // Send OTP via email
    await sendOTPEmail(email, otp, name || 'User');

    console.log(`📧 OTP sent to ${email}: ${otp} (Dev mode - this log will be removed in production)`);

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error.message === 'Failed to send verification email') {
      res.status(500).json({ error: 'Failed to send verification email. Please check your email address.' });
    } else {
      res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
});

/**
 * POST /otp/verify
 * Verify OTP code
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(),
      verified: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({ error: 'No verification code found. Please request a new code.' });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    console.log(`✅ OTP verified for ${email}`);

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/**
 * POST /otp/resend
 * Resend OTP to email
 */
router.post('/resend', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp: otp
    });

    // Send OTP via email
    await sendOTPEmail(email, otp, name || 'User');

    console.log(`📧 OTP resent to ${email}: ${otp} (Dev mode)`);

    res.json({ 
      success: true, 
      message: 'New verification code sent to your email',
      expiresIn: 600
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend verification code. Please try again.' });
  }
});

module.exports = router;
