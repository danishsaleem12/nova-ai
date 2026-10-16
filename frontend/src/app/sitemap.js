// src/app/sitemap.js
//
// Served at /sitemap.xml. Built from the same slug lists the pages use, so a new product,
// tool, agent or resource appears here automatically.

import { SITE_URL } from "@/lib/site";
import { products } from "@/data/products";
import { RESOURCE_SLUGS } from "@/data/resources";
import { TOOLS } from "@/data/tools";
import { AGENTS } from "@/data/agents";

const LEGAL_PAGES = ["privacy-policy", "terms-of-service", "cookies", "gdpr", "security"];

export default function sitemap() {
  const entry = (path, priority, changeFrequency = "monthly") => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  });

  return [
    entry("/", 1, "weekly"),
    ...Object.keys(products).map((slug) => entry(`/product/${slug}`, 0.8)),
    ...Object.keys(TOOLS).map((slug) => entry(`/ai-tools/${slug}`, 0.8)),
    ...Object.keys(AGENTS).map((slug) => entry(`/agents/${slug}`, 0.8)),
    ...RESOURCE_SLUGS.map((slug) => entry(`/resources/${slug}`, 0.6)),
    entry("/chat", 0.7),
    ...LEGAL_PAGES.map((slug) => entry(`/${slug}`, 0.2, "yearly")),
  ];
}
