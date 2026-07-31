import Notification from '../models/Notification.js';

// @route GET /api/notifications
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
};

// @route PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!n) return res.status(404).json({ message: 'Notification not found' });
  res.json(n);
};

// @route PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked read' });
};
