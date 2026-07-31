import mongoose from 'mongoose';

const customRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    productType: { type: String, required: true },
    inspirationImages: [{ type: String }],
    preferredColors: { type: String, default: '' },
    preferredSize: { type: String, default: '' },
    notes: { type: String, default: '' },
    contactPreference: { type: String, enum: ['WhatsApp', 'Email'], default: 'WhatsApp' },
    status: {
      type: String,
      enum: ['New', 'In Discussion', 'Quotation Sent', 'Accepted', 'Converted To Order', 'Declined'],
      default: 'New',
    },
    quotedPrice: { type: Number, default: 0 },
    adminReply: { type: String, default: '' },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('CustomRequest', customRequestSchema);
