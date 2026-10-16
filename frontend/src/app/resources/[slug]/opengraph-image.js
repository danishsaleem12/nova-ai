// src/app/resources/[slug]/opengraph-image.js
//
// Social-sharing image for each /resources/[slug] page.

import { RESOURCES } from "@/data/resources";
import { renderOgImage } from "@/lib/og";

export const alt = "NovaAI resource";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const resource = RESOURCES[slug];
  return renderOgImage({
    badge: "Resources",
    title: resource?.name || "NovaAI",
    subtitle: resource?.lede,
  });
}
