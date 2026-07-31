import ContactMessage from '../models/ContactMessage.js';

// @route POST /api/contact
export const submitContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json({ message: "Message received! We'll get back to you within 1 business day.", data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/contact/admin/all
export const getAllMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

// @route PUT /api/contact/:id/resolve
export const resolveMessage = async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};
