//index.js
//
// Entry point: loads .env, checks the config, connects to MongoDB and starts listening.
// The Express app itself lives in app.js.

require("dotenv").config();
const mongoose = require("mongoose");
const { app, trustProxy, isProd, FRONTEND_URL } = require("./app");

// 5000 matches the frontend's default NEXT_PUBLIC_API_URL (http://localhost:5000)
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    "⚠️  No MONGODB_URI found in .env — the server will start, but the API will fail until you add one."
  );
}
if (isProd && /localhost|127\.0\.0\.1/.test(FRONTEND_URL)) {
  console.warn(
    "⚠️  NODE_ENV=production but FRONTEND_URL is still " + FRONTEND_URL +
      " — set it to your real frontend URL or browsers will block requests."
  );
}
if (isProd && !process.env.SMTP_HOST) {
  console.warn(
    "⚠️  SMTP_HOST is not set — newsletter confirmation emails cannot be sent in production. See .env.example."
  );
}
if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
  console.warn(
    "⚠️  AI_API_KEY / AI_BASE_URL / AI_MODEL missing in .env — /api/chat will fail until you add them."
  );
}

// Fail fast instead of hanging for 30 s when MongoDB is unreachable, and keep a small, steady
// connection pool (enough for this API, cheap for the database).
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: Number(process.env.MONGODB_POOL_SIZE) || 10,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

const server = app.listen(PORT, () => {
  console.log(`NovaAI backend listening on http://localhost:${PORT} (trust proxy: ${trustProxy})`);
});

// Hosting proxies (Render, AWS load balancers, Nginx ...) close idle connections after ~60 s.
// Node's default keep-alive is only 5 s, which makes the proxy reuse sockets Node already closed
// (random 502 errors). Keep ours longer than the proxy's timeout. Chat answers stream for a
// while, so the overall request timeout is left generous.
server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;

// Graceful shutdown: on deploy/restart finish the requests in progress (including a chat answer
// that is still streaming) and close the database, instead of cutting everyone off.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch {
      /* already closed */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 15000).unref(); // never hang forever
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// A forgotten .catch() somewhere should be logged, not silently ignored.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
