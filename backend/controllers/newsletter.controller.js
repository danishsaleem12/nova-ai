// backend/controllers/newsletter.controller.js
//
// Public newsletter endpoints (no login needed):
//   POST /api/newsletter/subscribe    { email, source? }  -> sends a confirmation email
//   POST /api/newsletter/confirm      { token }           -> activates the subscription
//   POST /api/newsletter/unsubscribe  { token }           -> stops emails

const crypto = require("crypto");
const Subscriber = require("../models/Subscriber");
const { sendEmail, newsletterConfirmEmail } = require("../utils/email");

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_EMAIL = 254;
const TOKEN_RE = /^[a-f0-9]{48}$/;
const RESEND_COOLDOWN_MS = 60 * 1000;

const isString = (v) => typeof v === "string";
const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
const newToken = () => crypto.randomBytes(24).toString("hex"); // 48 hex chars

// "ai-blog" ok, anything odd falls back to "website"
function cleanSource(value) {
  const s = isString(value) ? value.trim().toLowerCase() : "";
  return /^[a-z0-9_-]{1,40}$/.test(s) ? s : "website";
}

function sendConfirmation(sub) {
  const link = `${frontendUrl()}/newsletter/confirm?token=${sub.token}`;
  sendEmail({ to: sub.email, ...newsletterConfirmEmail({ link }) }).catch((err) =>
    console.error("newsletter email error:", err.message)
  );
}

/* ---------------------------- SUBSCRIBE ---------------------------- */
// Same answer for new, pending and already-subscribed addresses, so the form can't be
// used to find out who is on the list.
async function subscribe(req, res, next) {
  try {
    const { email, source } = req.body || {};
    if (!isString(email) || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const clean = email.trim().toLowerCase();
    if (clean.length > MAX_EMAIL || !EMAIL_RE.test(clean)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const reply = { message: "Almost there! Check your inbox and confirm your email to finish subscribing." };

    let sub = await Subscriber.findOne({ email: clean });

    if (!sub) {
      try {
        sub = await Subscriber.create({
          email: clean,
          token: newToken(),
          source: cleanSource(source),
          lastEmailAt: new Date(),
        });
        sendConfirmation(sub);
      } catch (err) {
        if (err.code !== 11000) throw err; // two requests at once: the other one sends the email
      }
      return res.json(reply);
    }

    if (sub.status === "subscribed") return res.json(reply); // nothing to do, say nothing

    // pending or unsubscribed: (re)send a confirmation, at most once a minute
    if (!sub.lastEmailAt || Date.now() - sub.lastEmailAt.getTime() > RESEND_COOLDOWN_MS) {
      sub.status = "pending"; // someone who left must confirm again
      sub.lastEmailAt = new Date();
      await sub.save();
      sendConfirmation(sub);
    }
    return res.json(reply);
  } catch (err) {
    return next(err);
  }
}

/* ----------------------- CONFIRM / UNSUBSCRIBE --------------------- */
function tokenOf(req) {
  const { token } = req.body || {};
  return isString(token) && TOKEN_RE.test(token) ? token : null;
}

async function confirm(req, res, next) {
  try {
    const token = tokenOf(req);
    if (!token) return res.status(400).json({ message: "This confirmation link is not valid." });

    const sub = await Subscriber.findOne({ token });
    if (!sub) return res.status(400).json({ message: "This confirmation link is not valid." });

    // A person who already unsubscribed must not be re-subscribed by an old link
    if (sub.status === "unsubscribed") {
      return res.status(400).json({ message: "You unsubscribed since then. Please subscribe again to get a new link." });
    }
    if (sub.status === "pending") {
      sub.status = "subscribed";
      sub.confirmedAt = new Date();
      await sub.save();
    }
    return res.json({ message: "You're subscribed. Thanks for confirming!" });
  } catch (err) {
    return next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const token = tokenOf(req);
    if (!token) return res.status(400).json({ message: "This unsubscribe link is not valid." });

    const sub = await Subscriber.findOne({ token });
    if (!sub) return res.status(400).json({ message: "This unsubscribe link is not valid." });

    if (sub.status !== "unsubscribed") {
      sub.status = "unsubscribed";
      sub.unsubscribedAt = new Date();
      await sub.save();
    }
    return res.json({ message: "You've been unsubscribed. You won't get any more emails from us." });
  } catch (err) {
    return next(err);
  }
}

module.exports = { subscribe, confirm, unsubscribe };
