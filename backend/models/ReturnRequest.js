import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Refund Initiated', 'Refund Completed'],
      default: 'Requested',
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    completedAt: { type: Date },

    // Refund details (embedded — one refund per return in this simplified flow)
    refundAmount: { type: Number, default: 0 },
    refundMethod: { type: String, enum: ['wallet', 'original_payment', ''], default: '' },
    refundStatus: {
      type: String,
      enum: ['not_started', 'pending', 'processed'],
      default: 'not_started',
    },
    refundProcessedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('ReturnRequest', returnRequestSchema);
