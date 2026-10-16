# NovaAI — Frontend

The web app for **NovaAI**: a marketing site plus an AI chat app (no login or signup needed). Built with
[Next.js](https://nextjs.org) (App Router), React 19, Tailwind CSS 4 and Framer Motion.
It talks to the Express API in the `backend` project.

## Features

- **Marketing site**: landing page with hero, product suite, agents and testimonials.
- **Content pages** generated from data files: `/product/[slug]`, `/ai-tools/[slug]`, `/agents/[slug]`, `/resources/[slug]`.
- **Legal pages**: privacy policy, terms of service, cookies, GDPR, security.
- **AI chat** (`/chat`): streamed replies, model picker, text-file attachments, chats saved in the visitor's own browser (localStorage), so they are private to that device and need no account.
- **Newsletter**: subscribe, confirm and unsubscribe flows.
- **SEO**: per-page metadata, `robots.txt`, `sitemap.xml` and generated Open Graph images.
- **Error handling**: custom 404, error and loading screens.

## Requirements

- Node.js 20.9 or newer
- The [backend](../backend) running (default `http://localhost:5000`)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then edit the values (see below)
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

Set these in `.env.local` (development) or in your host's settings (production).
Every variable starts with `NEXT_PUBLIC_`, so its value is visible in the browser: never put secrets here.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend, e.g. `http://localhost:5000`. No trailing slash. |
| `NEXT_PUBLIC_SITE_URL` | In production | Public address of this site, e.g. `https://novaai.com`. Used for the sitemap, `robots.txt` and Open Graph image URLs. Defaults to `http://localhost:3000`. |

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create the production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/                 Routes (App Router)
    page.js            Landing page
    chat/              AI chat (open to everyone, chats saved in the browser)
    product/[slug]/, ai-tools/[slug]/, agents/[slug]/, resources/[slug]/
    newsletter/        confirm + unsubscribe pages
    privacy-policy/, terms-of-service/, cookies/, gdpr/, security/
    not-found.js, error.js, global-error.js, loading.js
    robots.js, sitemap.js, opengraph-image.js
  components/          UI components (product-visuals/, shared/, ...)
  data/                Content for the [slug] pages (products, tools, agents, resources)
  lib/
    api.js             fetch wrapper + API helpers (newsletterApi)
    site.js            Site name, description and URL used for SEO
    og.js              Draws the Open Graph images
```

### Adding a page to a `[slug]` section

- **Product**: add an entry in `src/data/products.js`.
- **Resource**: add an entry in `src/data/resources.js`.
- **AI tool**: add the slug and name to `src/data/tools.js`, and its content in `components/AIToolPage.js`.
- **Agent**: add the slug and name to `src/data/agents.js`, and its content in `components/AgentsPage.js`.

The route, sitemap entry and Open Graph image are created automatically.

## How it talks to the backend

- `src/lib/api.js` is a small fetch wrapper for the newsletter endpoints; it throws an `ApiError` with a readable message on failure. The chat page calls `POST /api/chat` directly and streams the reply.
- The backend must allow this site's origin: set its `FRONTEND_URL` to the address you serve this app from.

## Deployment

1. Deploy the backend first and note its public URL.
2. Deploy this app (Vercel works out of the box; any Node host can run `npm run build && npm start`).
3. Set `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_SITE_URL` **before** building.
4. In the backend, set `NODE_ENV=production` and `FRONTEND_URL` to this site's URL.
5. Check `/robots.txt`, `/sitemap.xml` and an Open Graph preview (e.g. paste a URL into a chat app) after deploying.
