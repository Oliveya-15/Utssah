import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.post('/validate', protect, asyncHandler(validateCoupon));
router.get('/admin/all', protect, admin, asyncHandler(getAllCoupons));
router.post('/', protect, admin, asyncHandler(createCoupon));
router.put('/:id', protect, admin, asyncHandler(updateCoupon));
router.delete('/:id', protect, admin, asyncHandler(deleteCoupon));

export default router;
