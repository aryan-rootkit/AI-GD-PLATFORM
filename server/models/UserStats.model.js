const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalSessions: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserStats', userStatsSchema);
