import express from 'express';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, asyncHandler(getMyNotifications));
router.put('/:id/read', protect, asyncHandler(markAsRead));
router.put('/read-all', protect, asyncHandler(markAllAsRead));

export default router;
