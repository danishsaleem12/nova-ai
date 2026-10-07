const express = require("express");
const { chat } = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware"); // check your real export name

const router = express.Router();

router.post("/", protect, chat);

module.exports = router;