import User from '../models/User.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';

// @desc Update own profile
// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, birthday } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (birthday) user.birthday = birthday;
    await user.save();
    res.json(user.toSafeObject());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change password
// @route PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Addresses ----------

// @desc Get my addresses
// @route GET /api/users/addresses
export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json(addresses);
};

// @desc Add address
// @route POST /api/users/addresses
export const addAddress = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };
    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const count = await Address.countDocuments({ user: req.user._id });
    if (count === 0) data.isDefault = true; // first address is default automatically
    const address = await Address.create(data);
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update address
// @route PUT /api/users/addresses/:id
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    Object.assign(address, req.body);
    await address.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete address
// @route DELETE /api/users/addresses/:id
export const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  res.json({ message: 'Address removed' });
};

// ---------- Wallet ----------

// @desc Get wallet info + transaction-like summary from orders/refunds
// @route GET /api/users/wallet
export const getWallet = async (req, res) => {
  const user = await User.findById(req.user._id);
  const walletOrders = await Order.find({ user: req.user._id, walletUsed: { $gt: 0 } })
    .select('orderNumber walletUsed createdAt')
    .sort({ createdAt: -1 });
  res.json({
    balance: user.walletBalance,
    usageHistory: walletOrders,
  });
};
