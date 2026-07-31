import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import { notifyUser } from '../utils/notify.js';

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const GIFT_WRAP_COST = 49;
const CHOCOLATE_ADDON_COST = 99;

// @desc Create a Razorpay order for the current cart (step 1 of checkout)
// @route POST /api/orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { addressId, couponCode, giftWrap, giftNote, chocolateAddon, useWallet } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Your cart is empty' });

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(400).json({ message: 'Please select a valid delivery address' });

    let itemsTotal = 0;
    for (const item of cart.items) {
      if (!item.product || item.product.isHidden) {
        return res.status(400).json({ message: `A product in your cart is no longer available` });
      }
      itemsTotal += item.product.price * item.quantity;
    }

    let couponDiscount = 0;
    let appliedCouponCode = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate >= new Date() && coupon.usedCount < coupon.usageLimit && itemsTotal >= coupon.minimumPurchase) {
        couponDiscount = coupon.discountType === 'percentage' ? (itemsTotal * coupon.discountValue) / 100 : coupon.discountValue;
        couponDiscount = Math.round(Math.min(couponDiscount, itemsTotal));
        appliedCouponCode = coupon.code;
      }
    }

    const giftWrapCost = giftWrap ? GIFT_WRAP_COST : 0;
    const chocolateAddonCost = chocolateAddon ? CHOCOLATE_ADDON_COST : 0;

    let subtotal = itemsTotal - couponDiscount + giftWrapCost + chocolateAddonCost;

    const user = await User.findById(req.user._id);
    let walletUsed = 0;
    if (useWallet && user.walletBalance > 0) {
      walletUsed = Math.min(user.walletBalance, subtotal);
    }
    const totalAmount = Math.max(0, Math.round(subtotal - walletUsed));

    const payload = {
      itemsTotal, couponDiscount, couponCode: appliedCouponCode, giftWrapCost, chocolateAddonCost,
      walletUsed, totalAmount, addressId, giftWrap: !!giftWrap, giftNote: giftNote || '', chocolateAddon: !!chocolateAddon,
    };

    if (totalAmount === 0) {
      // fully covered by wallet - no razorpay order needed
      return res.json({ razorpayOrder: null, ...payload });
    }

    const instance = getRazorpayInstance();
    if (!instance) {
      return res.status(503).json({
        message: 'Payments are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env to enable checkout.',
      });
    }

    const razorpayOrder = await instance.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({ razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID, ...payload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify payment + create the actual Order (step 2 of checkout)
// @route POST /api/orders/verify-and-place
export const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      addressId, couponCode, couponDiscount = 0, giftWrap, giftNote, chocolateAddon,
      walletUsed = 0, itemsTotal, totalAmount, skipPayment,
    } = req.body;

    // If payment was made via Razorpay, verify the signature
    if (!skipPayment) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification details' });
      }
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed. Please contact support.' });
      }
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(400).json({ message: 'Invalid address' });

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.images[0] || '',
      price: i.product.price,
      quantity: i.quantity,
      productionDays: i.product.productionDays,
    }));
    const maxProductionDays = Math.max(...items.map((i) => i.productionDays), 1);

    const order = await Order.create({
      user: req.user._id,
      items,
      address: {
        fullName: address.fullName, phone: address.phone, fullAddress: address.fullAddress,
        city: address.city, state: address.state, country: address.country,
        postalCode: address.postalCode, latitude: address.latitude, longitude: address.longitude,
      },
      itemsTotal,
      couponCode: couponCode || '',
      couponDiscount,
      walletUsed,
      giftWrap: !!giftWrap,
      giftWrapCost: giftWrap ? GIFT_WRAP_COST : 0,
      giftNote: giftNote || '',
      chocolateAddon: !!chocolateAddon,
      chocolateAddonCost: chocolateAddon ? CHOCOLATE_ADDON_COST : 0,
      totalAmount,
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id || '',
      razorpayPaymentId: razorpay_payment_id || '',
      razorpaySignature: razorpay_signature || '',
      orderStatus: 'Payment Successful',
      statusHistory: [
        { status: 'Order Received', note: 'Order placed by customer' },
        { status: 'Payment Successful', note: skipPayment ? 'Covered fully by wallet balance' : 'Payment verified via Razorpay' },
      ],
      estimatedDeliveryDate: new Date(Date.now() + (maxProductionDays + 5) * 24 * 60 * 60 * 1000),
    });

    // deduct wallet, increment coupon usage, bump sold count, clear cart
    if (walletUsed > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -walletUsed } });
    }
    if (couponCode) {
      await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
    }
    for (const i of items) {
      await Product.findByIdAndUpdate(i.product, { $inc: { soldCount: i.quantity } });
    }
    cart.items = [];
    await cart.save();

    notifyUser({
      userId: req.user._id,
      title: 'Order confirmed! 🎉',
      message: `Your order #${order.orderNumber} has been placed successfully. We'll start crafting it with love soon!`,
      type: 'order',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my orders
// @route GET /api/orders/my
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Get single order (owner or admin)
// @route GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
};

// @desc Cancel order (only before Production Started)
// @route PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  const cancellableStatuses = ['Order Received', 'Payment Successful', 'Confirmation Sent', 'Acknowledgement Pending'];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    return res.status(400).json({ message: 'This order can no longer be cancelled as production has already started (handmade products are made specifically for each order).' });
  }

  order.orderStatus = 'Cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'Cancelled', note: order.cancelReason });
  await order.save();

  // Refund full amount to wallet automatically for cancellations (instant)
  await User.findByIdAndUpdate(order.user, { $inc: { walletBalance: order.totalAmount } });

  notifyUser({
    userId: order.user,
    title: 'Order cancelled',
    message: `Your order #${order.orderNumber} has been cancelled and ₹${order.totalAmount} has been credited to your Utsaah Wallet.`,
    type: 'refund',
  });

  res.json(order);
};

// @desc One-click reorder — adds all items from a past order back to cart
// @route POST /api/orders/:id/reorder
export const reorder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product || product.isHidden) continue;
    const existing = cart.items.find((i) => i.product.toString() === item.product.toString());
    if (existing) existing.quantity += item.quantity;
    else cart.items.push({ product: item.product, quantity: item.quantity });
  }
  await cart.save();
  res.json({ message: 'Items added to your cart', itemsAdded: order.items.length });
};

// ---------------- ADMIN ----------------

// @desc Admin - get all orders (filterable by status)
// @route GET /api/orders/admin/all
export const getAllOrdersAdmin = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Admin - update order status / tracking / notes
// @route PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const { orderStatus, note, shippingProvider, courierPartner, trackingNumber, adminNote, estimatedDeliveryDate } = req.body;

  if (orderStatus && ORDER_STATUSES.includes(orderStatus)) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || '' });
    if (orderStatus === 'Delivered') order.deliveredAt = new Date();
  }
  if (shippingProvider !== undefined) order.shippingProvider = shippingProvider;
  if (courierPartner !== undefined) order.courierPartner = courierPartner;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (adminNote !== undefined) order.adminNote = adminNote;
  if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

  await order.save();

  const statusMessages = {
    'Confirmation Sent': 'Your order has been confirmed by our team.',
    'Production Started': 'Great news! Crafting of your order has begun.',
    'Packed': 'Your order has been packed with care and is ready to ship.',
    'Shipped': `Your order is on the way!${trackingNumber ? ' Tracking No: ' + trackingNumber : ''}`,
    'Delivered': 'Your order has been delivered. We hope you love it! Please leave a review.',
  };
  if (orderStatus && statusMessages[orderStatus]) {
    notifyUser({
      userId: order.user,
      title: `Order Update: ${orderStatus}`,
      message: `Order #${order.orderNumber}: ${statusMessages[orderStatus]}`,
      type: 'shipping',
    });
  }

  res.json(order);
};

// @desc Admin - revenue dashboard stats
// @route GET /api/orders/admin/dashboard/revenue
export const getRevenueDashboard = async (req, res) => {
  const paidOrders = await Order.find({ paymentStatus: 'paid' });
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const now = new Date();
  const monthlyMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthlyMap[key] = 0;
  }
  paidOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    if (monthlyMap[key] !== undefined) monthlyMap[key] += o.totalAmount;
  });
  const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

  const productSales = {};
  paidOrders.forEach((o) => {
    o.items.forEach((i) => {
      const key = i.name;
      productSales[key] = (productSales[key] || 0) + i.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, unitsSold]) => ({ name, unitsSold }));

  res.json({ totalRevenue, totalOrders, avgOrderValue, monthlyRevenue, topProducts });
};

// @desc Admin - CRM dashboard stats
// @route GET /api/orders/admin/dashboard/crm
export const getCrmDashboard = async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth();

  const users = await User.find({ role: 'customer' });
  const birthdaysThisMonth = users.filter((u) => u.birthday && new Date(u.birthday).getMonth() === currentMonth);

  const orders = await Order.find({ paymentStatus: 'paid' });
  const orderCountByUser = {};
  orders.forEach((o) => {
    const uid = o.user.toString();
    orderCountByUser[uid] = (orderCountByUser[uid] || 0) + 1;
  });
  const repeatCustomerIds = Object.entries(orderCountByUser).filter(([, c]) => c > 1).map(([id]) => id);
  const repeatCustomers = users.filter((u) => repeatCustomerIds.includes(u._id.toString()))
    .map((u) => ({ _id: u._id, name: u.name, email: u.email, orderCount: orderCountByUser[u._id.toString()] }));

  res.json({
    birthdaysThisMonth: birthdaysThisMonth.map((u) => ({ _id: u._id, name: u.name, email: u.email, birthday: u.birthday })),
    repeatCustomers,
    totalCustomers: users.length,
  });
};
