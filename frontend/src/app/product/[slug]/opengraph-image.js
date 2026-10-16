// src/app/product/[slug]/opengraph-image.js
//
// Social-sharing image for each /product/[slug] page, with the product name and tagline.

import { products } from "@/data/products";
import { renderOgImage } from "@/lib/og";

export const alt = "NovaAI product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const product = products[slug];
  return renderOgImage({
    badge: product?.badge || "NovaAI Product",
    title: product?.name || "NovaAI",
    subtitle: product?.tagline,
  });
}
