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
    tagline: "Coming soon",
    icon: ImageIcon,
    badge: "Coming soon",
    soon: true,
    soonNote: "AI Image is on our roadmap and isn't available yet. The preview below is a design mockup, not a working feature.",
    gradient: "from-fuchsia-500 to-purple-600",
    glow: "bg-fuchsia-300/25",
    heading: [
      { text: "Ideas," },
      { text: "rendered" },
      { br: true },
      { text: "from a prompt.", gradient: "from-fuchsia-500 via-violet-500 to-purple-600" },
    ],
    subtext: "We're working on turning a simple prompt into an image. Here's what we're planning to build.",
    visual: "image",
    ctaHref: "/chat",
    features: [
      {
        icon: Sparkles,
        title: "Prompt to image",
        text: "Planned: describe what you want and get an image back.",
      },
      {
        icon: RefreshCw,
        title: "Variations",
        text: "Planned: regenerate and remix until it's right.",
      },
      {
        icon: ImageIcon,
        title: "Style presets",
        text: "Planned: pick a look, like photographic, illustrated or 3D.",
      },
    ],
  },

  "ai-voice": {
    slug: "ai-voice",
    name: "AI Voice",
    tagline: "Speak and listen",
    icon: Mic,
    badge: "Voice Chat",
    gradient: "from-sky-500 to-blue-600",
    glow: "bg-sky-300/30",
    heading: [
      { text: "Talk" },
      { text: "to" },
      { br: true },
      { text: "your AI.", gradient: "from-sky-500 via-blue-500 to-indigo-600" },
    ],
    subtext: "Speak your message with the microphone and hear NovaAI's replies read aloud, right in your browser.",
    visual: "voice",
    ctaHref: "/chat?mode=voice",
    ctaLabel: "Try Voice mode",
    features: [
      {
        icon: Mic,
        title: "Voice dictation",
        text: "Tap the mic and your speech appears as text, ready to send.",
      },
      {
        icon: Sparkles,
        title: "Read aloud",
        text: "Hear any reply spoken back. In Voice mode, replies play automatically.",
      },
      {
        icon: Zap,
        title: "Nothing to install",
        text: "Uses your browser's built-in speech support. Works best in Chrome, Edge and Safari.",
      },
    ],
  },

  "ai-documents": {
    slug: "ai-documents",
    name: "AI Documents",
    tagline: "Summarize and rewrite text",
    icon: FileText,
    badge: "Document Assistant",
    gradient: "from-indigo-500 to-blue-600",
    glow: "bg-indigo-300/30",
    heading: [
      { text: "Your" },
      { text: "text," },
      { br: true },
      { text: "understood at a glance.", gradient: "from-indigo-500 via-blue-500 to-sky-500" },
    ],
    subtext: "Attach a text file or paste your text, then summarize it, ask questions about it or rewrite it.",
    visual: "docs",
    ctaHref: "/chat?mode=docs",
    ctaLabel: "Open Documents mode",
    features: [
      {
        icon: Search,
        title: "Ask your files",
        text: "Attach text files (.txt, .md, .csv, .json and more) and ask questions about them.",
      },
      {
        icon: BarChart3,
        title: "Smart summaries",
        text: "Get the key points and action items from long text in seconds.",
      },
      {
        icon: FileText,
        title: "Rewrite and proofread",
        text: "Make text clearer, shorter or more formal, then copy the result. PDF and Word files aren't supported yet.",
      },
    ],
  },

  "ai-code": {
    slug: "ai-code",
    name: "AI Code",
    tagline: "Explain, debug and write code",
    icon: Code2,
    badge: "Code Assistant",
    gradient: "from-emerald-500 to-teal-600",
    glow: "bg-emerald-300/25",
    heading: [
      { text: "Write" },
      { text: "less." },
      { br: true },
      { text: "Ship more.", gradient: "from-emerald-500 via-teal-500 to-sky-500" },
    ],
    subtext: "Paste or attach code and get explanations, bug fixes, refactors and tests, with every answer in clean code blocks.",
    visual: "code",
    ctaHref: "/chat?mode=code",
    ctaLabel: "Open Code mode",
    features: [
      {
        icon: Code2,
        title: "Explain and debug",
        text: "Paste a snippet or attach source files and find out what's wrong and how to fix it.",
      },
      {
        icon: RefreshCw,
        title: "Refactor and test",
        text: "Ask for cleaner versions of your code and unit tests to go with them.",
      },
      {
        icon: Sparkles,
        title: "Copy-ready answers",
        text: "Code comes in blocks with a copy button. It only sees what you paste or attach, not your whole repo.",
      },
    ],
  },
};

export const productList = Object.values(products);