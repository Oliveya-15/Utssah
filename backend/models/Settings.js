import mongoose from 'mongoose';

// Singleton document (there is only ever one Settings row) holding the
// business-configurable payment details for a small, two-person shop:
// two UPI owners (only one "active" at a time) and a WhatsApp number for
// customers who'd rather confirm before paying.
const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Utsaah' },
    ownerOneName: { type: String, default: 'Owner 1' },
    ownerOneUpiId: { type: String, default: '' },
    ownerTwoName: { type: String, default: 'Owner 2' },
    ownerTwoUpiId: { type: String, default: '' },
    activeOwner: { type: String, enum: ['one', 'two'], default: 'one' },
    whatsappNumber: { type: String, default: '' }, // digits only, with country code, e.g. 919876543210
  },
  { timestamps: true }
);

// Always work with a single row. Creates it with defaults on first access.
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

export default mongoose.model('Settings', settingsSchema);