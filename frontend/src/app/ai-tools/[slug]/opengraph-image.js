// src/app/ai-tools/[slug]/opengraph-image.js
//
// Social-sharing image for each /ai-tools/[slug] page.

import { TOOLS } from "@/data/tools";
import { renderOgImage } from "@/lib/og";

export const alt = "NovaAI tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const name = TOOLS[slug];
  return renderOgImage({
    badge: "AI Tool",
    title: name || "NovaAI",
    subtitle: name ? `${name}, one of the AI tools in the NovaAI platform.` : undefined,
  });
}
