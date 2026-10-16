// app.js
//
// Builds the Express app (middleware + routes) but does NOT connect to MongoDB or listen on a
// port. index.js does that. Keeping them apart lets the tests import the app and call it directly.

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const chatRoutes = require("./routes/chat.routes");
const newsletterRoutes = require("./routes/newsletter.routes");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ---- Trust proxy -----------------------------------------------------------------
// In production the app sits behind a proxy / load balancer (Render, Railway, Heroku,
// Nginx, ...) that terminates HTTPS. Without "trust proxy", Express sees plain HTTP from
// the proxy: req.secure is false, req.protocol is "http" and every visitor has the proxy's
// IP (so rate limiting would treat everyone as one person).
// Default: 1 hop in production, off locally. Override with TRUST_PROXY:
//   "1" / "2" ... number of proxies in front | "false" or "0" = off | "loopback", a subnet...
// Don't use "true": it trusts every X-Forwarded-For value, which lets clients fake their IP.
const isProd = process.env.NODE_ENV === "production";
function parseTrustProxy(value) {
  if (value === undefined || value === "") return isProd ? 1 : false;
  const v = String(value).trim().toLowerCase();
  if (v === "false") return false;
  if (/^\d+$/.test(v)) return Number(v);
  return value; // keyword or subnet list, passed to Express as-is
}
const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
app.set("trust proxy", trustProxy);

// Security headers. This server only returns JSON/streamed text, and the frontend
// lives on another origin, so allow cross-origin reads of responses (CORS still decides who).
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: FRONTEND_URL }));
app.use("/api", globalLimiter); // before body parsing, so floods are cut off cheaply
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NovaAI backend is running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/newsletter", newsletterRoutes);

// Must stay last: unknown /api routes -> JSON 404, then every error -> one JSON response
app.use("/api", notFound);
app.use(errorHandler);

module.exports = { app, trustProxy, isProd, FRONTEND_URL };
