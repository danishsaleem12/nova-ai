//src/data/products.js

/**
 * Single source of truth for every /product/[slug] page.
 * Add a new product by adding a new key here — no new component needed.
 *
 * `visual` must match a case in ProductPage.js's <ProductVisual /> switch.
 */

import {
  MessageCircle,
  Image as ImageIcon,
  Mic,
  FileText,
  Code2,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  RefreshCw,
  BarChart3,
} from "lucide-react";

export const products = {
  "ai-chat": {
    slug: "ai-chat",
    name: "AI Chat",
    tagline: "Talk to a smart assistant",
    icon: MessageCircle,
    badge: "Conversational AI",
    gradient: "from-blue-500 to-violet-600",
    glow: "bg-blue-300/30",
    heading: [
      { text: "Chat" },
      { text: "that" },
      { br: true },
      { text: "understands you.", gradient: "from-blue-500 to-violet-600" },
    ],
    subtext:
      "Natural conversations with context, memory, and speed — ask anything and get answers that actually help.",
    visual: "chat",
    ctaHref: "/chat",
    features: [
      {
        icon: MessageCircle,
        title: "Context aware",
        text: "Remembers the whole thread, not just the last message.",
      },
      {
        icon: Zap,
        title: "Fast responses",
        text: "Low-latency streaming so replies feel instant.",
      },
      {
        icon: ShieldCheck,
        title: "Private by default",
        text: "Your conversations are never used to train other models.",
      },
    ],
  },

  "ai-image": {
    slug: "ai-image",
    name: "AI Image",
    tagline: "Create stunning visuals",
    icon: ImageIcon,
    badge: "Image Generation",
    gradient: "from-fuchsia-500 to-purple-600",
    glow: "bg-fuchsia-300/25",
    heading: [
      { text: "Ideas," },
      { text: "rendered" },
      { br: true },
      { text: "in seconds.", gradient: "from-fuchsia-500 via-violet-500 to-purple-600" },
    ],
    subtext: "Turn a simple prompt into polished, on-brand visuals — no design skills required.",
    visual: "image",
    ctaHref: "/chat",
    features: [
      {
        icon: Sparkles,
        title: "Style presets",
        text: "Photographic, illustrated, 3D, and more, one click away.",
      },
      {
        icon: RefreshCw,
        title: "Instant variations",
        text: "Regenerate and remix until it's exactly right.",
      },
      {
        icon: ImageIcon,
        title: "High resolution",
        text: "Export production-ready files up to 4K.",
      },
    ],
  },

  "ai-voice": {
    slug: "ai-voice",
    name: "AI Voice",
    tagline: "Speak, listen, transcribe",
    icon: Mic,
    badge: "Voice Intelligence",
    gradient: "from-sky-500 to-blue-600",
    glow: "bg-sky-300/30",
    heading: [
      { text: "Your" },
      { text: "voice," },
      { br: true },
      { text: "understood instantly.", gradient: "from-sky-500 via-blue-500 to-indigo-600" },
    ],
    subtext: "Real-time transcription and natural speech, tuned for accents, noise, and long conversations.",
    visual: "voice",
    ctaHref: "/chat",
    features: [
      {
        icon: Mic,
        title: "Live transcription",
        text: "Accurate captions as people speak, not after.",
      },
      {
        icon: Sparkles,
        title: "Natural speech",
        text: "Text-to-speech that doesn't sound robotic.",
      },
      {
        icon: Zap,
        title: "Low latency",
        text: "Built for real-time calls and voice agents.",
      },
    ],
  },

  "ai-documents": {
    slug: "ai-documents",
    name: "AI Documents",
    tagline: "Read, write and edit files",
    icon: FileText,
    badge: "Document Intelligence",
    gradient: "from-indigo-500 to-blue-600",
    glow: "bg-indigo-300/30",
    heading: [
      { text: "Every" },
      { text: "document," },
      { br: true },
      { text: "understood at a glance.", gradient: "from-indigo-500 via-blue-500 to-sky-500" },
    ],
    subtext: "Summarize, search, and edit long documents without reading every page yourself.",
    visual: "docs",
    ctaHref: "/chat",
    features: [
      {
        icon: Search,
        title: "Ask your files",
        text: "Query a 200-page PDF like it's a conversation.",
      },
      {
        icon: FileText,
        title: "Smart summaries",
        text: "Get the key points in seconds, with citations.",
      },
      {
        icon: RefreshCw,
        title: "In-place editing",
        text: "Rewrite, restructure, and reformat without leaving the doc.",
      },
    ],
  },

  "ai-code": {
    slug: "ai-code",
    name: "AI Code",
    tagline: "Ship code faster",
    icon: Code2,
    badge: "Developer Tools",
    gradient: "from-emerald-500 to-teal-600",
    glow: "bg-emerald-300/25",
    heading: [
      { text: "Write" },
      { text: "less." },
      { br: true },
      { text: "Ship more.", gradient: "from-emerald-500 via-teal-500 to-sky-500" },
    ],
    subtext: "An AI pair programmer that reads your whole codebase, not just the open file.",
    visual: "code",
    ctaHref: "/chat",
    features: [
      {
        icon: Code2,
        title: "Codebase aware",
        text: "Understands your repo's structure and conventions.",
      },
      {
        icon: BarChart3,
        title: "Refactor safely",
        text: "Large changes with tests and diffs you can review.",
      },
      {
        icon: Zap,
        title: "Inline suggestions",
        text: "Autocomplete that thinks a few lines ahead.",
      },
    ],
  },
};

export const productList = Object.values(products);