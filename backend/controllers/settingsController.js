import Settings from '../models/Settings.js';

// @desc Public — only what checkout needs: the currently-active owner's
//       name/UPI id, business name, and WhatsApp number. Never exposes the
//       inactive owner's UPI id.
// @route GET /api/settings
export const getPublicSettings = async (req, res) => {
  const s = await Settings.getSingleton();
  const activeName = s.activeOwner === 'one' ? s.ownerOneName : s.ownerTwoName;
  const activeUpiId = s.activeOwner === 'one' ? s.ownerOneUpiId : s.ownerTwoUpiId;
  res.json({
    businessName: s.businessName,
    activeOwnerName: activeName,
    activeUpiId,
    upiConfigured: !!activeUpiId,
    whatsappNumber: s.whatsappNumber,
  });
};

// @desc Admin — full settings for the settings form
// @route GET /api/settings/admin
export const getAdminSettings = async (req, res) => {
  const s = await Settings.getSingleton();
  res.json(s);
};

// @desc Admin — update settings
// @route PUT /api/settings/admin
export const updateSettings = async (req, res) => {
  const s = await Settings.getSingleton();
  const fields = ['businessName', 'ownerOneName', 'ownerOneUpiId', 'ownerTwoName', 'ownerTwoUpiId', 'activeOwner', 'whatsappNumber'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) s[f] = req.body[f];
  });
  await s.save();
  res.json(s);
};