// src/lib/og.js
//
// Draws the 1200x630 social-sharing image (Open Graph / Twitter card) that the
// opengraph-image.js files return. Built with next/og (Satori), which only understands a
// subset of CSS: every <div> with more than one child needs display:flex, and no Tailwind.

import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

const WIDTH = 1200;
const HEIGHT = 630;

function clip(text, max) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * @param {{ title: string, subtitle?: string, badge?: string }} props
 * @returns {ImageResponse}
 */
export function renderOgImage({ title, subtitle, badge }) {
  const safeTitle = clip(title, 70);
  const fontSize = safeTitle.length > 38 ? 64 : safeTitle.length > 22 ? 80 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #f6f4ff 0%, #e6eeff 50%, #f7e9ff 100%)",
          color: "#0f1030",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="#5b5bf0" />
            <path d="M12 14.6 L14.1 20 H9.9 Z" fill="#f472b6" />
          </svg>
          <div style={{ display: "flex", marginLeft: 16, fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {badge ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginBottom: 24,
                padding: "8px 22px",
                borderRadius: 999,
                background: "#ffffff",
                color: "#4f46e5",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {badge}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {safeTitle}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", marginTop: 24, fontSize: 34, lineHeight: 1.3, color: "#475069" }}>
              {clip(subtitle, 120)}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: 10,
            borderRadius: 999,
            background: "linear-gradient(90deg, #0ea5e9, #6366f1, #8b5cf6)",
          }}
        />
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
