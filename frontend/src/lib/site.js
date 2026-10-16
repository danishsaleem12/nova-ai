// src/lib/site.js
//
// Site-wide constants used by SEO files (metadata, robots, sitemap, OG images).
// Set NEXT_PUBLIC_SITE_URL to your real domain in production (no trailing slash needed).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "NovaAI";
export const SITE_TITLE = "NovaAI — The AI that thinks alongside you";
export const SITE_DESCRIPTION =
  "NovaAI is an AI assistant that learns how you work and helps you move faster.";

// Demo contact details. This is a demo project, so these are fictional.
// "example" is a reserved domain, so nothing sent here ever reaches a real inbox.
// Change CONTACT_DOMAIN (or the individual addresses) when you have a real one.
export const CONTACT_DOMAIN = "novaai.example";
export const CONTACT = {
  support: `support@${CONTACT_DOMAIN}`,
  sales: `sales@${CONTACT_DOMAIN}`,
  privacy: `privacy@${CONTACT_DOMAIN}`,
  legal: `legal@${CONTACT_DOMAIN}`,
  security: `security@${CONTACT_DOMAIN}`,
  dpo: `dpo@${CONTACT_DOMAIN}`,
  entity: "NovaAI, Inc.",
  address: "100 Market Street, Suite 400, San Francisco, CA 94105, USA",
  jurisdiction: "the State of California, United States",
};
