const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [String], default: [] }, // array of member names/emails (string) for simplicity
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
