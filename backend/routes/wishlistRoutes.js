import express from 'express';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', protect, asyncHandler(getWishlist));
router.post('/:productId', protect, asyncHandler(addToWishlist));
router.delete('/:productId', protect, asyncHandler(removeFromWishlist));

export default router;
