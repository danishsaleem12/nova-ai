//index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// const waitlistRoutes = require("./routes/waitlist.routes");
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();
const PORT = process.env.PORT || 4001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Cortexa backend is running" });
});

// app.use("/api/waitlist", waitlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

if (!MONGODB_URI) {
  console.warn(
    "⚠️  No MONGODB_URI found in .env — the server will start, but the API will fail until you add one."
  );
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  No JWT_SECRET found in .env — login and signup will fail until you add one.");
}
if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
  console.warn(
    "⚠️  AI_API_KEY / AI_BASE_URL / AI_MODEL missing in .env — /api/chat will fail until you add them."
  );
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.listen(PORT, () => {
  console.log(`Cortexa backend listening on http://localhost:${PORT}`);
});