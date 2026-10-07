// backend/utils/generateToken.js

const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";

// Convert values like "7d" / "12h" into milliseconds for the cookie's maxAge
function toMs(value) {
  const match = /^(\d+)([smhd])$/.exec(String(value));
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const n = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
  return n * unit;
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? "none" : "lax", // "none" is needed if frontend and backend are on different domains
    maxAge: toMs(process.env.JWT_EXPIRES_IN || "7d"),
    path: "/",
  };
}

// Create a token and attach it to the response as a cookie
function sendToken(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return token;
}

function clearToken(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
}

module.exports = { COOKIE_NAME, signToken, sendToken, clearToken };