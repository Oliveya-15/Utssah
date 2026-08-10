import Notification from '../models/Notification.js';
import sendEmail from './sendEmail.js';
import User from '../models/User.js';

// Emails the business owner directly (not an in-app notification, since
// admins don't have a notification inbox in this build) for events that
// need a human to act — new orders, and "I've paid" reports awaiting
// manual verification. Best-effort: never throws.
export const notifyAdmin = async ({ title, message }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    await sendEmail({
      to: adminEmail,
      subject: title,
      html: `<div style="font-family:sans-serif;padding:24px;color:#3A2A24;">
        <h2 style="color:#D6336C;">${title}</h2>
        <p>${message}</p>
      </div>`,
    });
  } catch (error) {
    console.error('notifyAdmin failed:', error.message);
  }
};

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