// src/data/tools.js
//
// Slug -> name for every /ai-tools/[slug] page. The full content for each tool lives in
// components/AIToolPage.js (keyed by the same slugs). Add a new tool here and there.
// Plain module (no "use client") so server code, the sitemap and OG images can import it.

export const TOOLS = {
  "ai-writer": "AI Writer",
  "image-generator": "Image Generator",
  "data-analyzer": "Data Analyzer",
  "code-assistant": "Code Assistant",
  "ai-summarizer": "AI Summarizer",
};
