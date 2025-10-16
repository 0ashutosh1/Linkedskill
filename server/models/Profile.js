const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phoneNo: { type: String, default: '' },
  education: { type: String, default: '' },
  areasOfInterest: [{ type: String }],
  occupation: { type: String, default: '' },
  designation: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  website: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
