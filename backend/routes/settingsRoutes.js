import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPublicSettings, getAdminSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', asyncHandler(getPublicSettings));
router.get('/admin', protect, admin, asyncHandler(getAdminSettings));
router.put('/admin', protect, admin, asyncHandler(updateSettings));

export default router;