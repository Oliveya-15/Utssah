import Coupon from '../models/Coupon.js';

// @desc Validate & preview a coupon against a cart total (customer)
// @route POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'This coupon has expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    if (coupon.issuedTo && coupon.issuedTo.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'This coupon is not valid for your account' });
    }
    if (cartTotal < coupon.minimumPurchase) {
      return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minimumPurchase} required for this coupon` });
    }
    let discount = coupon.discountType === 'percentage'
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;
    discount = Math.min(discount, cartTotal);

    res.json({ code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount: Math.round(discount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Admin ----------

// @route GET /api/coupons/admin/all
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

// @route POST /api/coupons
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
};

// @route DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ message: 'Coupon removed' });
};
