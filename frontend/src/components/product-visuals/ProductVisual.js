"use client";

/**
 * Renders the right animated mockup for a product's hero section.
 * Each case is its own small file (see this folder) — same pattern as
 * ChatMockup / ArtMountains etc. already living inside your AISuit.js,
 * just split out per product so ProductPage.js stays generic.
 *
 * Placeholder bodies for now — real 3D/glossy mockups generated next.
 */

import ChatVisual from "./ChatVisual";
import ImageVisual from "./ImageVisual";
import VoiceVisual from "./VoiceVisual";
import DocsVisual from "./DocsVisual";
import CodeVisual from "./CodeVisual";

const VISUALS = {
  chat: ChatVisual,
  image: ImageVisual,
  voice: VoiceVisual,
  docs: DocsVisual,
  code: CodeVisual,
};

export default function ProductVisual({ kind }) {
  const Visual = VISUALS[kind] || ChatVisual;
  return <Visual />;
}
