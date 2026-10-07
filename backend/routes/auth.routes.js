// backend/routes/auth.routes.js

const express = require("express");
const { signup, login, googleAuth, logout, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;