import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    productionDays: { type: Number, default: 3 },
  },
  { _id: false }
);

export const ORDER_STATUSES = [
  'Order Received',
  'Payment Reported',
  'Payment Successful',
  'Confirmation Sent',
  'Acknowledgement Pending',
  'Production Started',
  'Gift Packaging',
  'Packed',
  'Shipping Assigned',
  'Shipped',
  'Delivered',
  'Return Requested',
  'Return Approved',
  'Refund Initiated',
  'Refund Completed',
  'Cancelled',
  'Completed',
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    address: {
      fullName: String,
      phone: String,
      fullAddress: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      latitude: Number,
      longitude: Number,
    },
    itemsTotal: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    walletUsed: { type: Number, default: 0 },
    giftWrap: { type: Boolean, default: false },
    giftWrapCost: { type: Number, default: 0 },
    giftNote: { type: String, default: '' },
    chocolateAddon: { type: Boolean, default: false },
    chocolateAddonCost: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['upi', 'whatsapp'], default: 'upi' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    upiOwnerUsed: { type: String, default: '' }, // which owner's QR was shown, for reconciliation
    paymentVerifiedAt: { type: Date },

    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Order Received' },
    statusHistory: [statusHistorySchema],

    isCustomOrder: { type: Boolean, default: false },
    customRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomRequest', default: null },

    shippingProvider: { type: String, enum: ['', 'Rapido Parcel', 'Shiprocket'], default: '' },
    courierPartner: { type: String, default: '' }, // Delhivery, DTDC, Blue Dart, XpressBees
    trackingNumber: { type: String, default: '' },
    estimatedDeliveryDate: { type: Date },

    adminNote: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    cancelledAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'UTS' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
  }
  next();
});

export default mongoose.model('Order', orderSchema);