import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @desc Get my cart (populated)
// @route GET /api/cart
export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');
  const items = cart.items.filter((i) => i.product); // drop deleted products
  res.json({ items });
};

// @desc Add / merge item to cart
// @route POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.isHidden) return res.status(404).json({ message: 'Product not found' });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }
    await cart.save();
    await cart.populate('items.product');
    res.status(201).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update quantity of a cart item
// @route PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/:productId
export const removeCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.json({ items: cart.items });
};

// @desc Merge a guest (localStorage) cart into the DB cart after login
// @route POST /api/cart/merge
export const mergeCart = async (req, res) => {
  try {
    const { items = [] } = req.body; // [{productId, quantity}]
    const cart = await getOrCreateCart(req.user._id);
    for (const { productId, quantity } of items) {
      const existing = cart.items.find((i) => i.product.toString() === productId);
      if (existing) existing.quantity += Number(quantity || 1);
      else cart.items.push({ product: productId, quantity: Number(quantity || 1) });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Clear cart (used after checkout)
// @route DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ items: [] });
};
