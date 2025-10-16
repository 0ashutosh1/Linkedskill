const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true },
  displayName: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
