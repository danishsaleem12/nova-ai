// backend/routes/newsletter.routes.js

const express = require("express");
const { subscribe, confirm, unsubscribe } = require("../controllers/newsletter.controller");
const { newsletterLimiter, tokenLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/subscribe", newsletterLimiter, subscribe);
router.post("/confirm", tokenLimiter, confirm); // token guessing is limited per IP
router.post("/unsubscribe", tokenLimiter, unsubscribe);

module.exports = router;
