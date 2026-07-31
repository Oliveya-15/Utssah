import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { subscribeNewsletter, getAllSubscribers } from '../controllers/newsletterController.js';

const router = express.Router();

router.post('/', asyncHandler(subscribeNewsletter));
router.get('/admin/all', protect, admin, asyncHandler(getAllSubscribers));

export default router;
