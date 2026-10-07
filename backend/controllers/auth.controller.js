// backend/controllers/auth.controller.js

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { sendToken, clearToken } = require("../utils/generateToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* ---------------------------- SIGN UP ---------------------------- */
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const hint =
        existing.provider === "google"
          ? "This email is registered with Google. Please continue with Google."
          : "An account with this email already exists";
      return res.status(409).json({ message: hint });
    }

    const user = await User.create({ name, email, password, provider: "local" });
    user.lastLoginAt = new Date();
    await user.save();

    sendToken(res, user._id);
    return res.status(201).json({ user });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ message: first });
    }
    console.error("signup error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

/* ----------------------------- LOGIN ----------------------------- */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // password is select:false in the schema, so ask for it explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // Same message for "no user" and "wrong password" so emails can't be probed
    const invalid = () => res.status(401).json({ message: "Invalid email or password" });

    if (!user) return invalid();

    if (user.provider === "google" && !user.password) {
      return res
        .status(400)
        .json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return invalid();

    user.lastLoginAt = new Date();
    await user.save();

    sendToken(res, user._id);
    return res.json({ user });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

/* ------------------------- GOOGLE SIGN-IN ------------------------ */
// The frontend sends the Google ID token ("credential") it received.
async function googleAuth(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google login is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(400).json({ message: "Your Google email is not verified" });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });

    if (!user) {
      // brand new user
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        provider: "google",
        googleId: payload.sub,
        avatar: payload.picture || "",
      });
    } else if (!user.googleId) {
      // existing email/password account: link Google to it
      user.googleId = payload.sub;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
    }

    user.lastLoginAt = new Date();
    await user.save();

    sendToken(res, user._id);
    return res.json({ user });
  } catch (err) {
    console.error("google auth error:", err.message);
    return res.status(401).json({ message: "Google sign-in failed. Please try again." });
  }
}

/* ---------------------------- LOGOUT ----------------------------- */
function logout(_req, res) {
  clearToken(res);
  return res.json({ message: "Logged out" });
}

/* ------------------------- CURRENT USER -------------------------- */
// Runs after the `protect` middleware, so req.user is already loaded.
function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { signup, login, googleAuth, logout, me };