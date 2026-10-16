# NovaAI — Backend

REST API for **NovaAI**, built with Express 5 and MongoDB (Mongoose). It proxies chat requests to an
AI provider (streaming the reply back) and runs the newsletter. There are no accounts or logins. The web app lives in the `frontend` project.

## Features

- **AI chat**: `POST /api/chat` streams the model's reply as plain text. No login is needed; it is rate limited per IP address. Text-file attachments are pasted into the prompt. Saved chats live in the visitor's browser, not on the server.
- **Newsletter**: double opt-in subscribe, confirm and unsubscribe by email token.
- **Safety**: Helmet headers, CORS limited to the frontend, JSON body limit (1 MB), input validation and per-route rate limits.

## Requirements

- Node.js 20 or newer
- A MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- An OpenAI-compatible chat API (base URL, key and model name) for `/api/chat`

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev               # auto-restarts on changes
```

The API listens on `PORT` (default `5000`, matching the frontend) and
`GET /api/health` should answer `{ "status": "ok" }`.

## Environment variables

Copy `.env.example` to `.env`. **Never commit `.env`.** If a real key was ever shared or committed, rotate it.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to listen on. Defaults to `5000`, which is what the frontend expects. |
| `FRONTEND_URL` | Yes | Exact origin of the web app, e.g. `http://localhost:3000`. Used for CORS and for links in emails. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `AI_BASE_URL` | Yes (chat) | Base URL of the AI API, e.g. `https://api.example.com/v1`. `/chat/completions` is appended. |
| `AI_API_KEY` | Yes (chat) | API key for the AI provider. |
| `AI_MODEL` | Yes (chat) | Default model name. Used when the client sends an unknown model id. |
| `CHAT_RATE_PER_MIN` | No | Max chat messages per visitor (IP address) per minute (default `20`). Chat is open to everyone, so keep this low. |
| `NODE_ENV` | In production | Set to `production` for the proxy default below. |
| `TRUST_PROXY` | No | Proxies in front of the app. Defaults to `1` in production, off locally. Use `false` if exposed directly. Avoid `true`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | In production | Mail server for newsletter confirmation emails. Without `SMTP_HOST`, emails are printed to the console (development only). |
| `EMAIL_FROM` | With SMTP | Sender, e.g. `"NovaAI <no-reply@yourdomain.com>"`. |

On startup the server warns about missing settings instead of crashing, so check the console if something fails.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start normally (use this in production) |
| `npm test` | Run the automated tests |

## API overview

All routes are under `/api`. Errors always look like `{ "message": "..." }`. No route needs a login.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/chat` | Stream an AI reply (`{ messages, model?, mode? }`), rate limited per IP |
| POST | `/newsletter/subscribe` | Subscribe an email (sends a confirmation) |
| POST | `/newsletter/confirm` | Confirm with the emailed token |
| POST | `/newsletter/unsubscribe` | Unsubscribe with a token |

### Chat request

```http
POST /api/chat
Content-Type: application/json

{
  "model": "nova-pro",
  "messages": [
    { "role": "user", "content": "Summarise this file", "attachments": [{ "name": "notes.txt", "text": "..." }] }
  ]
}
```

`model` is `nova-pro` or `nova-fast` (mapped in `controllers/chat.controller.js`); anything else uses `AI_MODEL`.
Only the last 20 messages are sent, and text and file sizes are capped. The response is `text/plain`, streamed as it is generated.

## Project structure

```
index.js               Entry point: loads .env, connects to MongoDB, starts the server
app.js                 Builds the Express app (middleware + routes); no side effects, so tests can import it
routes/                URL -> controller wiring, with rate limits
controllers/           Request handlers (chat, newsletter)
middleware/            rate limiters, error handling
models/                Mongoose model: Subscriber
utils/                 Email sending, chat message cleaning
tests/                 Automated tests (see below)
```

## Tests

```bash
npm test
```

Uses Node's built-in test runner (`node:test`), so there is nothing extra to install. The tests
need no database and no network: the AI provider's `fetch` is replaced with a fake, and
requests go through the real Express app over HTTP.

| File | Covers |
| --- | --- |
| `tests/chat.test.js` | `/chat`: works without login, validation, streaming, model mapping, modes, provider errors, per-IP rate limit |
| `tests/prepareMessages.test.js` | Message cleaning and file attachment limits |
| `tests/app.test.js` | Health check, JSON 404, security and CORS headers, removed auth routes |

Add new test files as `tests/*.test.js`; `tests/helpers.js` has the shared setup.

## Deployment notes

Before going live, set these on your host (never commit real values):

| Variable | Why |
| --- | --- |
| `NODE_ENV=production` | Production mode and the proxy default |
| `FRONTEND_URL` | Exact public address of the web app (CORS and email links) |
| `MONGODB_URI`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Database and chat provider |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Without `SMTP_HOST` the newsletter confirmation email is only printed in the server console (and fails in production) |

On the frontend host set `NEXT_PUBLIC_API_URL` (this backend's public URL) and `NEXT_PUBLIC_SITE_URL` before building.

If a `.env` or a zip containing real keys was ever shared, rotate the MongoDB password and the AI key.

- Set `NODE_ENV=production`, the real `FRONTEND_URL` and SMTP settings.
- Serve over HTTPS.
- Behind a proxy or load balancer (Render, Railway, Nginx, ...) leave `TRUST_PROXY` at its default of `1` so rate limits see real visitor IPs.
- Start with `npm start`.
