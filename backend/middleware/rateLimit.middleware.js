// backend/middleware/rateLimit.middleware.js

const { rateLimit } = require("express-rate-limit");

// Every limiter answers with { message } so the frontend (which reads
// data.message) shows a friendly error instead of "Something went wrong".
function makeHandler(text) {
  return (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : undefined;
    res.status(429).json({ message: text, retryAfter });
  };
}

const base = {
  standardHeaders: "draft-7", // RateLimit / RateLimit-Policy headers
  legacyHeaders: false,
};

// Safety net for the whole API, per IP.
const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  handler: makeHandler("Too many requests. Please slow down and try again shortly."),
});

// Strict: newsletter confirm / unsubscribe token checks (stops token guessing), per IP.
// Successful requests don't count against the limit.
const tokenLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: makeHandler("Too many attempts. Please wait 15 minutes and try again."),
});

// Newsletter signups per IP. Each one can send an email, so keep it low (counts every request).
const newsletterLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 8,
  handler: makeHandler("Too many signups from this network. Please try again later."),
});

// Chat has no login, so it is limited per IP (the default key). Each chat request costs money
// (AI provider), so this is the one to tune: set CHAT_RATE_PER_MIN in .env.
// In production make sure TRUST_PROXY matches your hosting, or every visitor shares one IP.
const chatLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: Number(process.env.CHAT_RATE_PER_MIN) || 20,
  handler: makeHandler("You're sending messages too fast. Try again in a moment."),
});

module.exports = {
  globalLimiter,
  tokenLimiter,
  newsletterLimiter,
  chatLimiter,
};
