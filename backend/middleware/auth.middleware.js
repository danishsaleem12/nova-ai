// backend/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { COOKIE_NAME } = require("../utils/generateToken");

async function protect(req, res, next) {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Fallback: Authorization: Bearer <token> (handy for Postman/mobile)
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Session expired, please log in again" : "Invalid token";
    return res.status(401).json({ message });
  }
}

module.exports = { protect };