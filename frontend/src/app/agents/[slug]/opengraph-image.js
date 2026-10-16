// src/app/agents/[slug]/opengraph-image.js
//
// Social-sharing image for each /agents/[slug] page.

import { AGENTS } from "@/data/agents";
import { renderOgImage } from "@/lib/og";

export const alt = "NovaAI agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const name = AGENTS[slug];
  return renderOgImage({
    badge: "Autonomous Agent",
    title: name || "NovaAI",
    subtitle: name ? `${name}, one of the autonomous agents in the NovaAI platform.` : undefined,
  });
}
