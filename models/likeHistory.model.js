const mongoose = require('mongoose');

const likeHistorySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  ip: { type: String, required: true },   // device/IP
  lastActionAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LikeHistory', likeHistorySchema);
