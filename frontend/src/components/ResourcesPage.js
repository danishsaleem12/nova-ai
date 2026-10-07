"use client";

/**
 * Resources page (ONE component for every /resources/[slug] page).
 *
 * Sibling system to AgentsPage.js, but everything is intentionally
 * different: palette, background, hero layout, section order, tab style,
 * and every interactive console. To add a resource, add an entry to
 * RESOURCES below, then add its slug to RESOURCE_SLUGS in
 * app/resources/[slug]/page.js (same pattern as AgentsPage.js /
 * app/agents/[slug]/page.js).
 *
 * This file renders the page body only (no Navbar/Footer) — wrap it the
 * same way the rest of the site wraps page bodies. Copy, numbers, and
 * sample data below are placeholders you can edit freely.
 *
 * Needs: framer-motion, lucide-react, next/link, Tailwind.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Copy,
  FileCode2,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Globe,
  Hash,
  Heart,
  HelpCircle,
  Home,
  Layers,
  LifeBuoy,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Radio,
  Rss,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Users2,
  X,
  Zap,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const ICONS = {
  rss: Rss,
  book: BookOpen,
  code: Code2,
  file: FileCode2,
  help: LifeBuoy,
  users: Users2,
  search: Search,
  copy: Copy,
  check: Check,
  clock: Clock,
  globe: Globe,
  layers: Layers,
  hash: Hash,
  filter: Filter,
  star: Star,
  message: MessageSquare,
  tag: Tag,
  play: Play,
  arrowUp: ArrowUpRight,
  gauge: Gauge,
  radio: Radio,
  shield: ShieldCheck,
  zap: Zap,
  compass: Compass,
  mail: Mail,
  heart: Heart,
  bookmark: Bookmark,
  send: Send,
  github: GitBranch,
  fileText: FileText,
  helpCircle: HelpCircle,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  sparkles: Sparkles,
  plus: Plus,
};

/* ====================================================================== */
/* PALETTES — jewel-tone, paired with a light graphite-blue canvas         */
/* (deliberately not the pastel violet/fuchsia glow used on AgentsPage)    */
/* ====================================================================== */

const PALETTES = {
  rose: {
    from: "from-rose-600", to: "to-orange-500",
    grad: "from-rose-600 to-orange-500",
    ink: "text-rose-700",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "focus-visible:ring-rose-400",
    line: "bg-rose-500",
    faint: "bg-rose-500/10",
    edge: "border-rose-300/60",
    hex1: "#e11d48", hex2: "#f97316",
    glow: "rgba(225,29,72,0.35)",
  },
  teal: {
    from: "from-teal-600", to: "to-cyan-500",
    grad: "from-teal-600 to-cyan-500",
    ink: "text-teal-700",
    chip: "bg-teal-50 text-teal-700 border-teal-200",
    ring: "focus-visible:ring-teal-400",
    line: "bg-teal-500",
    faint: "bg-teal-500/10",
    edge: "border-teal-300/60",
    hex1: "#0d9488", hex2: "#06b6d4",
    glow: "rgba(13,148,136,0.35)",
  },
  indigo: {
    from: "from-indigo-600", to: "to-blue-500",
    grad: "from-indigo-600 to-blue-500",
    ink: "text-indigo-700",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ring: "focus-visible:ring-indigo-400",
    line: "bg-indigo-500",
    faint: "bg-indigo-500/10",
    edge: "border-indigo-300/60",
    hex1: "#4f46e5", hex2: "#3b82f6",
    glow: "rgba(79,70,229,0.35)",
  },
  amber: {
    from: "from-amber-600", to: "to-yellow-500",
    grad: "from-amber-600 to-yellow-500",
    ink: "text-amber-700",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "focus-visible:ring-amber-400",
    line: "bg-amber-500",
    faint: "bg-amber-500/10",
    edge: "border-amber-300/60",
    hex1: "#d97706", hex2: "#eab308",
    glow: "rgba(217,119,6,0.35)",
  },
  plum: {
    from: "from-fuchsia-700", to: "to-purple-500",
    grad: "from-fuchsia-700 to-purple-500",
    ink: "text-fuchsia-700",
    chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    ring: "focus-visible:ring-fuchsia-400",
    line: "bg-fuchsia-600",
    faint: "bg-fuchsia-500/10",
    edge: "border-fuchsia-300/60",
    hex1: "#a21caf", hex2: "#a855f7",
    glow: "rgba(162,28,175,0.35)",
  },
};

/* ====================================================================== */
/* DATA: one entry per resource (edit me)                                  */
/* ====================================================================== */

const RESOURCES = {
  /* --------------------------------- Blog --------------------------------- */
  "ai-blog": {
    slug: "ai-blog",
    name: "AI Blog",
    icon: "rss",
    palette: "rose",
    eyebrow: "News, guides and ideas",
    heading: "What we're learning, in public",
    lede: "Field notes from the people building NovaAI — product breakdowns, research write-ups, and the occasional postmortem, published as we ship.",
    primaryCta: "Read the latest post",
    secondaryCta: "Browse all categories",
    quickLinks: [
      { icon: "sparkles", label: "Editor's pick", desc: "This week's most-read story" },
      { icon: "tag", label: "By category", desc: "Product, research, engineering" },
      { icon: "mail", label: "Weekly digest", desc: "One email, every Friday" },
      { icon: "rss", label: "RSS feed", desc: "Pipe it into your reader" },
    ],
    console: {
      kind: "feed",
      title: "Latest from the blog",
      filters: ["All", "Product", "Research", "Engineering"],
      posts: [
        { title: "How NovaAI ranks a research report", cat: "Research", read: "6 min", date: "Sep 18", excerpt: "A look at the scoring model behind source cross-checking, and where it still gets it wrong." },
        { title: "Shipping the Coding Agent's test runner", cat: "Engineering", read: "9 min", date: "Sep 12", excerpt: "Why we moved test execution into a sandboxed worker pool, and what broke on the way there." },
        { title: "Redesigning the campaign dashboard", cat: "Product", read: "4 min", date: "Sep 5", excerpt: "Three iterations, one dead-end, and the layout that finally clicked with early users." },
        { title: "What 40 sources taught us about sourcing", cat: "Research", read: "7 min", date: "Aug 29", excerpt: "Patterns in how credible sources disagree, and how the agent decides what to flag." },
        { title: "A quieter notification model", cat: "Product", read: "5 min", date: "Aug 21", excerpt: "Cutting alert volume by 70% without anyone missing something that mattered." },
      ],
    },
    ticker: ["Product updates", "Research notes", "Engineering deep-dives", "Customer stories", "Postmortems", "Release notes", "Interviews", "Behind the build"],
    timeline: [
      { icon: "compass", title: "Start with a topic", text: "Browse by category or search for something specific — every post is tagged by team and depth." },
      { icon: "book", title: "Read at your pace", text: "Posts open with a plain-language summary, then go as deep as you want to follow." },
      { icon: "mail", title: "Get the digest", text: "Subscribe once and the best of each week lands in your inbox on Fridays." },
      { icon: "message", title: "Reply with questions", text: "Every post has a comment thread the authors actually read and answer." },
    ],
    features: [
      { icon: "tag", title: "Organized by team", text: "Filter by product, research, or engineering to skip what you don't need." },
      { icon: "clock", title: "Honest read times", text: "Every post lists real reading time, measured from actual readers, not word count." },
      { icon: "rss", title: "Feed-first", text: "A clean RSS feed for readers, plus JSON feed for anyone building their own reader." },
      { icon: "message", title: "Open comments", text: "Threads stay open for a year, and the original author gets pinged on every reply." },
      { icon: "bookmark", title: "Save for later", text: "Bookmark a post and it shows up in your account's reading list across devices." },
    ],
    audiences: [
      { icon: "compass", title: "New to NovaAI", text: "Start with the product breakdowns to see how each agent actually works.", stat: "12 posts" },
      { icon: "code", title: "Engineers", text: "Architecture write-ups and the trade-offs behind them.", stat: "24 posts" },
      { icon: "search", title: "Researchers", text: "Notes on sourcing, evaluation, and where the model still struggles.", stat: "18 posts" },
      { icon: "gauge", title: "Operators", text: "What changed in each release, and why it changed.", stat: "31 posts" },
      { icon: "users", title: "Everyone else", text: "Stories from teams using NovaAI day to day.", stat: "9 posts" },
    ],
    toggle: {
      offLabel: "Skimming release notes",
      onLabel: "Reading the blog",
      offBody: "A changelog line says what shipped, with no room for why it was built that way or what didn't work first.",
      onBody: "A full post walks through the failed first attempt, the constraint that mattered, and the version that finally shipped.",
    },
    ctaTitle: "Get the Friday digest",
    ctaText: "One email a week with the posts worth your time. No spam, unsubscribe in one click.",
    ctaPlaceholder: "you@company.com",
    ctaButton: "Subscribe",
  },

  /* ----------------------------- Documentation ----------------------------- */
  documentation: {
    slug: "documentation",
    name: "Documentation",
    icon: "book",
    palette: "teal",
    eyebrow: "Learn how it all works",
    heading: "Everything you need to build with NovaAI",
    lede: "Concept guides, step-by-step setup, and reference pages for every agent — written for the moment you're stuck, not just the moment you're starting.",
    primaryCta: "Open the docs",
    secondaryCta: "See the quickstart",
    quickLinks: [
      { icon: "zap", label: "Quickstart", desc: "Working in under 10 minutes" },
      { icon: "layers", label: "Concepts", desc: "How agents and tools fit together" },
      { icon: "code", label: "Reference", desc: "Every endpoint and parameter" },
      { icon: "shield", label: "Guardrails", desc: "Permissions, limits, approvals" },
    ],
    console: {
      kind: "search",
      title: "Search the docs",
      placeholder: "Search guides, concepts, reference…",
      sampleQuery: "connect a custom agent to slack",
      results: [
        { title: "Connect an agent to Slack", section: "Integrations", snippet: "Add the Slack connector from Settings → Connectors, then grant the agent access to the channels it should watch. Use draft-only mode until you trust its replies." },
        { title: "Guardrails and approval steps", section: "Custom Agents", snippet: "Every agent can require a human approval step before it sends a message or takes an action outside its sandbox." },
        { title: "Webhook triggers reference", section: "Reference", snippet: "Trigger a run from an incoming webhook payload; the body is available to the agent as structured input." },
        { title: "Debugging a run that stalled", section: "Troubleshooting", snippet: "Check the run history for the step where the agent stopped, and re-run from that step instead of from scratch." },
      ],
    },
    ticker: ["Quickstart", "Authentication", "Agents", "Tools", "Webhooks", "Rate limits", "SDKs", "Migration guides"],
    timeline: [
      { icon: "zap", title: "Set up in minutes", text: "Create a key, install the SDK, and run the sample project that ships with every quickstart." },
      { icon: "layers", title: "Understand the model", text: "Concept pages explain how agents, tools, and guardrails relate before you touch the reference." },
      { icon: "code", title: "Build against the reference", text: "Every parameter has a type, a default, and a runnable example you can copy straight in." },
      { icon: "helpCircle", title: "Get unstuck", text: "Troubleshooting pages are written from real support tickets, not hypothetical errors." },
    ],
    features: [
      { icon: "search", title: "Search that understands intent", text: "Type what you're trying to do, not the exact page title, and get ranked, relevant results." },
      { icon: "code", title: "Runnable examples", text: "Every code sample runs as-is against a sandbox project — no placeholder keys to hunt down." },
      { icon: "layers", title: "Versioned pages", text: "Switch the version selector and every example updates to match, including deprecated fields." },
      { icon: "copy", title: "One-click copy", text: "Copy a full snippet, including imports, with a single click on any code block." },
      { icon: "globe", title: "Available offline", text: "Download the full reference as a single page for flights, on-call, or slow connections." },
    ],
    audiences: [
      { icon: "zap", title: "First-time builders", text: "The quickstart gets a working agent running before you've finished your coffee.", stat: "10 min" },
      { icon: "code", title: "Backend engineers", text: "Full parameter reference with types, defaults, and error codes.", stat: "180 pages" },
      { icon: "layers", title: "Platform teams", text: "Guides for rate limits, retries, and running at scale.", stat: "22 guides" },
      { icon: "shield", title: "Security reviewers", text: "Everything on permissions, data retention, and guardrails in one section.", stat: "1 section" },
      { icon: "helpCircle", title: "Support engineers", text: "Troubleshooting pages built from real tickets, updated monthly.", stat: "60+ fixes" },
    ],
    toggle: {
      offLabel: "Guessing from the API",
      onLabel: "Reading the docs",
      offBody: "You send a request, get an error code with no message, and try three different payload shapes before one works.",
      onBody: "The reference page shows the exact required fields, a working example, and the three most common errors for that endpoint.",
    },
    ctaTitle: "Can't find what you need?",
    ctaText: "Search the docs directly, or tell us what's missing and we'll add it.",
    ctaPlaceholder: "Search or describe what's missing…",
    ctaButton: "Search docs",
  },

  /* ---------------------------------- API ---------------------------------- */
  api: {
    slug: "api",
    name: "API",
    icon: "code",
    palette: "indigo",
    eyebrow: "Build with NovaAI",
    heading: "One API, every agent",
    lede: "Call any agent the same way you call the others: a single endpoint shape, predictable errors, and responses that stream as the work happens.",
    primaryCta: "Get an API key",
    secondaryCta: "View endpoint reference",
    quickLinks: [
      { icon: "zap", label: "Authentication", desc: "Keys, scopes, and rotation" },
      { icon: "radio", label: "Streaming", desc: "Server-sent events for live runs" },
      { icon: "gauge", label: "Rate limits", desc: "Default tiers and how to raise them" },
      { icon: "shield", label: "Errors", desc: "Every status code, explained" },
    ],
    console: {
      kind: "endpoint",
      title: "Try an endpoint",
      method: "POST",
      path: "/v1/agents/research/runs",
      requestLines: [
        "{",
        "  \"input\": \"Research the top 3 competitors",
        "            in the meal-kit space\",",
        "  \"stream\": true,",
        "  \"max_sources\": 40",
        "}",
      ],
      responseLines: [
        "{",
        "  \"id\": \"run_8f3ac2\",",
        "  \"status\": \"completed\",",
        "  \"sources_scanned\": 42,",
        "  \"latency_ms\": 3180,",
        "  \"output\": \"Three players lead the",
        "             category: HelloFresh,",
        "             Blue Apron, Home Chef…\"",
        "}",
      ],
      statusCode: 200,
      latencyMs: 3180,
    },
    ticker: ["REST endpoints", "Streaming", "Idempotency keys", "Webhooks", "SDKs", "Sandboxes", "Usage metering", "Status page"],
    timeline: [
      { icon: "zap", title: "Create a key", text: "Scope it to a single agent or your whole workspace, and set an expiry if you want one." },
      { icon: "send", title: "Send a request", text: "Every agent takes the same shape: an input, optional parameters, and a stream flag." },
      { icon: "radio", title: "Stream the run", text: "Get step-by-step events as the agent works, or wait for a single completed response." },
      { icon: "gauge", title: "Watch your usage", text: "The usage dashboard updates in real time, with alerts before you hit a limit." },
    ],
    features: [
      { icon: "code", title: "Consistent shape", text: "Every agent's endpoint takes the same input/output shape, so switching agents means changing one field." },
      { icon: "radio", title: "Real streaming", text: "Server-sent events for every run, so long research or coding tasks show progress instead of a spinner." },
      { icon: "shield", title: "Typed errors", text: "Every error includes a stable code, a plain-language message, and a link to the fix." },
      { icon: "gauge", title: "Predictable limits", text: "Rate limits are published per tier, with headers on every response showing what's left." },
      { icon: "layers", title: "Idempotency built in", text: "Retry a request safely with an idempotency key — no duplicate runs from a flaky connection." },
    ],
    audiences: [
      { icon: "code", title: "App developers", text: "Drop an agent into your product behind one endpoint.", stat: "5 SDKs" },
      { icon: "layers", title: "Platform teams", text: "Run agents at scale with batching and usage controls.", stat: "99.95% uptime" },
      { icon: "shield", title: "Security teams", text: "Scoped keys, audit logs, and IP allow-lists.", stat: "SOC 2 Type II" },
      { icon: "radio", title: "Real-time products", text: "Stream partial output straight into your own UI.", stat: "<200ms first byte" },
      { icon: "gauge", title: "Finance & ops", text: "Usage-based billing with exportable metering data.", stat: "Per-run pricing" },
    ],
    toggle: {
      offLabel: "Polling for a result",
      onLabel: "Streaming the run",
      offBody: "Your app calls the endpoint, gets a run ID, and polls every few seconds hoping the status changed.",
      onBody: "Your app opens a stream and renders each step — searching, reading, writing — as the agent produces it.",
    },
    ctaTitle: "Get your API key",
    ctaText: "Free tier includes 1,000 runs a month across every agent — no card required.",
    ctaPlaceholder: "you@company.com",
    ctaButton: "Create key",
  },

  /* ------------------------------ Help Center ------------------------------ */
  "help-center": {
    slug: "help-center",
    name: "Help Center",
    icon: "help",
    palette: "amber",
    eyebrow: "Answers and support",
    heading: "Get unstuck, fast",
    lede: "Search the answers we give most often, or reach a real person when the answer isn't there yet — most tickets get a first reply in under an hour.",
    primaryCta: "Search for an answer",
    secondaryCta: "Contact support",
    quickLinks: [
      { icon: "zap", label: "Billing", desc: "Plans, invoices, refunds" },
      { icon: "shield", label: "Account & security", desc: "Login, 2FA, data access" },
      { icon: "code", label: "API & agents", desc: "Errors, limits, run status" },
      { icon: "message", label: "Talk to a person", desc: "Live chat, weekdays 8–8" },
    ],
    console: {
      kind: "faq",
      title: "Search for an answer",
      placeholder: "What do you need help with?",
      sampleQuery: "why did my run fail",
      faqs: [
        { q: "Why did my agent run fail?", a: "Most failures are a missing scope on your API key or a tool the agent couldn't reach. Check the run's error code first — it links straight to the fix." },
        { q: "How do I cancel or change my plan?", a: "Go to Billing → Plan from your dashboard. Downgrades take effect at the end of the current billing period; upgrades are immediate." },
        { q: "Can I get a refund?", a: "Yes, within 14 days of a charge if you haven't used more than 10% of that period's included runs. Request one from Billing → Invoices." },
        { q: "How do I add a teammate?", a: "Workspace owners can invite teammates from Settings → Members. Seats are billed the day the invite is accepted, not the day it's sent." },
        { q: "Is my data used to train models?", a: "No. Your inputs and outputs are never used for training unless you explicitly opt in from Settings → Data." },
      ],
    },
    ticker: ["Billing", "Account & security", "Getting started", "Agents & runs", "Integrations", "Data & privacy", "Outages", "Contact us"],
    timeline: [
      { icon: "search", title: "Search first", text: "Most questions are already answered — search covers every article, not just titles." },
      { icon: "helpCircle", title: "Follow the fix", text: "Answers link directly to the setting or page that solves the problem, not just an explanation." },
      { icon: "thumbsUp", title: "Tell us if it worked", text: "Rate the answer so the next person searching the same thing gets a better one." },
      { icon: "message", title: "Reach a person", text: "If nothing fits, open a ticket or chat — most get a first reply in under an hour." },
    ],
    features: [
      { icon: "search", title: "Search across everything", text: "One search box covers articles, past ticket resolutions, and status history." },
      { icon: "clock", title: "Real response times", text: "The support status page shows current first-reply time by plan, updated hourly." },
      { icon: "thumbsUp", title: "Answers that improve", text: "Every article shows a helpfulness score and gets rewritten when it drops." },
      { icon: "shield", title: "Account-aware answers", text: "Signed in, answers reflect your actual plan and settings instead of generic defaults." },
      { icon: "message", title: "Live chat, real people", text: "Weekday chat is staffed by the same team that writes the articles, not a script." },
    ],
    audiences: [
      { icon: "zap", title: "New users", text: "Setup and first-run questions, answered in plain language.", stat: "38 articles" },
      { icon: "shield", title: "Billing admins", text: "Plans, invoices, seats, and refund policy in one place.", stat: "22 articles" },
      { icon: "code", title: "Developers", text: "API error codes cross-referenced with the docs.", stat: "54 articles" },
      { icon: "message", title: "Anyone stuck", text: "Live chat during business hours, ticket support around the clock.", stat: "<1 hr reply" },
      { icon: "globe", title: "Status watchers", text: "Live incident history and uptime by region.", stat: "99.95% uptime" },
    ],
    toggle: {
      offLabel: "Digging through settings",
      onLabel: "Searching help",
      offBody: "You click through four menus guessing where a setting might live, unsure if the thing you want is even possible.",
      onBody: "You type what you're trying to do and land on the one article that names the exact setting and where to find it.",
    },
    ctaTitle: "Still stuck?",
    ctaText: "Send us what you were trying to do — a real person replies, usually within the hour.",
    ctaPlaceholder: "Briefly describe the problem…",
    ctaButton: "Contact support",
  },

  /* ------------------------------- Community ------------------------------- */
  community: {
    slug: "community",
    name: "Community",
    icon: "users",
    palette: "plum",
    eyebrow: "Meet other creators",
    heading: "Built better with other builders",
    lede: "Trade prompts, custom agent recipes, and honest opinions with people building on NovaAI right now — plus a direct line to the team that ships it.",
    primaryCta: "Join the community",
    secondaryCta: "See recent discussions",
    quickLinks: [
      { icon: "message", label: "Discussions", desc: "Questions, recipes, feedback" },
      { icon: "star", label: "Showcase", desc: "What people have built" },
      { icon: "zap", label: "Events", desc: "Office hours and workshops" },
      { icon: "github", label: "Open source", desc: "Connectors and starter kits" },
    ],
    console: {
      kind: "directory",
      title: "What's happening now",
      tabs: ["Discussions", "Members"],
      discussions: [
        { title: "Best guardrails for a Slack-facing agent?", author: "devi_r", replies: 14, upvotes: 38, time: "2h ago" },
        { title: "Sharing my research-agent prompt for VC diligence", author: "marcuslin", replies: 22, upvotes: 61, time: "5h ago" },
        { title: "Custom agent that flags unusual transactions", author: "faith_ops", replies: 9, upvotes: 27, time: "1d ago" },
        { title: "Anyone else hit rate limits on batch runs?", author: "kwstas", replies: 17, upvotes: 19, time: "1d ago" },
      ],
      members: [
        { name: "Devi Ramesh", role: "Platform engineer", online: true },
        { name: "Marcus Lin", role: "Investor, early-stage", online: true },
        { name: "Faith Osei", role: "Ops lead", online: false },
        { name: "Kostas W.", role: "Indie builder", online: true },
        { name: "Priya Nair", role: "Support engineer, NovaAI", online: true },
      ],
      onlineCount: 312,
    },
    ticker: ["Discussions", "Showcase", "Office hours", "Open source", "Job board", "Feedback", "Regional meetups", "Ambassadors"],
    timeline: [
      { icon: "users", title: "Introduce yourself", text: "New-member threads get a reply from the team within a day, every time." },
      { icon: "message", title: "Ask or answer", text: "Post what you're stuck on, or help someone else with what you've already solved." },
      { icon: "star", title: "Show what you built", text: "The showcase gets weekly attention from the product team — some entries shape the roadmap." },
      { icon: "zap", title: "Show up live", text: "Monthly office hours are unscripted — bring the question you couldn't find an answer to." },
    ],
    features: [
      { icon: "message", title: "Answers from the team", text: "NovaAI engineers post in the forum directly — no support-ticket layer in between." },
      { icon: "star", title: "A real showcase", text: "Submit what you built for a chance at the monthly feature and a direct line to the roadmap." },
      { icon: "github", title: "Shared building blocks", text: "Community-maintained connectors and starter kits, reviewed before they're listed." },
      { icon: "zap", title: "Regular office hours", text: "A live, unscripted session every month with the people building the product." },
      { icon: "globe", title: "Regional meetups", text: "Community-run meetups in a growing list of cities, listed with local organizers." },
    ],
    audiences: [
      { icon: "compass", title: "Just joining", text: "Introduce yourself and get pointed to the right channel for your use case.", stat: "312 online" },
      { icon: "code", title: "Builders", text: "Trade custom-agent recipes and guardrail patterns.", stat: "1.2k threads" },
      { icon: "star", title: "Showcase entries", text: "See what other teams shipped with NovaAI this month.", stat: "40+ / month" },
      { icon: "message", title: "Support seekers", text: "Faster answers from people who hit the same issue first.", stat: "<2 hr avg" },
      { icon: "github", title: "Open-source contributors", text: "Connectors and starter kits maintained in the open.", stat: "60+ repos" },
    ],
    toggle: {
      offLabel: "Working it out alone",
      onLabel: "Asking the community",
      offBody: "You hit a guardrail edge case, try three configurations, and give up without knowing if it's even possible.",
      onBody: "You post the exact setup, and someone who solved the same thing last week replies with the working config.",
    },
    ctaTitle: "Come say hello",
    ctaText: "It's free to join, and most new-member threads get a reply within a day.",
    ctaPlaceholder: "you@company.com",
    ctaButton: "Join the community",
  },
};




/* Small proof-point numbers shown in the stats strip beneath the quick links.
   Kept separate from the main RESOURCES object since they're purely
   illustrative counters, not structural content. */
const STATS = {
  "ai-blog": [
    { icon: "fileText", value: 214, suffix: "+", label: "Posts published" },
    { icon: "mail", value: 38, suffix: "k", label: "Digest subscribers" },
    { icon: "message", value: 4.6, suffix: "", label: "Avg. comment score", decimals: 1 },
    { icon: "clock", value: 6, suffix: " min", label: "Median read time" },
  ],
  documentation: [
    { icon: "fileText", value: 340, suffix: "+", label: "Reference pages" },
    { icon: "zap", value: 8, suffix: " min", label: "To first working call" },
    { icon: "globe", value: 5, suffix: "", label: "Official SDKs" },
    { icon: "search", value: 92, suffix: "%", label: "Searches find an answer" },
  ],
  api: [
    { icon: "gauge", value: 99.95, suffix: "%", label: "Uptime, trailing 90 days", decimals: 2 },
    { icon: "radio", value: 180, suffix: "ms", label: "Median first byte" },
    { icon: "code", value: 24, suffix: "", label: "Public endpoints" },
    { icon: "shield", value: 1000, suffix: "+", label: "Free runs per month" },
  ],
  "help-center": [
    { icon: "clock", value: 47, suffix: " min", label: "Median first reply" },
    { icon: "fileText", value: 190, suffix: "+", label: "Help articles" },
    { icon: "thumbsUp", value: 4.7, suffix: "/5", label: "Avg. article rating", decimals: 1 },
    { icon: "message", value: 8, suffix: "–8", label: "Live chat hours" },
  ],
  community: [
    { icon: "users", value: 18, suffix: "k", label: "Members" },
    { icon: "message", value: 1200, suffix: "+", label: "Open discussions" },
    { icon: "star", value: 40, suffix: "+", label: "Showcases per month" },
    { icon: "clock", value: 2, suffix: " hr", label: "Avg. reply time" },
  ],
};

const RESOURCE_LIST = Object.values(RESOURCES);

/** Counts up from 0 to `value` once the strip scrolls into view. */
function useCountUp(value, active, duration = 1.1) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, active, duration]);
  return display;
}

function StatFigure({ stat, active, index }) {
  const Icon = ICONS[stat.icon];
  const n = useCountUp(stat.value, active, 1 + index * 0.15);
  const decimals = stat.decimals || 0;
  return (
    <motion.div variants={RISE} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {Icon && <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />}
      <div>
        <p className="text-2xl font-bold tabular-nums text-slate-900">
          {n.toFixed(decimals)}
          {stat.suffix}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{stat.label}</p>
      </div>
    </motion.div>
  );
}

function StatsStrip({ resource }) {
  const stats = STATS[resource.slug] || [];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  if (!stats.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
      <motion.ul ref={ref} variants={STAGGER} initial="hidden" animate={inView ? "show" : "hidden"} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <StatFigure key={s.label} stat={s} active={inView} index={i} />
        ))}
      </motion.ul>
    </section>
  );
}



/* ====================================================================== */
/* Motion helpers — a different vocabulary than AgentsPage's word-flip 3D  */
/* ====================================================================== */

const riseIn = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, delay, ease: EASE },
});

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const RISE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };

/** Clip-path line reveal for the hero heading — a mask sweep, not a word flip. */
function MaskReveal({ text, className = "", delay = 0.1 }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {text}
      </motion.span>
    </span>
  );
}

/**
 * Hover tilt with a diagonal sheen sweep, instead of AgentsPage's radial
 * mouse-follow glare. `max` controls tilt degrees, `lift` the hover rise.
 */
function TiltCard({ children, as = "div", className = "", cardClassName = "", max = 6, lift = 6, outerProps }) {
  const Outer = motion[as] || motion.div;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <Outer className={className} {...(outerProps || riseIn())}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileHover={{ y: -lift }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
        className={`group relative h-full ${cardClassName}`}
      >
        {children}
      </motion.div>
    </Outer>
  );
}

/** Glass panel with a gradient ring and a sheen that sweeps on hover. */
function GlossPanel({ children, className = "", cardClassName = "", max = 5, lift = 6, delay = 0, palette, radius = "rounded-3xl" }) {
  return (
    <TiltCard className={className} max={max} lift={lift} outerProps={riseIn(delay)} cardClassName={cardClassName}>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 overflow-hidden border ${palette.edge} bg-white/80 shadow-[0_16px_44px_-18px_rgba(15,23,42,0.25)] backdrop-blur-md ${radius}`}
      >
        <span
          className="absolute -inset-y-full -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ transform: "translateX(-160%)" }}
        />
        <motion.span
          aria-hidden
          className="absolute -inset-y-full -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={false}
          whileHover={{ x: ["-10%", "460%"] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </div>
      {children}
    </TiltCard>
  );
}

/** Presses down like a physical key, for buttons and pills. */
function Press({ children, className = "" }) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96, y: 0 }} className={className}>
      {children}
    </motion.div>
  );
}

/* ====================================================================== */
/* Background — circuit grid + drifting chips + a scanning beam           */
/* (a different vocabulary than AgentsPage's blurred blobs + spinning rings)*/
/* ====================================================================== */

function CircuitGrid({ palette }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.35]" preserveAspectRatio="none">
      <defs>
        <pattern id={`grid-${uid}`} width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke="#0f172a" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
        <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`mask-${uid}`}>
          <rect width="100%" height="100%" fill={`url(#fade-${uid})`} />
          <rect width="100%" height="100%" fill="white" opacity="0.55" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${uid})`} mask={`url(#mask-${uid})`} />
    </svg>
  );
}

function ScanBeam({ palette }) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 h-64 opacity-[0.14]"
      style={{ background: `linear-gradient(180deg, transparent, ${palette.glow}, transparent)` }}
      animate={{ y: ["-10%", "120%"] }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
    />
  );
}

const DRIFT_CHIPS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 37 + 6) % 100,
  size: 10 + (i % 3) * 6,
  delay: (i * 1.1) % 8,
  duration: 16 + (i % 4) * 3,
  rotate: (i % 2 === 0 ? 1 : -1) * (12 + i * 3),
}));

function Background({ palette }) {
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#F4F6FB]">
      <motion.div style={{ y: gridY }} className="absolute inset-x-0 -top-10 h-[1500px]">
        <CircuitGrid palette={palette} />
      </motion.div>
      <ScanBeam palette={palette} />
      <div className={`absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full ${palette.faint} blur-3xl`} />
      {DRIFT_CHIPS.map((c, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-md border ${palette.edge} bg-white/70`}
          style={{ left: `${c.left}%`, width: c.size, height: c.size, top: "-5%", rotate: c.rotate }}
          animate={{ y: ["0vh", "112vh"], rotate: [c.rotate, c.rotate + (i % 2 === 0 ? 40 : -40)] }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Small shared bits                                                       */
/* ====================================================================== */

function Kicker({ icon, label, palette }) {
  const Icon = ICONS[icon];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium ${palette.chip}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

function SectionIntro({ kicker, icon, title, sub, palette, align = "left" }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {kicker && (
        <motion.div {...riseIn()}>
          <Kicker icon={icon} label={kicker} palette={palette} />
        </motion.div>
      )}
      <motion.h2 {...riseIn(0.08)} className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
        {title}
      </motion.h2>
      {sub && (
        <motion.p {...riseIn(0.16)} className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
          {sub}
        </motion.p>
      )}
    </div>
  );
}

/* ====================================================================== */
/* Console frame — shared chrome for the five demo kinds                   */
/* ====================================================================== */

function ConsolePanel({ palette, title, meta, children }) {
  return (
    <TiltCard max={3} lift={4} outerProps={riseIn(0.15)} cardClassName="p-0">
      <div
        className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)]"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className={`flex items-center justify-between border-b border-slate-100 bg-gradient-to-r ${palette.grad} px-5 py-3.5`}>
          <div className="flex items-center gap-2 text-white">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/50" />
              <span className="h-2 w-2 rounded-full bg-white/50" />
              <span className="h-2 w-2 rounded-full bg-white/80" />
            </span>
            <span className="ml-1.5 text-[13px] font-semibold">{title}</span>
          </div>
          {meta}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </TiltCard>
  );
}

/* --------------------------------- feed --------------------------------- */

function FeedDemo({ data, palette }) {
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!inView) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [inView]);

  const refresh = (next) => {
    setFilter(next);
    setLoading(true);
    setTimeout(() => setLoading(false), 550);
  };

  const shown = data.posts.filter((p) => filter === "All" || p.cat === filter);

  return (
    <ConsolePanel palette={palette} title={data.title} meta={<span className="text-[11px] font-medium text-white/80">{shown.length} posts</span>}>
      <div ref={ref} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.filters.map((f) => (
            <Press key={f}>
              <button
                type="button"
                onClick={() => refresh(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f ? `border-transparent bg-gradient-to-r text-white ${palette.grad}` : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            </Press>
          ))}
        </div>

        <div className="min-h-[280px]">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <motion.div className="h-3 w-2/3 rounded-full bg-slate-200" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 }} />
                  <motion.div className="mt-2.5 h-2.5 w-full rounded-full bg-slate-200" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 + 0.1 }} />
                </div>
              ))}
            </div>
          ) : (
            <motion.ul key={filter} variants={STAGGER} initial="hidden" animate="show" className="space-y-2.5">
              {shown.map((p) => (
                <motion.li key={p.title} variants={RISE} whileHover={{ x: 3 }} className="cursor-default rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${palette.chip}`}>{p.cat}</span>
                    <span className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" /> {p.read} · {p.date}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{p.excerpt}</p>
                </motion.li>
              ))}
              {shown.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No posts in this category yet.</p>}
            </motion.ul>
          )}
        </div>
      </div>
    </ConsolePanel>
  );
}

/* -------------------------------- search --------------------------------- */

function SearchDemo({ data, palette }) {
  const [query, setQuery] = useState("");
  const [typed, setTyped] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!inView || typed) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setQuery(data.sampleQuery.slice(0, i));
      if (i >= data.sampleQuery.length) {
        clearInterval(id);
        setTyped(true);
      }
    }, 34);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const results = query.trim() ? data.results : [];

  return (
    <ConsolePanel palette={palette} title={data.title} meta={<span className="text-[11px] font-medium text-white/80">{results.length} results</span>}>
      <div ref={ref} className="space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="min-w-0 flex-1 truncate text-[13.5px] text-slate-700">
            {query}
            <motion.span aria-hidden className="ml-0.5 inline-block h-3.5 w-[2px] align-middle bg-slate-500" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
          </p>
        </div>

        <div className="min-h-[220px] space-y-2">
          <AnimatePresence>
            {results.map((r, i) => {
              const open = openIdx === i;
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70"
                >
                  <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="flex w-full items-center justify-between gap-3 p-3.5 text-left">
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${palette.ink}`}>{r.section}</span>
                      <p className="truncate text-[13.5px] font-semibold text-slate-900">{r.title}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                        <div className="border-t border-slate-100 bg-white p-3.5">
                          <p className="text-[12.5px] leading-relaxed text-slate-600">{r.snippet}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1400);
                            }}
                            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            {copied ? "Copied" : "Copy snippet"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {!query.trim() && <p className="py-8 text-center text-sm text-slate-400">Start typing to search the docs.</p>}
        </div>
      </div>
    </ConsolePanel>
  );
}

/* ------------------------------- endpoint --------------------------------- */

function EndpointHighlight({ line }) {
  const re = /("(?:[^"\\]|\\.)*")|(:\s*)(\d+(?:\.\d+)?)|(\btrue\b|\bfalse\b)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "text-emerald-300" : m[3] ? "text-amber-300" : "text-sky-300";
    out.push(<span key={m.index} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return <>{out}</>;
}

function EndpointDemo({ data, palette }) {
  const [phase, setPhase] = useState("idle");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [elapsed, setElapsed] = useState(0);

  const send = useCallback(() => {
    setPhase("sending");
    setElapsed(0);
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 60);
    setTimeout(() => {
      clearInterval(id);
      setElapsed(data.latencyMs);
      setPhase("done");
    }, 1100);
  }, [data.latencyMs]);

  useEffect(() => {
    if (inView) send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <ConsolePanel
      palette={palette}
      title={data.title}
      meta={
        <span className="flex items-center gap-2 text-[11px] font-medium text-white/80">
          <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono">{data.method}</span>
          {data.path}
        </span>
      }
    >
      <div ref={ref} className="space-y-3">
        <div className="rounded-2xl bg-[#0d1220] p-3.5 font-mono text-[11.5px] leading-6 text-slate-300 shadow-inner">
          {data.requestLines.map((l, i) => (
            <div key={i} className="whitespace-pre">
              <EndpointHighlight line={l} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Press>
            <button
              type="button"
              onClick={send}
              disabled={phase === "sending"}
              className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r ${palette.grad} px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-70`}
            >
              <Send className="h-3.5 w-3.5" />
              {phase === "sending" ? "Sending…" : "Send request"}
            </button>
          </Press>
          <span className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            {phase === "done" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                <Check className="h-3 w-3" strokeWidth={3} /> {data.statusCode}
              </span>
            )}
            <span className="font-mono">{elapsed}ms</span>
          </span>
        </div>

        <div className="min-h-[150px] rounded-2xl bg-[#0d1220] p-3.5 font-mono text-[11.5px] leading-6 shadow-inner">
          {phase !== "done" ? (
            <div className="space-y-2 pt-1">
              {[60, 85, 45, 90, 30].map((w, i) => (
                <motion.div key={i} className="h-2.5 rounded-full bg-slate-700" style={{ width: `${w}%` }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </div>
          ) : (
            <motion.div variants={STAGGER} initial="hidden" animate="show">
              {data.responseLines.map((l, i) => (
                <motion.div key={i} variants={RISE} className="whitespace-pre text-slate-300">
                  <EndpointHighlight line={l} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ConsolePanel>
  );
}

/* ---------------------------------- faq ----------------------------------- */

function FaqDemo({ data, palette }) {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(0);
  const [feedback, setFeedback] = useState({});
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setQuery(data.sampleQuery.slice(0, i));
      if (i >= data.sampleQuery.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const shown = query.trim()
    ? data.faqs.filter((f) => f.q.toLowerCase().includes("fail") || f.q.toLowerCase().includes("run") || data.faqs.indexOf(f) === 0)
    : data.faqs;

  return (
    <ConsolePanel palette={palette} title={data.title} meta={<HelpCircle className="h-4 w-4 text-white/80" />}>
      <div ref={ref} className="space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="min-w-0 flex-1 truncate text-[13.5px] text-slate-700">{query || data.placeholder}</p>
        </div>

        <div className="min-h-[260px] space-y-2">
          {shown.map((f, i) => {
            const open = openIdx === i;
            const fb = feedback[i];
            return (
              <div key={f.q} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
                <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="flex w-full items-center justify-between gap-3 p-3.5 text-left">
                  <p className="text-[13.5px] font-semibold text-slate-900">{f.q}</p>
                  <Plus className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-45" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }}>
                      <div className="border-t border-slate-100 bg-white p-3.5">
                        <p className="text-[12.5px] leading-relaxed text-slate-600">{f.a}</p>
                        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Was this helpful?</span>
                          {fb ? (
                            <span className={`font-semibold ${palette.ink}`}>Thanks for the feedback</span>
                          ) : (
                            <>
                              <button onClick={() => setFeedback((s) => ({ ...s, [i]: "yes" }))} className="rounded-full border border-slate-200 p-1 hover:bg-slate-50">
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button onClick={() => setFeedback((s) => ({ ...s, [i]: "no" }))} className="rounded-full border border-slate-200 p-1 hover:bg-slate-50">
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </ConsolePanel>
  );
}

/* ------------------------------- directory --------------------------------- */

function DirectoryDemo({ data, palette }) {
  const [tab, setTab] = useState(0);
  const [ups, setUps] = useState(() => Object.fromEntries(data.discussions.map((d, i) => [i, d.upvotes])));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [online, setOnline] = useState(data.onlineCount - 6);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setOnline((n) => Math.min(data.onlineCount, n + 1)), 500);
    return () => clearInterval(id);
  }, [inView, data.onlineCount]);

  return (
    <ConsolePanel
      palette={palette}
      title={data.title}
      meta={
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> {online} online
        </span>
      }
    >
      <div ref={ref} className="space-y-3">
        <div className="flex gap-2">
          {data.tabs.map((t, i) => (
            <Press key={t}>
              <button
                type="button"
                onClick={() => setTab(i)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === i ? `border-transparent bg-gradient-to-r text-white ${palette.grad}` : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t}
              </button>
            </Press>
          ))}
        </div>

        <div className="min-h-[260px]">
          {tab === 0 ? (
            <motion.ul variants={STAGGER} initial="hidden" animate="show" className="space-y-2.5">
              {data.discussions.map((d, i) => (
                <motion.li key={d.title} variants={RISE} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <button
                    type="button"
                    onClick={() => setUps((s) => ({ ...s, [i]: s[i] + 1 }))}
                    className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-slate-500 hover:text-slate-800"
                  >
                    <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                    <motion.span key={ups[i]} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-[11px] font-bold">
                      {ups[i]}
                    </motion.span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-slate-900">{d.title}</p>
                    <p className="mt-1 text-[11.5px] text-slate-400">
                      {d.author} · {d.replies} replies · {d.time}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.ul variants={STAGGER} initial="hidden" animate="show" className="space-y-2.5">
              {data.members.map((m) => (
                <motion.li key={m.name} variants={RISE} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-bold text-slate-600">
                    {m.name.split(" ").map((w) => w[0]).join("")}
                    {m.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{m.name}</p>
                    <p className="truncate text-[11.5px] text-slate-400">{m.role}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </ConsolePanel>
  );
}

function Console({ resource, palette }) {
  const c = resource.console;
  if (c.kind === "feed") return <FeedDemo data={c} palette={palette} />;
  if (c.kind === "search") return <SearchDemo data={c} palette={palette} />;
  if (c.kind === "endpoint") return <EndpointDemo data={c} palette={palette} />;
  if (c.kind === "faq") return <FaqDemo data={c} palette={palette} />;
  return <DirectoryDemo data={c} palette={palette} />;
}

/* ====================================================================== */
/* Hero — centered mask-reveal heading, full-width console beneath it       */
/* ====================================================================== */

function Hero({ resource, palette }) {
  const Icon = ICONS[resource.icon];
  return (
    <header className="relative">
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-28 text-center md:px-10 md:pt-36">
        <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-900">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Resources</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-900">{resource.name}</span>
        </motion.nav>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }} className="mx-auto mt-8 flex justify-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${palette.grad} shadow-[0_18px_40px_-14px_rgba(15,23,42,0.5)]`}>
            <Icon className="h-8 w-8" />
          </span>
        </motion.div>

        <div className="mt-6">
          <Kicker icon={resource.icon} label={resource.eyebrow} palette={palette} />
        </div>

        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl" style={{ perspective: 800 }}>
          <MaskReveal text={resource.heading} delay={0.15} />
        </h1>

        <motion.p {...riseIn(0.35)} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
          {resource.lede}
        </motion.p>

        <motion.div {...riseIn(0.45)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Press>
            <a href="#console" className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg ${palette.grad}`}>
              {resource.primaryCta} <ArrowRight className="h-4 w-4" />
            </a>
          </Press>
          <Press>
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm">
              {resource.secondaryCta}
            </a>
          </Press>
        </motion.div>
      </div>

      <div id="console" className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-16 md:px-10">
        <Console resource={resource} palette={palette} />
      </div>
    </header>
  );
}

/* ====================================================================== */
/* Quick links — a strip of index cards under the hero                    */
/* ====================================================================== */

function QuickLinks({ resource, palette }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resource.quickLinks.map((q, i) => {
          const QIcon = ICONS[q.icon];
          return (
            <TiltCard key={q.label} as="li" max={5} lift={5} outerProps={riseIn(i * 0.06)}>
              <a href="#" className="block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${palette.faint} ${palette.ink}`}>
                  <QIcon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-900">{q.label}</p>
                <p className="mt-1 text-[12.5px] text-slate-500">{q.desc}</p>
              </a>
            </TiltCard>
          );
        })}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/* Ticker band — filled pill chips drifting, not giant outline text        */
/* ====================================================================== */

function TickerRow({ items, reverse, palette }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden py-1.5">
      <motion.div className="flex w-max gap-3" animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration: 22 + items.length * 2, repeat: Infinity, ease: "linear" }}>
        {loop.map((t, i) => (
          <span key={i} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${palette.chip}`}>
            <Hash className="h-3 w-3 opacity-60" /> {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function TickerBand({ resource, palette }) {
  return (
    <section aria-hidden className="border-y border-slate-100 bg-white/60 py-6">
      <TickerRow items={resource.ticker} palette={palette} />
    </section>
  );
}

/* ====================================================================== */
/* Journey — vertical alternating timeline, replaces the 3-col steps       */
/* ====================================================================== */

function JourneyTimeline({ resource, palette }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 40%"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-16 md:px-10 md:py-24">
      <SectionIntro kicker="How to use it" icon="compass" title="A path through the resource" sub={`Four moments that cover most of how people use ${resource.name.toLowerCase()}.`} palette={palette} align="center" />

      <div ref={ref} className="relative mt-14">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200 md:left-1/2 md:-ml-px" aria-hidden>
          <motion.div className={`w-px origin-top ${palette.line}`} style={{ height: lineHeight }} />
        </div>

        <ol className="space-y-10">
          {resource.timeline.map((step, i) => {
            const SIcon = ICONS[step.icon];
            const rightSide = i % 2 === 1;
            return (
              <li key={step.title} className={`relative flex flex-col gap-4 pl-14 md:flex-row md:pl-0 ${rightSide ? "md:flex-row-reverse" : ""}`}>
                <motion.span
                  {...riseIn(0.05)}
                  className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md md:left-1/2 md:-ml-5 ${palette.grad}`}
                >
                  <SIcon className="h-4.5 w-4.5" />
                </motion.span>
                <div className="md:w-1/2" />
                <TiltCard max={4} lift={5} outerProps={riseIn(0.1)} className="md:w-1/2">
                  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${rightSide ? "md:mr-8" : "md:ml-8"}`}>
                    <p className="text-sm font-bold text-slate-900">{step.title}</p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{step.text}</p>
                  </div>
                </TiltCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Feature grid — masonry-ish reveal cards, replaces the rotating tabs     */
/* ====================================================================== */

function FeatureGrid({ resource, palette }) {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:px-10 md:py-24">
      <SectionIntro kicker="What it offers" icon="layers" title="Everything built into it" sub="Five things that make this the resource people come back to." palette={palette} />

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resource.features.map((f, i) => {
          const FIcon = ICONS[f.icon];
          const big = i === 0;
          return (
            <GlossPanel key={f.title} palette={palette} delay={i * 0.07} className={big ? "sm:col-span-2" : ""} cardClassName="h-full">
              <div className="relative flex h-full flex-col p-6" style={{ transform: "translateZ(20px)" }}>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette.faint} ${palette.ink}`}>
                  <FIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-500">{f.text}</p>
              </div>
            </GlossPanel>
          );
        })}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/* Audience carousel — draggable row of stat cards, replaces flip cards    */
/* ====================================================================== */

function AudienceCarousel({ resource, palette }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  };

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section id="audiences" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:px-10 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionIntro kicker="Who it's for" icon="users" title="Made for different kinds of work" palette={palette} />
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} disabled={atStart} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm disabled:opacity-30">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scrollBy(1)} disabled={atEnd} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm disabled:opacity-30">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={trackRef} onScroll={updateEdges} className="mt-10 flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {resource.audiences.map((a, i) => {
          const AIcon = ICONS[a.icon];
          return (
            <TiltCard key={a.title} max={5} lift={6} outerProps={riseIn(i * 0.05)} className="w-64 shrink-0">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.faint} ${palette.ink}`}>
                  <AIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-base font-bold text-slate-900">{a.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{a.text}</p>
                <p className={`mt-4 text-sm font-bold ${palette.ink}`}>{a.stat}</p>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Compare toggle — a switch that crossfades content, replaces the slider  */
/* ====================================================================== */

function CompareToggle({ resource, palette }) {
  const [on, setOn] = useState(false);
  const t = resource.toggle;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
      <SectionIntro kicker="Before and after" icon="zap" title="The difference it makes" palette={palette} align="center" />

      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${on ? "text-slate-400" : "text-slate-900"}`}>{t.offLabel}</span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => setOn((v) => !v)}
            className={`relative h-8 w-16 rounded-full transition-colors ${on ? `bg-gradient-to-r ${palette.grad}` : "bg-slate-200"}`}
          >
            <motion.span layout transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md" style={{ left: on ? "calc(100% - 1.75rem)" : "0.25rem" }} />
          </button>
          <span className={`text-sm font-semibold ${on ? "text-slate-900" : "text-slate-400"}`}>{t.onLabel}</span>
        </div>

        <div className="relative min-h-[140px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={on ? "on" : "off"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}
              className={`rounded-2xl border p-6 text-center shadow-sm ${on ? `${palette.edge} ${palette.faint}` : "border-slate-200 bg-slate-50"}`}
            >
              <p className="text-[15px] leading-relaxed text-slate-700">{on ? t.onBody : t.offBody}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Other resources — scroll-snap carousel with arrow nav                  */
/* ====================================================================== */

function OtherResources({ resource }) {
  const others = RESOURCE_LIST.filter((r) => r.slug !== resource.slug);
  const trackRef = useRef(null);
  const scrollBy = (dir) => trackRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionIntro kicker="Keep exploring" icon="compass" title="More resources" palette={PALETTES[resource.palette]} />
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scrollBy(1)} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {others.map((r, i) => {
          const p = PALETTES[r.palette];
          const RIcon = ICONS[r.icon];
          return (
            <TiltCard key={r.slug} max={6} lift={6} outerProps={riseIn(i * 0.06)} className="w-72 shrink-0 snap-start">
              <Link href={`/resources/${r.slug}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${p.grad}`}>
                  <RIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-base font-bold text-slate-900">{r.name}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{r.eyebrow}</p>
                <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${p.ink}`}>
                  Explore <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Subscribe / final CTA                                                   */
/* ====================================================================== */

function SubscribeCta({ resource, palette }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
      <TiltCard max={3} lift={4} outerProps={riseIn(0)}>
        <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br p-10 text-white md:p-14 ${palette.grad}`}>
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{resource.ctaTitle}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90">{resource.ctaText}</p>

            {sent ? (
              <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold">
                <Check className="h-4 w-4" /> You're set — check your inbox.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={resource.ctaPlaceholder}
                  className="min-w-0 flex-1 rounded-full border-0 bg-white/95 px-5 py-3 text-sm text-slate-900 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-white"
                />
                <Press>
                  <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg">
                    {resource.ctaButton} <ArrowRight className="h-4 w-4" />
                  </button>
                </Press>
              </form>
            )}
          </div>
        </div>
      </TiltCard>
    </section>
  );
}

function Footnote({ resource }) {
  return (
    <div className="flex flex-col items-center gap-3 pb-16 text-sm text-slate-400">
      <span>{resource.name} · part of the NovaAI resource library</span>
      <a href="#" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
        Back to top <ChevronDown className="h-3.5 w-3.5 rotate-180" />
      </a>
    </div>
  );
}

/* ====================================================================== */
/* Page                                                                    */
/* ====================================================================== */

export default function ResourcesPage({ slug }) {
  const resource = RESOURCES[slug];
  const palette = PALETTES[resource?.palette] || PALETTES.indigo;

  if (!resource) return null;

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate overflow-x-clip bg-[#F4F6FB]">
        <Background palette={palette} />
        <div className="relative z-10">
          <Hero resource={resource} palette={palette} />
          <QuickLinks resource={resource} palette={palette} />
          <StatsStrip resource={resource} />
          <TickerBand resource={resource} palette={palette} />
          <JourneyTimeline resource={resource} palette={palette} />
          <FeatureGrid resource={resource} palette={palette} />
          <AudienceCarousel resource={resource} palette={palette} />
          <CompareToggle resource={resource} palette={palette} />
          <OtherResources resource={resource} />
          <SubscribeCta resource={resource} palette={palette} />
          <Footnote resource={resource} />
        </div>
      </main>
    </MotionConfig>
  );
}

/* Note: RESOURCE_SLUGS/RESOURCE_LIST/RESOURCES are NOT re-exported from
   here. app/resources/[slug]/page.js needs them on the server (in
   generateStaticParams/generateMetadata), and re-exporting them from
   this "use client" file would hand the server the same opaque client
   reference that caused the original crash — it imports straight from
   data/resources.js instead. */