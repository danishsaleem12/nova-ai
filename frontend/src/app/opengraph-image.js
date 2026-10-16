// src/app/opengraph-image.js
//
// Default social-sharing image for every page. Routes with their own opengraph-image.js
// (product, ai-tools, agents, resources) override it. Next.js builds the <meta og:image> tags.

import { renderOgImage } from "@/lib/og";
import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "NovaAI — The AI that thinks alongside you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "The AI that thinks alongside you",
    subtitle: SITE_DESCRIPTION,
  });
}
