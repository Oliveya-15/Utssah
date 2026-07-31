import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Sends an email if SMTP is configured. If not configured, logs to console
// instead so the rest of the app keeps working during local development.
const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[Email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'Utsaah <no-reply@utsaah.com>',
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { sent: false, error: error.message };
  }
};

export default sendEmail;
