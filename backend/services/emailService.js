let nodemailer = null;
try {
  // Optional dependency: keep app working even when email is not configured.
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

let transporter = null;

function isEmailEnabled() {
  return (
    nodemailer &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.ADMIN_EMAIL
  );
}

function getTransporter() {
  if (!isEmailEnabled()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendAdminEmail({ subject, text }) {
  const client = getTransporter();
  if (!client) return false;

  await client.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject,
    text,
  });

  return true;
}

module.exports = {
  sendAdminEmail,
  isEmailEnabled,
};
