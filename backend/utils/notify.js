import Notification from '../models/Notification.js';
import sendEmail from './sendEmail.js';
import User from '../models/User.js';

// Creates an in-app notification and (best-effort) sends an email.
export const notifyUser = async ({ userId, title, message, type = 'general', link = '', sendEmailToo = true }) => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
    if (sendEmailToo) {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `<div style="font-family:sans-serif;padding:24px;color:#3A2A24;">
            <h2 style="color:#E8663D;">${title}</h2>
            <p>${message}</p>
            <p style="margin-top:24px;font-size:12px;color:#999;">— Team Utsaah</p>
          </div>`,
        });
      }
    }
  } catch (error) {
    console.error('notifyUser failed:', error.message);
  }
};
