import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { notifyUser } from '../utils/notify.js';

const RETURN_WINDOW_DAYS = 7;

// @desc Request a return (within 7 days of delivery)
// @route POST /api/returns/:orderId
export const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Completed') {
      return res.status(400).json({ message: 'Returns can only be requested after the order has been delivered' });
    }
    if (order.deliveredAt) {
      const daysSince = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > RETURN_WINDOW_DAYS) {
        return res.status(400).json({ message: `The ${RETURN_WINDOW_DAYS}-day return window for this order has closed` });
      }
    }
    const existing = await ReturnRequest.findOne({ order: order._id });
    if (existing) return res.status(400).json({ message: 'A return request already exists for this order' });

    const images = (req.files || []).map((f) => f.path);

    const returnReq = await ReturnRequest.create({
      order: order._id,
      user: req.user._id,
      reason: req.body.reason,
      description: req.body.description || '',
      images,
    });

    order.orderStatus = 'Return Requested';
    order.statusHistory.push({ status: 'Return Requested', note: req.body.reason });
    await order.save();

    res.status(201).json(returnReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my returns
// @route GET /api/returns/my
export const getMyReturns = async (req, res) => {
  const returns = await ReturnRequest.find({ user: req.user._id }).populate('order', 'orderNumber totalAmount').sort({ createdAt: -1 });
  res.json(returns);
};

// ---------- Admin ----------

// @route GET /api/returns/admin/all
export const getAllReturnsAdmin = async (req, res) => {
  const returns = await ReturnRequest.find()
    .populate('user', 'name email')
    .populate('order', 'orderNumber totalAmount items')
    .sort({ createdAt: -1 });
  res.json(returns);
};

// @desc Admin approves/rejects a return
// @route PUT /api/returns/:id/decision
export const decideReturn = async (req, res) => {
  const { decision } = req.body; // 'Approved' | 'Rejected'
  const returnReq = await ReturnRequest.findById(req.params.id);
  if (!returnReq) return res.status(404).json({ message: 'Return request not found' });

  returnReq.status = decision;
  if (decision === 'Approved') returnReq.approvedAt = new Date();
  await returnReq.save();

  const order = await Order.findById(returnReq.order);
  if (order) {
    order.orderStatus = decision === 'Approved' ? 'Return Approved' : 'Delivered';
    order.statusHistory.push({ status: order.orderStatus, note: `Return ${decision.toLowerCase()} by admin` });
    await order.save();
  }

  notifyUser({
    userId: returnReq.user,
    title: `Return request ${decision.toLowerCase()}`,
    message: decision === 'Approved'
      ? 'Your return request has been approved. Please choose your refund method from your Returns page.'
      : 'Your return request was not approved. Contact support if you have questions.',
    type: 'return',
  });

  res.json(returnReq);
};

// @desc Admin (or customer, via choosing method) processes the refund
// @route PUT /api/returns/:id/refund
export const processRefund = async (req, res) => {
  const { refundMethod } = req.body; // 'wallet' | 'original_payment'
  const returnReq = await ReturnRequest.findById(req.params.id).populate('order');
  if (!returnReq) return res.status(404).json({ message: 'Return request not found' });
  if (returnReq.status !== 'Approved') return res.status(400).json({ message: 'Return must be approved before processing a refund' });

  const refundAmount = returnReq.order.totalAmount;
  returnReq.refundAmount = refundAmount;
  returnReq.refundMethod = refundMethod;

  if (refundMethod === 'wallet') {
    await User.findByIdAndUpdate(returnReq.user, { $inc: { walletBalance: refundAmount } });
    returnReq.refundStatus = 'processed';
    returnReq.status = 'Refund Completed';
    returnReq.completedAt = new Date();
    returnReq.refundProcessedAt = new Date();
  } else {
    // original payment method — simulated as pending, to be marked completed by admin after actual bank refund
    returnReq.refundStatus = 'pending';
    returnReq.status = 'Refund Initiated';
  }
  await returnReq.save();

  const order = await Order.findById(returnReq.order._id);
  if (order) {
    order.orderStatus = returnReq.status;
    order.statusHistory.push({ status: order.orderStatus, note: `Refund via ${refundMethod}` });
    await order.save();
  }

  notifyUser({
    userId: returnReq.user,
    title: 'Refund update',
    message: refundMethod === 'wallet'
      ? `₹${refundAmount} has been credited instantly to your Utsaah Wallet.`
      : `Your refund of ₹${refundAmount} to your original payment method has been initiated (5–7 business days).`,
    type: 'refund',
  });

  res.json(returnReq);
};

// @desc Admin marks an "original payment method" refund as completed (after actually sending it back via UPI/bank transfer)
// @route PUT /api/returns/:id/complete
export const markRefundCompleted = async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id);
  if (!returnReq) return res.status(404).json({ message: 'Return request not found' });
  returnReq.refundStatus = 'processed';
  returnReq.status = 'Refund Completed';
  returnReq.completedAt = new Date();
  returnReq.refundProcessedAt = new Date();
  await returnReq.save();
  res.json(returnReq);
};