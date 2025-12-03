const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  phoneNo: { type: Number, required: false },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false },
  passwordHash: { type: String, required: false }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  // Expert rating fields
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  // Track last login for missed notifications
  lastLoginDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
