// backend/utils/email.js
//
// Sends transactional email (newsletter confirmation).
//
// Production: set SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM) and run `npm i nodemailer`.
// Development: with no SMTP_HOST the email is NOT sent. It is printed in the server console
// instead, so you can copy the confirm link without setting up a mail server.

const isProd = process.env.NODE_ENV === "production";

let transporter; // undefined = not created yet, null = email not available

function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST) return (transporter = null);
  try {
    const nodemailer = require("nodemailer"); // loaded lazily so the server still boots without it
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } catch {
    console.error("SMTP_HOST is set but nodemailer is not installed. Run: npm install nodemailer");
    transporter = null;
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    if (isProd) throw new Error("Email is not configured (set SMTP_HOST and install nodemailer)");
    console.log(`\n--- EMAIL (not sent: SMTP_HOST is not set) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n----------------------------------------------\n`);
    return;
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || "NovaAI <no-reply@localhost>",
    to,
    subject,
    text,
    html,
  });
}

/* ------------------------------ templates ------------------------------ */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function layout(bodyHtml) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f1030">
  <h2 style="margin:0 0 16px;color:#4f46e5">NovaAI</h2>
  ${bodyHtml}
  <p style="margin-top:32px;font-size:12px;color:#6b7280">You received this email because this address was used to subscribe to the NovaAI newsletter.</p>
</div>`;
}

function newsletterConfirmEmail({ link }) {
  const text =
    `Thanks for subscribing to the NovaAI Friday digest.\n\nConfirm your email to start receiving it:\n${link}\n\n` +
    `If you didn't sign up, ignore this email and you won't be subscribed.`;
  const html = layout(`<p>Thanks for subscribing to the NovaAI Friday digest.</p>
  <p><a href="${esc(link)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Confirm my subscription</a></p>
  <p style="font-size:13px;color:#4b5563">If the button doesn't work, paste this into your browser:<br>${esc(link)}</p>
  <p style="font-size:13px;color:#4b5563">If you didn't sign up, ignore this email and you won't be subscribed.</p>`);
  return { subject: "Confirm your NovaAI newsletter subscription", text, html };
}

module.exports = { sendEmail, newsletterConfirmEmail };
