const express = require("express");
const router = express.Router();
const Signup = require("../models/Signup");

// POST /api/waitlist — join the waitlist
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are both required" });
    }

    const existing = await Signup.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "This email is already on the waitlist" });
    }

    const signup = await Signup.create({ name, email });
    res.status(201).json(signup);
  } catch (err) {
    res.status(400).json({ message: "Failed to join waitlist", error: err.message });
  }
});

// GET /api/waitlist — list everyone who signed up, newest first
router.get("/", async (req, res) => {
  try {
    const signups = await Signup.find().sort({ createdAt: -1 });
    res.json({ count: signups.length, signups });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch waitlist", error: err.message });
  }
});

module.exports = router;
