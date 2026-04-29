const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, required: true },
    strengths: { type: String },
    improvements: { type: String },
    metrics: {
      communication: { type: Number },
      engagement: { type: Number },
      clarity: { type: Number },
      confidence: { type: Number },
    },
  },
  { timestamps: true },
);

evaluationSchema.index({ userId: 1 });
evaluationSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
