import express from 'express';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCart, addToCart, updateCartItem, removeCartItem, mergeCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/', protect, asyncHandler(getCart));
router.post('/', protect, asyncHandler(addToCart));
router.post('/merge', protect, asyncHandler(mergeCart));
router.put('/:productId', protect, asyncHandler(updateCartItem));
router.delete('/:productId', protect, asyncHandler(removeCartItem));
router.delete('/', protect, asyncHandler(clearCart));

export default router;
