import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  updateProfile, changePassword, getAddresses, addAddress, updateAddress, deleteAddress, getWallet,
} from '../controllers/userController.js';
import { getAllCustomers, getCustomerDetail, toggleCustomerActive } from '../controllers/adminUserController.js';

const router = express.Router();

router.put('/profile', protect, asyncHandler(updateProfile));
router.put('/change-password', protect, asyncHandler(changePassword));

router.get('/addresses', protect, asyncHandler(getAddresses));
router.post('/addresses', protect, asyncHandler(addAddress));
router.put('/addresses/:id', protect, asyncHandler(updateAddress));
router.delete('/addresses/:id', protect, asyncHandler(deleteAddress));

router.get('/wallet', protect, asyncHandler(getWallet));

// Admin - customer management
router.get('/admin/customers', protect, admin, asyncHandler(getAllCustomers));
router.get('/admin/customers/:id', protect, admin, asyncHandler(getCustomerDetail));
router.put('/admin/customers/:id/toggle-active', protect, admin, asyncHandler(toggleCustomerActive));

export default router;
