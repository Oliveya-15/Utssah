import CustomRequest from '../models/CustomRequest.js';
import { notifyUser } from '../utils/notify.js';

// @desc Submit a custom order request (guest or logged in)
// @route POST /api/custom-requests
export const createCustomRequest = async (req, res) => {
  try {
    const { name, email, phone, productType, preferredColors, preferredSize, notes, contactPreference } = req.body;
    const inspirationImages = (req.files || []).map((f) => f.path);

    const request = await CustomRequest.create({
      user: req.user ? req.user._id : null,
      name, email, phone, productType, preferredColors, preferredSize, notes,
      contactPreference: contactPreference || 'WhatsApp',
      inspirationImages,
    });

    if (req.user) {
      notifyUser({
        userId: req.user._id,
        title: 'Custom order request received 🧶',
        message: `Thanks ${name}! We've received your custom request for "${productType}". Our team will get back to you within 1 business day.`,
        type: 'general',
      });
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my custom requests
// @route GET /api/custom-requests/my
export const getMyCustomRequests = async (req, res) => {
  const requests = await CustomRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
};

// ---------- Admin ----------

// @route GET /api/custom-requests/admin/all
export const getAllCustomRequests = async (req, res) => {
  const requests = await CustomRequest.find().sort({ createdAt: -1 });
  res.json(requests);
};

// @route PUT /api/custom-requests/:id
export const updateCustomRequest = async (req, res) => {
  const request = await CustomRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  const { status, adminReply, quotedPrice } = req.body;
  if (status) request.status = status;
  if (adminReply !== undefined) request.adminReply = adminReply;
  if (quotedPrice !== undefined) request.quotedPrice = quotedPrice;
  await request.save();

  if (request.user) {
    notifyUser({
      userId: request.user,
      title: 'Update on your custom order request',
      message: `Your custom request for "${request.productType}" is now: ${request.status}.${adminReply ? ' Note: ' + adminReply : ''}`,
      type: 'general',
    });
  }
  res.json(request);
};