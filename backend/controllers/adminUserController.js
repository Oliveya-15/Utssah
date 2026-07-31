import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc Admin - get all customers with purchase summary
// @route GET /api/users/admin/customers
export const getAllCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
  const orders = await Order.find({ paymentStatus: 'paid' });

  const summaryByUser = {};
  orders.forEach((o) => {
    const uid = o.user.toString();
    if (!summaryByUser[uid]) summaryByUser[uid] = { totalOrders: 0, totalSpent: 0 };
    summaryByUser[uid].totalOrders += 1;
    summaryByUser[uid].totalSpent += o.totalAmount;
  });

  const result = customers.map((c) => ({
    ...c.toSafeObject(),
    totalOrders: summaryByUser[c._id.toString()]?.totalOrders || 0,
    totalSpent: summaryByUser[c._id.toString()]?.totalSpent || 0,
  }));

  res.json(result);
};

// @desc Admin - get single customer detail + order history
// @route GET /api/users/admin/customers/:id
export const getCustomerDetail = async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  res.json({ customer: customer.toSafeObject(), orders });
};

// @desc Admin - toggle active/deactivate a customer account
// @route PUT /api/users/admin/customers/:id/toggle-active
export const toggleCustomerActive = async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  customer.isActive = !customer.isActive;
  await customer.save();
  res.json(customer.toSafeObject());
};
