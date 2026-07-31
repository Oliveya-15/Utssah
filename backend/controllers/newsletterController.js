import Newsletter from '../models/Newsletter.js';

// @route POST /api/newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(200).json({ message: "You're already subscribed! 🎉" });
    await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully! Welcome to the Utsaah family 🌸' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/newsletter/admin/all
export const getAllSubscribers = async (req, res) => {
  const subs = await Newsletter.find().sort({ createdAt: -1 });
  res.json(subs);
};
