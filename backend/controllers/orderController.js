import Order, { ORDER_STATUSES } from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import Settings from '../models/Settings.js';
import { notifyUser, notifyAdmin } from '../utils/notify.js';

const GIFT_WRAP_COST = 49;
const CHOCOLATE_ADDON_COST = 99;

// @desc Place an order — computes totals, charges the wallet where used, and
//       either marks it paid immediately (if wallet covers it fully) or
//       leaves it pending for the customer to pay via UPI / confirm on WhatsApp.
// @route POST /api/orders/place
export const placeOrder = async (req, res) => {
  try {
    const { addressId, couponCode, giftWrap, giftNote, chocolateAddon, useWallet, paymentMethod } = req.body;

    if (!['upi', 'whatsapp'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Please choose how you\'d like to pay' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Your cart is empty' });

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(400).json({ message: 'Please select a valid delivery address' });

    let itemsTotal = 0;
    const items = [];
    for (const item of cart.items) {
      if (!item.product || item.product.isHidden) {
        return res.status(400).json({ message: 'A product in your cart is no longer available' });
      }
      itemsTotal += item.product.price * item.quantity;
      items.push({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        productionDays: item.product.productionDays,
      });
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
    const subtotal = itemsTotal - couponDiscount + giftWrapCost + chocolateAddonCost;

    const user = await User.findById(req.user._id);
    let walletUsed = 0;
    if (useWallet && user.walletBalance > 0) {
      walletUsed = Math.min(user.walletBalance, subtotal);
    }
    const totalAmount = Math.max(0, Math.round(subtotal - walletUsed));
    const fullyPaidByWallet = totalAmount === 0;

    let upiOwnerUsed = '';
    if (paymentMethod === 'upi' && !fullyPaidByWallet) {
      const settings = await Settings.getSingleton();
      upiOwnerUsed = settings.activeOwner === 'one' ? settings.ownerOneName : settings.ownerTwoName;
    }

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
      couponCode: appliedCouponCode,
      couponDiscount,
      walletUsed,
      giftWrap: !!giftWrap,
      giftWrapCost,
      giftNote: giftNote || '',
      chocolateAddon: !!chocolateAddon,
      chocolateAddonCost,
      totalAmount,
      paymentMethod,
      paymentStatus: fullyPaidByWallet ? 'paid' : 'pending',
      upiOwnerUsed,
      orderStatus: fullyPaidByWallet ? 'Payment Successful' : 'Order Received',
      statusHistory: [
        { status: 'Order Received', note: 'Order placed by customer' },
        ...(fullyPaidByWallet ? [{ status: 'Payment Successful', note: 'Covered fully by wallet balance' }] : []),
      ],
      estimatedDeliveryDate: new Date(Date.now() + (maxProductionDays + 5) * 24 * 60 * 60 * 1000),
    });

    if (walletUsed > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -walletUsed } });
    }
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate({ code: appliedCouponCode }, { $inc: { usedCount: 1 } });
    }
    for (const i of items) {
      await Product.findByIdAndUpdate(i.product, { $inc: { soldCount: i.quantity } });
    }
    cart.items = [];
    await cart.save();

    if (fullyPaidByWallet) {
      notifyUser({
        userId: req.user._id,
        title: 'Order confirmed! 🎉',
        message: `Your order #${order.orderNumber} was fully covered by your wallet balance and is confirmed. We'll start crafting it with love soon!`,
        type: 'order',
      });
      notifyAdmin({ title: `New order #${order.orderNumber} (paid via wallet)`, message: `₹${itemsTotal} order from ${req.user.name}, fully covered by wallet — no payment to collect. Check the admin dashboard for details.` });
    } else if (paymentMethod === 'upi') {
      notifyUser({
        userId: req.user._id,
        title: 'Order placed — complete your payment',
        message: `Your order #${order.orderNumber} is reserved! Please pay ₹${totalAmount} via the UPI QR code shown, then tap "I've Paid" so we can confirm it.`,
        type: 'order',
      });
      notifyAdmin({ title: `New order #${order.orderNumber} — awaiting UPI payment`, message: `${req.user.name} placed an order for ₹${totalAmount}, to be paid to ${upiOwnerUsed}'s UPI. You'll get another email once they confirm payment.` });
    } else {
      notifyUser({
        userId: req.user._id,
        title: 'Order placed — let\'s confirm on WhatsApp',
        message: `Your order #${order.orderNumber} for ₹${totalAmount} is reserved! We'll chat on WhatsApp to confirm details and payment.`,
        type: 'order',
      });
      notifyAdmin({ title: `New order #${order.orderNumber} — wants to confirm on WhatsApp`, message: `${req.user.name} (${req.user.phone || 'no phone on file'}) placed an order for ₹${totalAmount} and wants to chat on WhatsApp before paying.` });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Customer taps "I've Paid" after scanning the UPI QR — flags the
//       order for manual verification by the shop owner.
// @route PUT /api/orders/:id/report-payment
export const reportPayment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'This order is already marked as paid' });
  if (order.orderStatus === 'Cancelled') return res.status(400).json({ message: 'This order was cancelled' });

  order.orderStatus = 'Payment Reported';
  order.statusHistory.push({ status: 'Payment Reported', note: 'Customer confirmed payment was sent' });
  await order.save();

  notifyAdmin({
    title: `Payment reported for order #${order.orderNumber}`,
    message: `The customer says they've paid ₹${order.totalAmount}${order.upiOwnerUsed ? ` to ${order.upiOwnerUsed}'s UPI` : ''}. Please check and verify it in the admin dashboard.`,
  });

  res.json(order);
};

// @desc Admin confirms payment was actually received.
// @route PUT /api/orders/:id/verify-payment
export const verifyPayment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.paymentStatus = 'paid';
  order.orderStatus = 'Payment Successful';
  order.paymentVerifiedAt = new Date();
  order.statusHistory.push({ status: 'Payment Successful', note: 'Payment verified by admin' });
  await order.save();

  notifyUser({
    userId: order.user,
    title: 'Payment confirmed! 🎉',
    message: `We've confirmed payment for order #${order.orderNumber}. We're getting started on it now!`,
    type: 'payment',
  });

  res.json(order);
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