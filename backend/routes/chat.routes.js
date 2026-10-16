const express = require("express");
const { chat } = require("../controllers/chat.controller");
const { chatLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

// No login: chat is open to everyone, so the limiter (per IP) is what protects the AI bill.
router.post("/", chatLimiter, chat);

module.exports = router;
