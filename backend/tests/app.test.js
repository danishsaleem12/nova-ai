// tests/app.test.js
//
// App-level behaviour: health check, JSON 404 for unknown API routes, error handler.

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer, request } = require("./helpers");

let server;
before(async () => {
  server = await startServer();
});
after(async () => {
  await server.close();
});

describe("app", () => {
  it("GET /api/health reports ok", async () => {
    const res = await request(server, "GET", "/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.json.status, "ok");
  });

  it("answers unknown /api routes with a JSON 404", async () => {
    const res = await request(server, "GET", "/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.deepEqual(res.json, { message: "Route not found" });
  });

  it("sets security headers (helmet)", async () => {
    const res = await request(server, "GET", "/api/health");
    assert.equal(res.headers["x-content-type-options"], "nosniff");
    assert.equal(res.headers["x-powered-by"], undefined);
  });

  it("only allows CORS from FRONTEND_URL", async () => {
    const res = await request(server, "GET", "/api/health", { headers: { Origin: "http://localhost:3000" } });
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3000");
  });

  it("no longer has login, signup or account routes", async () => {
    for (const path of ["/api/auth/login", "/api/auth/signup", "/api/auth/me", "/api/conversations"]) {
      const res = await request(server, "GET", path);
      assert.equal(res.status, 404, path);
    }
  });
});
