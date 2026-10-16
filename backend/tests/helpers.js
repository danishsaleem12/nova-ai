// tests/helpers.js
//
// Shared setup for the API tests. No database and no extra packages are needed:
//  - requests go through a real HTTP server on a random port, using node:http
//
// IMPORTANT: the env vars below must be set BEFORE app.js is loaded, because the app and the
// rate limiters read them when they are first required. That is why this file is imported first.

process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:3000";
// Trust X-Forwarded-For from the local test client, so every test request can pretend to come
// from its own IP and the per-IP rate limiters never get in the way of unrelated tests.
process.env.TRUST_PROXY = "loopback";
process.env.AI_BASE_URL = "http://ai.test/v1";
process.env.AI_API_KEY = "test-ai-key";
process.env.AI_MODEL = "default-model";
process.env.CHAT_RATE_PER_MIN = "8";

const http = require("node:http");
const { once } = require("node:events");

const { app } = require("../app");

let nextIp = 1;

async function startServer() {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  return {
    port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** A fresh fake client IP (sent as X-Forwarded-For). Each IP gets its own rate-limit bucket. */
function newIp() {
  return `10.${(nextIp >> 16) & 255}.${(nextIp >> 8) & 255}.${nextIp++ & 255}`;
}

/**
 * Sends one HTTP request and resolves with { status, headers, text, json }.
 *   request(server, "POST", "/api/chat", { body: {...}, ip: "10.0.0.1" })
 * `body` is JSON-encoded unless `rawBody` is given. Every request pretends to come from its own
 * IP unless you pass `ip` (use one IP to test the per-IP rate limit).
 */
function request(server, method, path, { body, rawBody, ip = newIp(), headers = {} } = {}) {
  const payload = rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port: server.port,
        method,
        path,
        headers: {
          "X-Forwarded-For": ip,
          ...(payload !== undefined
            ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
            : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            /* not JSON (e.g. the streamed chat reply) */
          }
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      }
    );
    req.on("error", reject);
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

module.exports = { startServer, request, newIp };
