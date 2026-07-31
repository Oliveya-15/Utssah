import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import generateToken from '../utils/generateToken.js';
import { notifyUser } from '../utils/notify.js';

// @desc  Register a new customer
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, birthday } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, phone, birthday });
    await Cart.create({ user: user._id, items: [] });
    await Wishlist.create({ user: user._id, products: [] });

    notifyUser({
      userId: user._id,
      title: 'Welcome to Utsaah! 🎉',
      message: `Hi ${user.name}, thank you for joining Utsaah — your home for handcrafted love. Explore our collection of crochet, custom gifts and decor made just for you.`,
      type: 'registration',
    });

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }
    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Admin login (same table, requires role admin)
// @route POST /api/auth/admin-login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'This account does not have admin access' });
    }
    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user.toSafeObject());
};
