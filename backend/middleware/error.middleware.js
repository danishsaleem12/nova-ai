// backend/middleware/error.middleware.js
//
// One place that turns any error into a clean JSON response: { message }.
// Controllers just `throw` (Express 5 forwards async errors automatically) or call next(err);
// expected problems become 4xx, everything else is logged and answered with a generic 500
// so internal details never reach the client.

// Unknown /api/... routes -> JSON 404 instead of Express's HTML page.
function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Headers already sent (e.g. an AI reply was streaming): we can't write JSON any more.
  // Let Express close the connection.
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Something went wrong. Please try again.";

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  } else if (err.type === "encoding.unsupported" || err.type === "charset.unsupported") {
    status = 415;
    message = "Unsupported request encoding";
  } else if (err.name === "ValidationError" && err.errors) {
    // Mongoose schema validation
    status = 400;
    message = Object.values(err.errors)[0]?.message || "Invalid data";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid value provided";
  } else if (err.code === 11000) {
    // Mongo duplicate key (e.g. two newsletter signups with the same email at once)
    status = 409;
    message = "That value is already in use";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired session. Please log in again.";
  } else {
    const s = err.status || err.statusCode;
    if (Number.isInteger(s) && s >= 400 && s < 500 && err.expose !== false) {
      status = s;
      message = err.message || message;
    }
  }

  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
