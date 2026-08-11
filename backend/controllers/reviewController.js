import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { ratingAverage: Math.round(avg * 10) / 10, ratingCount: count });
};

// @desc Create a review — only allowed for products the user has an order marked Delivered/Completed for
// @route POST /api/reviews/:productId
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, reviewText } = req.body;

    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['Delivered', 'Completed'] },
    });
    if (!deliveredOrder) {
      return res.status(403).json({ message: 'You can review a product only after it has been delivered to you.' });
    }

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const images = (req.files || []).map((f) => f.path);

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: deliveredOrder._id,
      rating,
      reviewText,
      images,
    });

    await recalcProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my reviews
// @route GET /api/reviews/my
export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).populate('product', 'name slug images').sort({ createdAt: -1 });
  res.json(reviews);
};

// @desc Admin - moderate (approve/reject) reviews
// @route PUT /api/reviews/:id/moderate
export const moderateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  review.isApproved = req.body.isApproved;
  await review.save();
  await recalcProductRating(review.product);
  res.json(review);
};

// @desc Admin - get all reviews
// @route GET /api/reviews/admin/all
export const getAllReviewsAdmin = async (req, res) => {
  const reviews = await Review.find().populate('user', 'name email').populate('product', 'name slug').sort({ createdAt: -1 });
  res.json(reviews);
};

// @desc Admin - delete review
// @route DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await recalcProductRating(review.product);
  res.json({ message: 'Review removed' });
};