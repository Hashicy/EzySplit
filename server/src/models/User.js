const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  name: { type: String },
  // social: followers / following store user ids
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // store a single hashed refresh token for rotation/revocation
  refreshTokenHash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
