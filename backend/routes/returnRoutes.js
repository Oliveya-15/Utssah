import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { uploadReviewImages } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  requestReturn, getMyReturns, getAllReturnsAdmin, decideReturn, processRefund, markRefundCompleted,
} from '../controllers/returnController.js';

const router = express.Router();

router.post('/:orderId', protect, uploadReviewImages.array('images', 4), asyncHandler(requestReturn));
router.get('/my', protect, asyncHandler(getMyReturns));
router.get('/admin/all', protect, admin, asyncHandler(getAllReturnsAdmin));
router.put('/:id/decision', protect, admin, asyncHandler(decideReturn));
router.put('/:id/refund', protect, admin, asyncHandler(processRefund));
router.put('/:id/complete', protect, admin, asyncHandler(markRefundCompleted));

export default router;
