import express from 'express';
import { registerUser, loginUser, loginAdmin, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/admin-login', asyncHandler(loginAdmin));
router.get('/me', protect, asyncHandler(getMe));

export default router;
