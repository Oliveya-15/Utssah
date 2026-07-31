import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { submitContactMessage, getAllMessages, resolveMessage } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', asyncHandler(submitContactMessage));
router.get('/admin/all', protect, admin, asyncHandler(getAllMessages));
router.put('/:id/resolve', protect, admin, asyncHandler(resolveMessage));

export default router;
