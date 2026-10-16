// src/app/robots.js
//
// Served at /robots.txt. Public marketing pages are crawlable; pages that only make sense
// for the app itself (or that carry one-time tokens in the URL) are kept out of search.

import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/chat", "/newsletter/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
