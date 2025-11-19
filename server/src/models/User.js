const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  // store a single hashed refresh token for rotation/revocation
  refreshTokenHash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
