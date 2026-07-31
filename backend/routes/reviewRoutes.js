import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { uploadReviewImages } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createReview, getMyReviews, moderateReview, getAllReviewsAdmin, deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/:productId', protect, uploadReviewImages.array('images', 4), asyncHandler(createReview));
router.get('/my', protect, asyncHandler(getMyReviews));
router.get('/admin/all', protect, admin, asyncHandler(getAllReviewsAdmin));
router.put('/:id/moderate', protect, admin, asyncHandler(moderateReview));
router.delete('/:id', protect, admin, asyncHandler(deleteReview));

export default router;
