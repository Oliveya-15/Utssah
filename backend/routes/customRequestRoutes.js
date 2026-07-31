import express from 'express';
import { protect, admin, optionalAuth } from '../middleware/auth.js';
import { uploadCustomRequestImages } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createCustomRequest, getMyCustomRequests, getAllCustomRequests, updateCustomRequest,
} from '../controllers/customRequestController.js';

const router = express.Router();

router.post('/', optionalAuth, uploadCustomRequestImages.array('inspirationImages', 5), asyncHandler(createCustomRequest));
router.get('/my', protect, asyncHandler(getMyCustomRequests));
router.get('/admin/all', protect, admin, asyncHandler(getAllCustomRequests));
router.put('/:id', protect, admin, asyncHandler(updateCustomRequest));

export default router;
