const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  phoneNo: { type: Number, required: false },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false },
  passwordHash: { type: String, required: true },
  // Expert rating fields
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
