const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: { type: [participantSchema], default: [] },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    isPractice: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

sessionSchema.index({ status: 1 });
sessionSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('Session', sessionSchema);
