import mongoose from 'mongoose';
import slugify from 'slugify';

const specSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    specifications: [specSchema],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 }, // for showing discount / strike-through
    tags: [{ type: String, trim: true, lowercase: true }],
    images: [{ type: String }], // array of image urls
    video: { type: String, default: '' },
    availability: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    manufacturingType: { type: String, default: 'Made To Order' },
    productionDays: { type: Number, required: true, default: 3 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    stockNote: { type: String, default: '' }, // made-to-order so no numeric stock, just a note
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    frequentlyBoughtWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).slice(2, 7);
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
