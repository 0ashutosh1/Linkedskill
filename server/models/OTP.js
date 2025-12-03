const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Index for faster lookups
otpSchema.index({ email: 1, createdAt: -1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
