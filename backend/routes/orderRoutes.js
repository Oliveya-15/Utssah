import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  placeOrder, reportPayment, verifyPayment, getMyOrders, getOrderById, cancelOrder, reorder,
  getAllOrdersAdmin, updateOrderStatus, getRevenueDashboard, getCrmDashboard,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', protect, asyncHandler(placeOrder));
router.put('/:id/report-payment', protect, asyncHandler(reportPayment));
router.put('/:id/verify-payment', protect, admin, asyncHandler(verifyPayment));
router.get('/my', protect, asyncHandler(getMyOrders));
router.get('/admin/all', protect, admin, asyncHandler(getAllOrdersAdmin));
router.get('/admin/dashboard/revenue', protect, admin, asyncHandler(getRevenueDashboard));
router.get('/admin/dashboard/crm', protect, admin, asyncHandler(getCrmDashboard));
router.get('/:id', protect, asyncHandler(getOrderById));
router.put('/:id/cancel', protect, asyncHandler(cancelOrder));
router.post('/:id/reorder', protect, asyncHandler(reorder));
router.put('/:id/status', protect, admin, asyncHandler(updateOrderStatus));

export default router;