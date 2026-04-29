const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['user', 'system', 'ai'],
      default: 'user',
    },
  },
  { timestamps: true },
);

messageSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Message', messageSchema);
