"use client";

/**
 * AI Tool page (ONE component for every /ai-tools/[slug] page).
 *
 * The layout is shared; each tool only supplies data. To add a tool, add an
 * entry to TOOLS below (and its slug in app/ai-tools/[slug]/page.js).
 *
 * This page renders the page body only (no Navbar/Footer). Wrap it the same
 * way you wrapped your Product page. Every tool has an interactive demo in
 * the hero; the demo content, numbers and copy below are sample text you can
 * edit freely.
 *
 * Needs: framer-motion, lucide-react, next/link, Tailwind.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  animate,
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
  AlignLeft,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  FileText,
  Globe,
  Home,
  Image as ImageIcon,
  Languages,
  Layers,
  Lightbulb,
  Lock,
  Mail,
  Megaphone,
  Palette,
  Pencil,
  RefreshCw,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const ICONS = {
  pen: Pencil,
  image: ImageIcon,
  chart: BarChart3,
  code: Code2,
  list: AlignLeft,
  sparkles: Sparkles,
  zap: Zap,
  shield: ShieldCheck,
  check: Check,
  clock: Clock,
  globe: Globe,
  layers: Layers,
  search: Search,
  file: FileText,
  target: Target,
  palette: Palette,
  bug: Bug,
  terminal: Terminal,
  book: BookOpen,
  mail: Mail,
  megaphone: Megaphone,
  trending: TrendingUp,
  users: Users,
  bulb: Lightbulb,
  scissors: Scissors,
  languages: Languages,
  timer: Timer,
  lock: Lock,
  refresh: RefreshCw,
};

/* ====================================================================== */
/* THEMES (every class is written out in full so Tailwind can see it)      */
/* ====================================================================== */

const THEMES = {
  violet: {
    grad: "from-violet-500 to-fuchsia-500",
    gradText: "from-violet-600 via-purple-500 to-fuchsia-500",
    text: "text-violet-600",
    soft: "bg-violet-100",
    tint: "bg-violet-50",
    solid: "bg-violet-500",
    edge: "border-violet-300",
    blob: "bg-violet-300/40",
    blob2: "bg-fuchsia-300/35",
    ring: "focus-visible:ring-violet-400",
    shadow: "shadow-[0_18px_40px_-10px_rgba(124,58,237,0.6)]",
    shadowHover: "hover:shadow-[0_28px_60px_-10px_rgba(124,58,237,0.85)]",
    rgb: "124,58,237",
    c1: "#7c3aed",
    c2: "#d946ef",
  },
  fuchsia: {
    grad: "from-fuchsia-500 to-rose-500",
    gradText: "from-fuchsia-600 via-pink-500 to-orange-400",
    text: "text-fuchsia-600",
    soft: "bg-fuchsia-100",
    tint: "bg-fuchsia-50",
    solid: "bg-fuchsia-500",
    edge: "border-fuchsia-300",
    blob: "bg-fuchsia-300/40",
    blob2: "bg-orange-200/45",
    ring: "focus-visible:ring-fuchsia-400",
    shadow: "shadow-[0_18px_40px_-10px_rgba(217,70,239,0.6)]",
    shadowHover: "hover:shadow-[0_28px_60px_-10px_rgba(217,70,239,0.85)]",
    rgb: "217,70,239",
    c1: "#d946ef",
    c2: "#fb7185",
  },
  sky: {
    grad: "from-sky-500 to-indigo-500",
    gradText: "from-sky-500 via-blue-500 to-indigo-500",
    text: "text-sky-600",
    soft: "bg-sky-100",
    tint: "bg-sky-50",
    solid: "bg-sky-500",
    edge: "border-sky-300",
    blob: "bg-sky-300/45",
    blob2: "bg-indigo-300/35",
    ring: "focus-visible:ring-sky-400",
    shadow: "shadow-[0_18px_40px_-10px_rgba(14,165,233,0.6)]",
    shadowHover: "hover:shadow-[0_28px_60px_-10px_rgba(14,165,233,0.85)]",
    rgb: "14,165,233",
    c1: "#0ea5e9",
    c2: "#6366f1",
  },
  emerald: {
    grad: "from-emerald-500 to-teal-500",
    gradText: "from-emerald-500 via-teal-500 to-cyan-500",
    text: "text-emerald-600",
    soft: "bg-emerald-100",
    tint: "bg-emerald-50",
    solid: "bg-emerald-500",
    edge: "border-emerald-300",
    blob: "bg-emerald-300/40",
    blob2: "bg-cyan-300/35",
    ring: "focus-visible:ring-emerald-400",
    shadow: "shadow-[0_18px_40px_-10px_rgba(16,185,129,0.6)]",
    shadowHover: "hover:shadow-[0_28px_60px_-10px_rgba(16,185,129,0.85)]",
    rgb: "16,185,129",
    c1: "#10b981",
    c2: "#14b8a6",
  },
  amber: {
    grad: "from-amber-500 to-orange-500",
    gradText: "from-amber-500 via-orange-500 to-rose-500",
    text: "text-amber-600",
    soft: "bg-amber-100",
    tint: "bg-amber-50",
    solid: "bg-amber-500",
    edge: "border-amber-300",
    blob: "bg-amber-300/45",
    blob2: "bg-rose-200/40",
    ring: "focus-visible:ring-amber-400",
    shadow: "shadow-[0_18px_40px_-10px_rgba(245,158,11,0.6)]",
    shadowHover: "hover:shadow-[0_28px_60px_-10px_rgba(245,158,11,0.85)]",
    rgb: "245,158,11",
    c1: "#f59e0b",
    c2: "#f97316",
  },
};

/* ====================================================================== */
/* DATA: one entry per tool (edit me)                                      */
/* ====================================================================== */

const TOOLS = {
  /* ------------------------------ AI Writer ------------------------------ */
  "ai-writer": {
    slug: "ai-writer",
    name: "AI Writer",
    tagline: "Blogs, emails and more",
    icon: "pen",
    theme: "violet",
    badge: "Writing assistant",
    heading: [
      { text: "Write" },
      { text: "better," },
      { br: true },
      { text: "without the blank page.", gradient: true },
    ],
    sub: "Draft blog posts, emails, and marketing copy in seconds. Set the tone, refine every line, and publish with confidence.",
    cta: "Try AI Writer",
    chips: ["Blog posts", "Emails", "Ad copy", "Social posts"],
    floaters: [
      { icon: "pen", label: "Tone matched" },
      { icon: "refresh", label: "Rewrite in one click" },
      { icon: "check", label: "Grammar checked" },
    ],
    playground: {
      kind: "text",
      title: "Writer workspace",
      examples: [
        {
          label: "Blog intro",
          prompt: "Write a friendly intro for a blog post about remote work habits.",
          output:
            "Working from home sounds simple until the day blurs into one long afternoon. The good news: a few small habits can bring the structure back. In this post we'll walk through the routines that help remote teams stay focused, stay connected, and still log off on time.",
        },
        {
          label: "Client email",
          prompt: "Write a short email introducing our design studio to a new client.",
          output:
            "Hi Maya, I'm reaching out from Northlight Studio. We help growing brands turn scattered ideas into a clear, consistent identity. I'd love to share two quick examples that fit your launch plans. Would a 15-minute call this week work?",
        },
        {
          label: "Product blurb",
          prompt: "Write a punchy product description for a reusable water bottle.",
          output:
            "Meet the bottle that keeps up with you. Double-walled steel keeps drinks ice-cold all day, the leak-proof lid survives any bag, and the matte finish looks good from the gym to the office. Refill. Repeat. Skip the plastic.",
        },
        {
          label: "Social post",
          prompt: "Write an upbeat social post announcing our new dashboard.",
          output:
            "Big news! Our new dashboard just landed. Cleaner views, faster reports, and everything you need in one place. Take it for a spin and tell us what you think. 🚀",
        },
      ],
    },
    band: ["Blog posts", "Emails", "Ad copy", "Social posts", "Product pages", "Newsletters", "Scripts", "Headlines"],
    steps: [
      { icon: "pen", title: "Describe what you need", text: "Type a prompt or paste rough notes. Tell the AI who it is for and how it should sound." },
      { icon: "sparkles", title: "Draft in seconds", text: "Get a full first draft with structure, headings, and a consistent voice." },
      { icon: "check", title: "Refine and publish", text: "Rewrite, shorten, or change the tone with one click, then copy it wherever you need it." },
    ],
    capabilities: [
      { icon: "megaphone", title: "Tone control", text: "Switch between friendly, professional, or playful without rewriting from scratch.", points: ["Match your brand voice", "Adjust formality instantly", "Keep the meaning intact"] },
      { icon: "refresh", title: "Rewrite and expand", text: "Turn a rough sentence into a full paragraph, or trim a long one down.", points: ["Expand short notes", "Tighten wordy drafts", "Fix awkward phrasing"] },
      { icon: "file", title: "Templates for every format", text: "Start from proven structures for blogs, emails, ads, and social posts.", points: ["Blog outlines", "Email sequences", "Ad headlines"] },
      { icon: "check", title: "Grammar and clarity", text: "Catch typos and unclear sentences while you write.", points: ["Spelling and grammar", "Readability hints", "Consistent style"] },
      { icon: "bulb", title: "Ideas on demand", text: "Stuck? Get headlines, hooks, and angles to get moving again.", points: ["Headline options", "Opening hooks", "Fresh angles"] },
    ],
    useCases: [
      { icon: "megaphone", title: "Marketing teams", text: "Draft campaign copy, landing pages, and newsletters faster." },
      { icon: "target", title: "Founders", text: "Write investor updates and announcements without losing an afternoon." },
      { icon: "book", title: "Bloggers", text: "Outline posts and polish drafts in your own voice." },
      { icon: "mail", title: "Support teams", text: "Turn quick notes into clear, friendly replies." },
      { icon: "users", title: "Students", text: "Structure essays and improve clarity, then make the work your own." },
      { icon: "layers", title: "Agencies", text: "Produce first drafts for many clients and keep each voice consistent." },
    ],
    compare: {
      beforeLabel: "Rough notes",
      afterLabel: "Polished draft",
      before: "hey team, meeting moved to thurs 3pm, sorry for the mess, need everyone to send updates before, thanks",
      after: "Hi team, quick update: our meeting has moved to Thursday at 3:00 PM. Please send your updates beforehand so we can use the time well. Thanks for your flexibility!",
    },
    finalTitle: "Ready to write your next draft?",
    finalText: "Open the writer, describe what you need, and get a first draft in seconds.",
  },

  /* --------------------------- Image Generator --------------------------- */
  "image-generator": {
    slug: "image-generator",
    name: "Image Generator",
    tagline: "Turn ideas into art",
    icon: "image",
    theme: "fuchsia",
    badge: "Image generation",
    heading: [
      { text: "Turn" },
      { text: "ideas" },
      { text: "into" },
      { br: true },
      { text: "stunning visuals.", gradient: true },
    ],
    sub: "Describe a scene, pick a style, and watch it appear. Create concept art, social graphics, and product mockups without opening a design tool.",
    cta: "Try Image Generator",
    chips: ["Concept art", "Social graphics", "Mockups", "Backgrounds"],
    floaters: [
      { icon: "palette", label: "Style presets" },
      { icon: "zap", label: "Fast previews" },
      { icon: "layers", label: "Variations" },
    ],
    playground: {
      kind: "image",
      title: "Image studio",
      prompts: [
        "A calm mountain lake at sunrise",
        "A futuristic city at dusk",
        "A glowing forest after rain",
        "An island floating in the sky",
      ],
      styles: [
        { label: "Dreamy", palette: ["#8b7cf6", "#f0a6ec", "#ffd9c9", "#5b45c8"] },
        { label: "Neon", palette: ["#0f172a", "#7c3aed", "#22d3ee", "#f472b6"] },
        { label: "Sunset", palette: ["#f97316", "#f472b6", "#fde68a", "#7c2d12"] },
        { label: "Ocean", palette: ["#0ea5e9", "#6366f1", "#a5f3fc", "#1e3a8a"] },
      ],
    },
    band: ["Concept art", "Social graphics", "Product mockups", "Backgrounds", "Book covers", "Thumbnails", "Moodboards", "Posters"],
    steps: [
      { icon: "pen", title: "Describe your idea", text: "Write a sentence about what you want to see, or start from a suggestion." },
      { icon: "palette", title: "Choose a style", text: "Pick a look, from dreamy and soft to bold and neon, and set the mood." },
      { icon: "sparkles", title: "Generate and refine", text: "Get several variations at once, then pick a favorite and keep improving it." },
    ],
    capabilities: [
      { icon: "palette", title: "Style presets", text: "One tap to change the whole look of an image.", points: ["Dreamy, neon, sunset, ocean", "Consistent color palettes", "Save your favorites"] },
      { icon: "layers", title: "Variations", text: "See several takes on the same idea and choose the best one.", points: ["Four options per prompt", "Iterate on a favorite", "Compare side by side"] },
      { icon: "bulb", title: "Prompt helper", text: "Get suggestions that make short prompts more vivid.", points: ["Add lighting and mood", "Suggest camera angles", "Fix vague wording"] },
      { icon: "target", title: "Sizes for every channel", text: "Create for social, web, or print with the right proportions.", points: ["Square, wide, and tall", "Safe areas for text", "Batch resize"] },
      { icon: "zap", title: "Fast previews", text: "See results quickly so you can explore more ideas.", points: ["Low-res drafts first", "Upscale the keepers", "Less waiting"] },
    ],
    useCases: [
      { icon: "megaphone", title: "Social media", text: "Create eye-catching graphics for every post." },
      { icon: "palette", title: "Brand design", text: "Explore moodboards and directions before committing." },
      { icon: "layers", title: "Game concepts", text: "Sketch worlds, props, and characters in minutes." },
      { icon: "target", title: "E-commerce", text: "Mock up product scenes and lifestyle backdrops." },
      { icon: "file", title: "Presentations", text: "Add custom visuals instead of generic stock photos." },
      { icon: "book", title: "Book covers", text: "Test cover ideas quickly before hiring a designer." },
    ],
    compare: {
      beforeLabel: "Your prompt",
      afterLabel: "Generated image",
      before: "A cozy reading nook with warm light, plants, and a rainy window",
      after: "Dreamy style, ready to refine or upscale.",
      art: { palette: ["#8b7cf6", "#f0a6ec", "#ffd9c9", "#5b45c8"], seed: 7 },
    },
    finalTitle: "Ready to see your idea?",
    finalText: "Type a sentence, pick a style, and get your first image in moments.",
  },

  /* ---------------------------- Data Analyzer ---------------------------- */
  "data-analyzer": {
    slug: "data-analyzer",
    name: "Data Analyzer",
    tagline: "Find insights instantly",
    icon: "chart",
    theme: "sky",
    badge: "Data analysis",
    heading: [
      { text: "Turn" },
      { text: "raw" },
      { text: "numbers" },
      { text: "into" },
      { br: true },
      { text: "clear answers.", gradient: true },
    ],
    sub: "Upload a spreadsheet or connect your data, then ask questions in plain English. Get charts, trends, and the story behind them.",
    cta: "Try Data Analyzer",
    chips: ["Trends", "Charts", "Forecasts", "Reports"],
    floaters: [
      { icon: "trending", label: "Trends spotted" },
      { icon: "search", label: "Ask in plain English" },
      { icon: "file", label: "Shareable reports" },
    ],
    playground: {
      kind: "chart",
      title: "Analysis board",
      datasets: [
        {
          label: "Weekly signups",
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          values: [120, 135, 128, 160, 210, 198, 240, 262],
          decimals: 0,
          good: "up",
          question: "Why did signups jump in week 5?",
          answer: "Week 5 lines up with the launch campaign. Signups rose 31% over the previous week and stayed elevated afterwards.",
        },
        {
          label: "Revenue ($k)",
          labels: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
          values: [42, 45, 44, 51, 55, 53, 61, 68],
          decimals: 0,
          good: "up",
          question: "Which month grew the fastest?",
          answer: "Month 4 grew fastest, at about 16% over Month 3. Growth stayed positive in every month after that except Month 6.",
        },
        {
          label: "Churn rate (%)",
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          values: [5.2, 5.0, 4.8, 4.9, 4.4, 4.1, 3.9, 3.6],
          decimals: 1,
          good: "down",
          question: "Is churn improving?",
          answer: "Yes. Churn fell from 5.2% to 3.6% over eight weeks, a drop of about 31%, with only one small uptick in week 4.",
        },
      ],
    },
    band: ["Trends", "Charts", "Forecasts", "Reports", "Anomalies", "Dashboards", "Cohorts", "KPIs"],
    steps: [
      { icon: "file", title: "Connect your data", text: "Upload a spreadsheet or connect a source. Columns and types are detected for you." },
      { icon: "search", title: "Ask in plain English", text: "Type a question like you would ask a teammate and get a chart plus an explanation." },
      { icon: "check", title: "Share the insight", text: "Save the view, export a report, or send a link to your team." },
    ],
    capabilities: [
      { icon: "search", title: "Natural-language questions", text: "Ask what you want to know without writing formulas or queries.", points: ["Plain-English questions", "Follow-up questions", "Context is remembered"] },
      { icon: "chart", title: "Automatic charts", text: "The right chart is picked for your data, then refined as you ask.", points: ["Line, bar, and area", "Clean labels", "Interactive tooltips"] },
      { icon: "trending", title: "Trend and anomaly detection", text: "Spot spikes, dips, and patterns you might have missed.", points: ["Highlights unusual values", "Compares periods", "Simple forecasts"] },
      { icon: "bulb", title: "Explains the why", text: "Get a short written explanation next to every chart.", points: ["Readable summaries", "Key drivers called out", "No jargon"] },
      { icon: "file", title: "Shareable reports", text: "Turn an analysis into a report your team can read in a minute.", points: ["Export to PDF", "Live links", "Scheduled updates"] },
    ],
    useCases: [
      { icon: "layers", title: "Product teams", text: "See how features change behavior and retention." },
      { icon: "trending", title: "Finance", text: "Track revenue, costs, and forecasts without manual reports." },
      { icon: "megaphone", title: "Marketing", text: "Understand which campaigns actually move the numbers." },
      { icon: "timer", title: "Operations", text: "Find bottlenecks and watch delivery times improve." },
      { icon: "target", title: "Founders", text: "Get a clear weekly picture of the business." },
      { icon: "book", title: "Researchers", text: "Explore datasets quickly before deeper statistics." },
    ],
    compare: {
      beforeLabel: "Raw export",
      afterLabel: "AI summary",
      before: "Q3_export_final_v2.csv: 14,382 rows, 27 columns, no summary. Where do you even start?",
      after: "Sales grew 18% quarter over quarter. Two regions drove most of the gain, while returns rose in one category that is worth a closer look.",
    },
    finalTitle: "Ready to ask your data a question?",
    finalText: "Connect a dataset and get your first chart and explanation in seconds.",
  },

  /* ---------------------------- Code Assistant ---------------------------- */
  "code-assistant": {
    slug: "code-assistant",
    name: "Code Assistant",
    tagline: "Write, explain and fix code",
    icon: "code",
    theme: "emerald",
    badge: "Developer tools",
    heading: [
      { text: "Ship" },
      { text: "code" },
      { br: true },
      { text: "faster, with confidence.", gradient: true },
    ],
    sub: "Generate functions, understand unfamiliar code, and fix bugs with an assistant that reads your context. Works with the languages you use every day.",
    cta: "Try Code Assistant",
    chips: ["Generate", "Explain", "Fix bugs", "Refactor"],
    floaters: [
      { icon: "terminal", label: "Reads your context" },
      { icon: "bug", label: "Finds bugs" },
      { icon: "check", label: "Clean suggestions" },
    ],
    playground: {
      kind: "code",
      title: "Code studio",
      tabs: [
        {
          label: "Write",
          prompt: "Write a function that debounces another function",
          lines: [
            "function debounce(fn, delay = 300) {",
            "  let timer;",
            "  return (...args) => {",
            "    clearTimeout(timer);",
            "    timer = setTimeout(() => fn(...args), delay);",
            "  };",
            "}",
          ],
          notes: [
            "Returns a wrapped function that waits until calls stop",
            "Cancels the pending call each time it runs again",
            "Default delay of 300 ms, easy to change",
          ],
        },
        {
          label: "Explain",
          prompt: "Explain what this code does",
          lines: [
            "const total = items",
            "  .filter((item) => item.inStock)",
            "  .reduce((sum, item) => sum + item.price, 0);",
          ],
          notes: [
            "filter keeps only the items that are in stock",
            "reduce adds up their prices, starting from 0",
            "total ends up as the combined price of in-stock items",
          ],
        },
        {
          label: "Fix",
          prompt: "Fix the bug: the list crashes when the data is empty",
          lines: [
            "  function firstName(users) {",
            "-   return users[0].name;",
            "+   if (!users?.length) return \"\";",
            "+   return users[0].name;",
            "  }",
          ],
          notes: [
            "The original read users[0] even when the array was empty",
            "The guard returns an empty string instead of crashing",
          ],
        },
      ],
    },
    band: ["Generate", "Explain", "Fix bugs", "Refactor", "Write tests", "Review code", "Document", "Migrate"],
    steps: [
      { icon: "terminal", title: "Describe or paste", text: "Explain what you need in words, or paste the code you are stuck on." },
      { icon: "search", title: "Review the suggestion", text: "Read the code and the explanation side by side so you know exactly what changed." },
      { icon: "check", title: "Apply with confidence", text: "Copy the result into your project, or ask for a different approach." },
    ],
    capabilities: [
      { icon: "code", title: "Code generation", text: "Turn a short description into working code.", points: ["Functions and components", "Uses your naming style", "Comments where helpful"] },
      { icon: "book", title: "Plain-English explanations", text: "Understand unfamiliar code without digging through docs.", points: ["Line-by-line notes", "Explains why, not only what", "Beginner friendly"] },
      { icon: "bug", title: "Bug fixing", text: "Paste an error or a failing case and get a targeted fix.", points: ["Shows a clear diff", "Explains the cause", "Suggests a test"] },
      { icon: "refresh", title: "Refactoring", text: "Clean up messy code while keeping behavior the same.", points: ["Simpler structure", "Modern syntax", "Fewer repeated blocks"] },
      { icon: "check", title: "Tests and docs", text: "Generate tests and documentation alongside your code.", points: ["Unit test drafts", "Docstrings", "Usage examples"] },
    ],
    useCases: [
      { icon: "layers", title: "Frontend developers", text: "Build components and fix layout logic faster." },
      { icon: "terminal", title: "Backend teams", text: "Draft handlers, queries, and validation." },
      { icon: "book", title: "Students", text: "Learn by reading explanations of real code." },
      { icon: "search", title: "Code reviewers", text: "Get a quick summary of what a change does." },
      { icon: "chart", title: "Data scientists", text: "Turn analysis ideas into clean scripts." },
      { icon: "users", title: "Open-source maintainers", text: "Triage issues and understand unfamiliar contributions." },
    ],
    compare: {
      beforeLabel: "Before",
      afterLabel: "After",
      mono: true,
      before: "function f(a){var r=[];for(var i=0;i<a.length;i++){if(a[i]>0){r.push(a[i]*2)}}return r}",
      after: "const doublePositives = (numbers) =>\n  numbers.filter((n) => n > 0).map((n) => n * 2);",
    },
    finalTitle: "Ready to ship your next feature?",
    finalText: "Paste a snippet or describe a task and get working code with an explanation.",
  },

  /* ----------------------------- AI Summarizer ----------------------------- */
  "ai-summarizer": {
    slug: "ai-summarizer",
    name: "AI Summarizer",
    tagline: "Long text made short",
    icon: "list",
    theme: "amber",
    badge: "Summarization",
    heading: [
      { text: "Long" },
      { text: "text," },
      { br: true },
      { text: "made short.", gradient: true },
    ],
    sub: "Paste an article, report, or transcript and get a clear summary you can read in seconds. Choose how short you want it.",
    cta: "Try AI Summarizer",
    chips: ["Articles", "Reports", "Transcripts", "Emails"],
    floaters: [
      { icon: "scissors", label: "Adjustable length" },
      { icon: "search", label: "Key points found" },
      { icon: "timer", label: "Read in seconds" },
    ],
    playground: {
      kind: "summary",
      title: "Summary desk",
      sentences: [
        "Urban gardening has grown steadily over the past decade as more people look for ways to reconnect with food and nature in crowded cities.",
        "Community plots, rooftop gardens, and balcony containers now supply fresh herbs and vegetables to thousands of households.",
        "Beyond the harvest, these spaces cool nearby buildings, absorb rainwater, and give neighbors a reason to meet.",
        "Cities are responding with support, from free soil and seeds to unused lots converted into shared plots.",
        "Challenges remain, including limited space, contaminated soil in older districts, and the time it takes to keep a garden healthy.",
        "Beginners can start small with a few pots, a sunny window, and easy crops like lettuce, basil, or tomatoes.",
        "Experts recommend testing soil before planting in the ground and choosing raised beds when contamination is a concern.",
      ],
      levels: [
        {
          label: "Short",
          keep: [0, 5],
          bullets: ["Urban gardening is growing because it brings food, cooling, and community to cities, and beginners can start small with a few pots."],
        },
        {
          label: "Medium",
          keep: [0, 2, 3, 4],
          bullets: [
            "Urban gardens supply fresh food and cool nearby buildings.",
            "Cities support them with free soil, seeds, and shared plots.",
            "Space, soil quality, and time are the main challenges.",
          ],
        },
        {
          label: "Detailed",
          keep: [0, 1, 2, 3, 4, 5, 6],
          bullets: [
            "Urban gardening has grown over the past decade as people reconnect with food and nature.",
            "Community plots, rooftops, and balconies now feed thousands of households.",
            "Gardens also cool buildings, absorb rainwater, and bring neighbors together.",
            "Cities help with free soil, seeds, and converted lots.",
            "Beginners can start with a few pots, and experts advise testing soil first or using raised beds.",
          ],
        },
      ],
    },
    band: ["Articles", "Reports", "Transcripts", "Emails", "Research papers", "Meeting notes", "Contracts", "Newsletters"],
    steps: [
      { icon: "file", title: "Paste or upload", text: "Drop in an article, report, transcript, or a long email thread." },
      { icon: "scissors", title: "Pick a length", text: "Choose a one-line summary, a few bullets, or a detailed overview." },
      { icon: "check", title: "Read and share", text: "See the key points highlighted in the source, then copy the summary anywhere." },
    ],
    capabilities: [
      { icon: "scissors", title: "Adjustable length", text: "Go from one sentence to a detailed overview with a single control.", points: ["Short, medium, detailed", "Instant switching", "Keeps the main idea"] },
      { icon: "search", title: "Key point extraction", text: "The most important sentences are found and highlighted for you.", points: ["Source highlights", "Ranked by importance", "Easy to verify"] },
      { icon: "book", title: "Works on long documents", text: "Summarize reports and transcripts that would take an hour to read.", points: ["Long inputs supported", "Sections summarized", "Combined overview"] },
      { icon: "list", title: "Multiple formats", text: "Get bullets, a paragraph, or an action list.", points: ["Bullet points", "Short paragraphs", "Action items"] },
      { icon: "languages", title: "Multilingual", text: "Summarize text in one language and read it in another.", points: ["Many languages", "Tone preserved", "Names kept accurate"] },
    ],
    useCases: [
      { icon: "book", title: "Students", text: "Review readings and lecture notes in minutes." },
      { icon: "search", title: "Researchers", text: "Skim many papers to find the ones worth reading." },
      { icon: "target", title: "Executives", text: "Get the decisions and risks from long reports." },
      { icon: "megaphone", title: "Journalists", text: "Digest background material quickly." },
      { icon: "shield", title: "Legal and compliance", text: "Pull the key terms out of long documents." },
      { icon: "mail", title: "Customer support", text: "Catch up on a long thread before you reply." },
    ],
    compare: {
      beforeLabel: "Meeting notes",
      afterLabel: "Summary",
      before: "We talked about the launch date, then moved to budget, someone raised staffing, we circled back to the date, agreed to decide on Friday, also discussed the logo and the newsletter...",
      after: "Decisions: launch date to be confirmed on Friday. Budget approved. Open item: staffing. Follow-ups: logo and newsletter.",
    },
    finalTitle: "Ready to save an hour of reading?",
    finalText: "Paste your text, choose a length, and get the summary right away.",
  },
};

const TOOL_LIST = Object.values(TOOLS);

/* ====================================================================== */
/* 3D + motion helpers                                                     */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded. Both states use the
// same number of layers so Framer Motion can animate between them.
const extrude = (d, color = "#dcd8f2") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(80,70,180,0.18)`;

const TEXT_3D = extrude(0.7);
const TEXT_3D_LIFT = extrude(1.6);
const TILT_SPRING = { stiffness: 220, damping: 18 };

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 50, rotateX: -24, transformPerspective: 1000 },
  whileInView: { opacity: 1, y: 0, rotateX: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.8, delay, ease: EASE },
});

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Card that enters in 3D, then tilts toward the mouse, lifts, and shows a
 * moving glare. `className` goes on the outer element; `cardClassName`
 * styles the tilting card. Children can use style={{ transform:
 * "translateZ(30px)" }} to float above the card surface.
 */
function Tilt({
  children,
  as = "div",
  className = "",
  cardClassName = "",
  max = 8,
  lift = 8,
  scale = 1.02,
  glare = false,
  outerProps,
}) {
  const Outer = motion[as] || motion.div;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), TILT_SPRING);
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glareOpacity = useSpring(hover, { stiffness: 150, damping: 20 });
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.85), rgba(255,255,255,0) 55%)`;

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onEnter = (e) => {
    if (e.pointerType === "mouse") hover.set(1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    hover.set(0);
  };

  return (
    <Outer className={className} {...(outerProps || enter())}>
      <motion.div
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        whileHover={{ y: -lift, scale }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
        className={`relative h-full ${cardClassName}`}
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg, opacity: glareOpacity, mixBlendMode: "soft-light" }}
          />
        )}
      </motion.div>
    </Outer>
  );
}

/**
 * Glass card. The frosted layer is separate from the content so the content
 * keeps real 3D depth (backdrop-filter would otherwise flatten it).
 */
function GlassCard({ children, className = "", cardClassName = "", max = 6, lift = 8, scale = 1.02, delay = 0, as, glow = "bg-violet-300/25", radius = "rounded-[26px]" }) {
  return (
    <Tilt
      as={as}
      className={className}
      max={max}
      lift={lift}
      scale={scale}
      glare
      outerProps={enter(delay)}
      cardClassName={`group ${cardClassName}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 overflow-hidden border border-white/80 bg-white/60 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.3)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_40px_90px_-24px_rgba(99,102,241,0.5)] ${radius}`}
      >
        <div className={`absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${glow}`} />
      </div>
      {children}
    </Tilt>
  );
}

/** Block that swings up from below with a 3D flip. */
function Reveal3D({ children, as = "div", className = "", delay = 0 }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 28, rotateX: -30, transformPerspective: 900 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      style={{ transformOrigin: "50% 100%" }}
    >
      {children}
    </Comp>
  );
}

/** Heading whose words flip up in 3D, look extruded, and tilt on hover. */
function Heading3D({ tokens, gradClass, as: Tag = "h2", className = "", eager = false }) {
  let wordIndex = 0;
  const label = tokens.filter((tok) => !tok.br).map((tok) => tok.text).join(" ");
  const reveal = {
    opacity: 1,
    rotateX: 0,
    y: 0,
  };

  return (
    <Tag className={className} aria-label={label}>
      {tokens.map((tok, i) => {
        if (tok.br) return <br key={i} />;
        const idx = wordIndex++;
        const transition = { duration: 0.85, delay: 0.15 + idx * 0.09, ease: EASE };
        const hoverShadow = tok.gradient
          ? { filter: "drop-shadow(0 12px 14px rgba(79,70,229,0.45))" }
          : { textShadow: TEXT_3D_LIFT };

        return (
          <span key={i} aria-hidden className="mr-[0.25em] inline-block last:mr-0">
            <motion.span
              className={`inline-block cursor-default ${
                tok.gradient ? `bg-gradient-to-r ${gradClass} bg-clip-text text-transparent` : ""
              }`}
              initial={{ opacity: 0, rotateX: -85, y: 34 }}
              {...(eager
                ? { animate: { ...reveal, transition } }
                : { whileInView: { ...reveal, transition }, viewport: { once: true, amount: 0.6 } })}
              whileHover={{
                y: -7,
                rotateX: 12,
                rotateY: -10,
                ...hoverShadow,
                transition: { type: "spring", stiffness: 300, damping: 14 },
              }}
              style={{
                transformPerspective: 700,
                transformOrigin: "50% 100%",
                ...(tok.gradient
                  ? { filter: "drop-shadow(0 6px 8px rgba(79,70,229,0.28))" }
                  : { textShadow: TEXT_3D }),
              }}
            >
              {tok.text}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}

function SectionHead({ title, sub, gradClass, tokens }) {
  return (
    <div className="mx-auto max-w-2xl text-center" style={{ perspective: 1000 }}>
      <Heading3D
        tokens={tokens || [{ text: title }]}
        gradClass={gradClass}
        className="text-3xl font-extrabold leading-tight tracking-tight text-[#0f1030] md:text-4xl"
      />
      {sub && (
        <Reveal3D as="p" delay={0.3} className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
          {sub}
        </Reveal3D>
      )}
    </div>
  );
}

function Sparkle4({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

/** Wrapper that shifts its content with the mouse, at a chosen depth. */
function ParallaxLayer({ mx, my, depth = 20, className = "", children }) {
  const x = useTransform(mx, [-1, 1], [-depth, depth]);
  const y = useTransform(my, [-1, 1], [-depth, depth]);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Wrapper that gently pulls its content toward the cursor (for buttons). */
function Magnetic({ children, strength = 0.3, className = "" }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 14 });
  const y = useSpring(rawY, { stiffness: 220, damping: 14 });
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - (r.left + r.width / 2)) * strength);
    rawY.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };
  return (
    <motion.div onPointerMove={onMove} onPointerLeave={onLeave} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}

/** Reveals text one or two characters at a time. */
function useTypewriter(text, active, resetKey, speed = 16) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    if (reduce) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setN(Math.min(i, text.length));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, resetKey, reduce, speed]);
  return text.slice(0, n);
}

/** True `ms` after `active` becomes true (resets when `key` changes). */
function useDelayed(active, ms, key) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    if (!active) return;
    const t = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(t);
  }, [active, ms, key]);
  return on;
}

/** idle -> loading -> done state machine for the demos. */
function usePhase(ms = 900) {
  const [phase, setPhase] = useState("idle");
  const [runId, setRunId] = useState(0);
  const timer = useRef(null);
  const run = useCallback(() => {
    clearTimeout(timer.current);
    setPhase("loading");
    timer.current = setTimeout(() => {
      setPhase("done");
      setRunId((k) => k + 1);
    }, ms);
  }, [ms]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { phase, runId, run };
}

function smoothPath(xs, ys) {
  return xs
    .map((x, i) => {
      if (i === 0) return `M${x},${ys[i]}`;
      const cx = (xs[i - 1] + x) / 2;
      return `C${cx},${ys[i - 1]} ${cx},${ys[i]} ${x},${ys[i]}`;
    })
    .join(" ");
}

/* ====================================================================== */
/* Generated art (used by the image demo and the compare slider)           */
/* ====================================================================== */

function GenArt({ palette, seed }) {
  const uid = useId().replace(/:/g, "");
  const rnd = (n) => {
    const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const sunX = 20 + rnd(1) * 60;
  const sunY = 16 + rnd(2) * 26;
  const sunR = 8 + rnd(3) * 9;
  const hill = (base, k) => {
    const a1 = 8 + rnd(k) * 16;
    const a2 = 6 + rnd(k + 5) * 18;
    const a3 = 4 + rnd(k + 9) * 14;
    return `M0,${base} Q25,${base - a1} 50,${base - a2} T100,${base - a3} L100,100 L0,100 Z`;
  };
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette[0]} />
          <stop offset="1" stopColor={palette[1]} />
        </linearGradient>
        <radialGradient id={`sun${uid}`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={palette[2]} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#bg${uid})`} />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={rnd(20 + i) * 100} cy={rnd(30 + i) * 45} r="0.7" fill="#fff" opacity="0.75" />
      ))}
      <circle cx={sunX} cy={sunY} r={sunR} fill={`url(#sun${uid})`} />
      <path d={hill(66, 40)} fill={palette[3]} opacity="0.45" />
      <path d={hill(78, 50)} fill={palette[3]} opacity="0.7" />
      <path d={hill(90, 60)} fill={palette[3]} opacity="0.95" />
    </svg>
  );
}

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

function CubeGlass({ size = 56, duration = 24, edge }) {
  const half = size / 2;
  const faces = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(270deg)", "rotateX(90deg)", "rotateX(-90deg)"];
  return (
    <div style={{ width: size, height: size, perspective: 800 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {faces.map((f) => (
          <span
            key={f}
            className={`absolute inset-0 border-2 bg-white/35 ${edge}`}
            style={{ transform: `${f} translateZ(${half}px)` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/** A tilted, slowly spinning glowing ring. */
function SpinRing({ size = 120, thickness = 4, colors, duration = 14, tilt = 68, className = "" }) {
  const mask = `radial-gradient(farthest-side, transparent calc(100% - ${thickness + 1}px), #000 calc(100% - ${thickness}px))`;
  return (
    <div className={className} style={{ width: size, height: size, perspective: 800 }}>
      <div className="h-full w-full" style={{ transform: `rotateX(${tilt}deg)`, transformStyle: "preserve-3d" }}>
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            WebkitMask: mask,
            mask,
            background: `conic-gradient(from 0deg, rgba(255,255,255,0), ${colors[0]} 100deg, ${colors[1]} 220deg, rgba(255,255,255,0) 330deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 41 + 9) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.8) % 9,
  duration: 12 + (i % 5) * 2,
}));

function Background({ theme, mx, my }) {
  const { scrollYProgress } = useScroll();
  const dotsY = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sx}% ${sy}%, rgba(${theme.rgb},0.16), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      {/* dot grid that drifts as you scroll */}
      <motion.div
        style={{
          y: dotsY,
          backgroundImage: `radial-gradient(rgba(${theme.rgb},0.22) 1.2px, transparent 1.2px)`,
          backgroundSize: "26px 26px",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 90%)",
          maskImage: "linear-gradient(to bottom, #000, transparent 90%)",
        }}
        className="absolute inset-x-0 -top-10 h-[1400px] opacity-70"
      />

      {/* color blobs down the page, at different mouse depths */}
      <ParallaxLayer mx={mx} my={my} depth={30} className="absolute -left-28 top-16">
        <motion.div
          className={`h-[26rem] w-[26rem] rounded-full blur-3xl ${theme.blob}`}
          animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-44} className="absolute -right-32 top-[22%]">
        <motion.div
          className={`h-[32rem] w-[32rem] rounded-full blur-3xl ${theme.blob2}`}
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute -left-24 top-[52%]">
        <motion.div
          className={`h-[28rem] w-[28rem] rounded-full blur-3xl ${theme.blob2}`}
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-36} className="absolute -right-28 top-[80%]">
        <motion.div
          className={`h-[28rem] w-[28rem] rounded-full blur-3xl ${theme.blob}`}
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {/* floating 3D shapes */}
      <ParallaxLayer mx={mx} my={my} depth={46} className="absolute left-[3%] top-[34%] hidden lg:block">
        <CubeGlass size={46} duration={24} edge={theme.edge} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-56} className="absolute right-[3%] top-[58%] hidden lg:block">
        <CubeGlass size={64} duration={30} edge={theme.edge} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-30} className="absolute right-[8%] top-[10%] hidden md:block">
        <SpinRing size={110} colors={[theme.c1, theme.c2]} duration={14} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={34} className="absolute left-[6%] top-[72%] hidden md:block">
        <SpinRing size={90} colors={[theme.c2, theme.c1]} duration={18} tilt={64} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={40} className="absolute left-[44%] top-[88%] hidden lg:block">
        <CubeGlass size={38} duration={20} edge={theme.edge} />
      </ParallaxLayer>

      {/* rising particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-10 rounded-full ${theme.solid}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size, opacity: 0 }}
          animate={{ y: [0, -1100], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {/* twinkling sparkles */}
      {[
        { pos: "left-[24%] top-[9%]", size: "h-4 w-4", delay: 0 },
        { pos: "right-[28%] top-[20%]", size: "h-3 w-3", delay: 0.8 },
        { pos: "left-[5%] top-[46%]", size: "h-3.5 w-3.5", delay: 1.4 },
        { pos: "right-[6%] top-[76%]", size: "h-4 w-4", delay: 0.4 },
        { pos: "left-[46%] top-[62%]", size: "h-3 w-3", delay: 1.9 },
      ].map((s) => (
        <motion.span
          key={s.pos}
          className={`absolute ${s.pos} ${theme.text}`}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.25, 0.7], rotate: [0, 90, 180] }}
          transition={{ duration: 4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          <Sparkle4 className={s.size} />
        </motion.span>
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Demo building blocks                                                    */
/* ====================================================================== */

function Skeleton({ lines = 4 }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-3 rounded-full bg-gray-200/80"
          style={{ width: `${94 - i * 12}%` }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

function StatusPill({ phase, theme }) {
  const map = {
    idle: ["Ready", "bg-gray-100 text-gray-500"],
    loading: ["Generating…", `${theme.soft} ${theme.text}`],
    done: ["Done", "bg-emerald-50 text-emerald-600"],
  };
  const [label, cls] = map[phase];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${cls}`}>
      {phase === "loading" && (
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`h-1 w-1 rounded-full ${theme.solid}`}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </span>
      )}
      {phase === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </span>
  );
}

function RunButton({ theme, label, onClick, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r ${theme.grad} px-4 py-2 text-xs font-semibold text-white transition-shadow ${theme.shadow} ${theme.shadowHover} disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
      <Sparkles className="relative h-3.5 w-3.5" />
      <span className="relative">{label}</span>
    </motion.button>
  );
}

function Chip({ active, onClick, children, theme }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${theme.ring} ${
        active
          ? `border-transparent bg-gradient-to-r ${theme.grad} text-white shadow-md`
          : "border-white/80 bg-white/80 text-gray-600 hover:bg-white"
      }`}
    >
      {children}
    </motion.button>
  );
}

/** Window frame that holds every demo. */
function ConsoleFrame({ theme, title, right, children }) {
  return (
    <Tilt max={4} lift={6} scale={1.01} glare outerProps={enter(0.2)} cardClassName="group p-4 md:p-5">
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl"
        style={{ boxShadow: `0 30px 80px -24px rgba(${theme.rgb},0.45)` }}
      >
        <div className={`absolute -right-14 -top-14 h-48 w-48 rounded-full blur-3xl ${theme.blob}`} />
        <div className={`absolute -bottom-16 -left-10 h-48 w-48 rounded-full blur-3xl ${theme.blob2}`} />
      </div>
      <div className="relative flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <span className="text-xs font-semibold text-gray-600">{title}</span>
        </div>
        {right}
      </div>
      <div className="relative mt-4 [transform-style:preserve-3d]" style={{ transform: "translateZ(14px)" }}>
        {children}
      </div>
    </Tilt>
  );
}

/* --------------------------------- Text --------------------------------- */

function TextDemo({ data, theme }) {
  const [sel, setSel] = useState(0);
  const { phase, runId, run } = usePhase();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  const ex = data.examples[sel];
  const typed = useTypewriter(ex.output, phase === "done", runId);
  const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;

  const choose = (i) => {
    setSel(i);
    run();
  };
  const copy = () => {
    navigator.clipboard?.writeText(ex.output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.examples.map((e, i) => (
            <Chip key={e.label} active={sel === i} onClick={() => choose(i)} theme={theme}>
              {e.label}
            </Chip>
          ))}
        </div>

        <div className="flex items-start justify-between gap-3 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
          <p className="text-[13px] leading-relaxed text-gray-600">{ex.prompt}</p>
          <RunButton theme={theme} label="Generate" onClick={run} disabled={phase === "loading"} />
        </div>

        <div className="min-h-[170px] rounded-2xl border border-white bg-white p-4 shadow-sm">
          {phase === "loading" && <Skeleton lines={5} />}
          {phase === "idle" && <p className="text-sm text-gray-400">Your draft will appear here.</p>}
          {phase === "done" && (
            <p className="text-sm leading-relaxed text-gray-700">
              {typed}
              <motion.span
                aria-hidden
                className={`ml-0.5 inline-block h-4 w-[2px] align-middle ${theme.solid}`}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>{phase === "done" ? `${words} words` : "\u00A0"}</span>
          <motion.button
            type="button"
            onClick={copy}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition-colors hover:bg-white ${theme.text}`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </motion.button>
        </div>
      </div>
    </ConsoleFrame>
  );
}

/* -------------------------------- Summary -------------------------------- */

function SummaryDemo({ data, theme }) {
  const [level, setLevel] = useState(1);
  const { phase, runId, run } = usePhase(700);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  const lv = data.levels[level];
  const countWords = (s) => s.trim().split(/\s+/).length;
  const srcWords = data.sentences.reduce((n, s) => n + countWords(s), 0);
  const sumWords = lv.bullets.reduce((n, s) => n + countWords(s), 0);
  const pct = Math.round((sumWords / srcWords) * 100);

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Source · {srcWords} words</p>
          <p className="max-h-[128px] overflow-hidden text-[12px] leading-relaxed">
            {data.sentences.map((s, i) => {
              const kept = lv.keep.includes(i);
              return (
                <span
                  key={i}
                  className={`rounded px-0.5 transition-all duration-500 ${
                    kept ? `${theme.soft} text-gray-800` : "text-gray-400"
                  }`}
                >
                  {s}{" "}
                </span>
              );
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Summary length" className="relative flex rounded-xl bg-white/80 p-1 shadow-sm">
            {data.levels.map((l, i) => (
              <button
                key={l.label}
                type="button"
                role="tab"
                aria-selected={level === i}
                onClick={() => {
                  setLevel(i);
                  run();
                }}
                className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  level === i ? "text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {level === i && (
                  <motion.span
                    layoutId="summary-seg"
                    className={`absolute inset-0 -z-10 rounded-lg bg-gradient-to-r ${theme.grad}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </button>
            ))}
          </div>
          <RunButton theme={theme} label="Summarize" onClick={run} disabled={phase === "loading"} />
        </div>

        <div className="min-h-[130px] rounded-2xl border border-white bg-white p-4 shadow-sm">
          {phase === "loading" && <Skeleton lines={3} />}
          {phase === "idle" && <p className="text-sm text-gray-400">Your summary will appear here.</p>}
          {phase === "done" && (
            <motion.ul key={`${level}-${runId}`} variants={STAGGER} initial="hidden" animate="show" className="space-y-2">
              {lv.bullets.map((b) => (
                <motion.li key={b} variants={POP} className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-700">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.solid}`} />
                  {b}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[10px] font-semibold text-gray-500">
            <span>
              {srcWords} words → {phase === "done" ? sumWords : "…"} words
            </span>
            <span>{phase === "done" ? `${100 - pct}% shorter` : ""}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${theme.grad}`}
              animate={{ width: phase === "done" ? `${pct}%` : "100%" }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>
      </div>
    </ConsoleFrame>
  );
}

/* --------------------------------- Image --------------------------------- */

function ImageDemo({ data, theme }) {
  const [prompt, setPrompt] = useState(0);
  const [style, setStyle] = useState(0);
  const [picked, setPicked] = useState(null);
  const { phase, runId, run } = usePhase(1100);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  const palette = data.styles[style].palette;
  const generate = () => {
    setPicked(null);
    run();
  };

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.prompts.map((p, i) => (
            <Chip
              key={p}
              active={prompt === i}
              onClick={() => {
                setPrompt(i);
                generate();
              }}
              theme={theme}
            >
              {p}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white bg-white/90 p-2.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Palette className={`h-3.5 w-3.5 ${theme.text}`} />
            {data.styles.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setStyle(i);
                  generate();
                }}
                aria-pressed={style === i}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                  style === i ? `${theme.soft} ${theme.text}` : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <RunButton theme={theme} label="Generate" onClick={generate} disabled={phase === "loading"} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-[4/3]">
              {phase === "loading" || phase === "idle" ? (
                <motion.div
                  className="h-full w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ) : (
                <motion.button
                  key={`${runId}-${i}`}
                  type="button"
                  onClick={() => setPicked(picked === i ? null : i)}
                  aria-pressed={picked === i}
                  initial={{ opacity: 0, scale: 0.7, filter: "blur(14px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
                  whileHover={{ scale: 1.06, y: -3, rotateZ: i % 2 ? 1.5 : -1.5, zIndex: 10 }}
                  className={`relative h-full w-full overflow-hidden rounded-xl border-2 shadow-md transition-colors ${
                    picked === i ? "border-white ring-2 ring-offset-2 " + theme.ring.replace("focus-visible:", "") : "border-white/80"
                  }`}
                >
                  <GenArt palette={palette} seed={prompt * 10 + style * 3 + i + 1} />
                  {picked === i && (
                    <span className={`absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold ${theme.text}`}>
                      Selected
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-500">
          {phase === "done" ? "4 variations · click one to select it" : "Creating variations…"}
        </p>
      </div>
    </ConsoleFrame>
  );
}

/* --------------------------------- Chart --------------------------------- */

function ChartDemo({ data, theme }) {
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState(null);
  const { phase, runId, run } = usePhase(700);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  const ds = data.datasets[sel];
  const W = 320;
  const H = 130;
  const padX = 12;
  const padY = 16;
  const vs = ds.values;
  const n = vs.length;
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const span = max - min || 1;
  const xs = vs.map((_, i) => padX + (i * (W - 2 * padX)) / (n - 1));
  const ys = vs.map((v) => H - padY - ((v - min) / span) * (H - 2 * padY));
  const line = smoothPath(xs, ys);
  const area = `${line} L${xs[n - 1]},${H} L${xs[0]},${H} Z`;

  const fmt = (v) => v.toFixed(ds.decimals);
  const avg = vs.reduce((a, b) => a + b, 0) / n;
  const change = ((vs[n - 1] - vs[0]) / vs[0]) * 100;
  const isGood = (change > 0 && ds.good === "up") || (change < 0 && ds.good === "down");
  const peakIdx = vs.indexOf(max);

  const answerOn = useDelayed(phase === "done", 1700, `${runId}-${sel}`);
  const answer = useTypewriter(ds.answer, answerOn, `${runId}-${sel}`, 14);

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.datasets.map((d, i) => (
            <Chip
              key={d.label}
              active={sel === i}
              onClick={() => {
                setSel(i);
                setHover(null);
                run();
              }}
              theme={theme}
            >
              {d.label}
            </Chip>
          ))}
        </div>

        <div className="rounded-2xl border border-white bg-white p-3 shadow-sm">
          {phase !== "done" ? (
            <div className="flex h-[150px] items-center">
              <div className="w-full">
                <Skeleton lines={3} />
              </div>
            </div>
          ) : (
            <div className="relative">
              <svg key={`${runId}-${sel}`} viewBox={`0 0 ${W} ${H}`} className="h-[130px] w-full overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id={`da-area-${sel}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={theme.c1} stopOpacity="0.32" />
                    <stop offset="1" stopColor={theme.c1} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`da-line-${sel}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor={theme.c1} />
                    <stop offset="1" stopColor={theme.c2} />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((g) => (
                  <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="3 4" />
                ))}
                <motion.path d={area} fill={`url(#da-area-${sel})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} />
                <motion.path
                  d={line}
                  fill="none"
                  stroke={`url(#da-line-${sel})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {xs.map((x, i) => (
                  <g key={i}>
                    <motion.circle
                      cx={x}
                      cy={ys[i]}
                      r={hover === i ? 5.5 : i === peakIdx ? 4.5 : 3.5}
                      fill="#fff"
                      stroke={theme.c1}
                      strokeWidth="2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.15, type: "spring" }}
                    />
                    <circle
                      cx={x}
                      cy={ys[i]}
                      r="12"
                      fill="transparent"
                      onPointerEnter={() => setHover(i)}
                      onPointerLeave={() => setHover(null)}
                    />
                  </g>
                ))}
              </svg>

              <div className="mt-1 flex justify-between px-1 text-[9px] text-gray-400">
                {ds.labels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>

              <AnimatePresence>
                {hover !== null && (
                  <div
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: `${(xs[hover] / W) * 100}%`, top: `${(ys[hover] / H) * 130}px` }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: -6, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.9 }}
                      className="whitespace-nowrap rounded-lg bg-[#0f1030] px-2 py-1 text-[10px] font-semibold text-white shadow-lg"
                    >
                      {ds.labels[hover]} · {fmt(vs[hover])}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Peak", value: phase === "done" ? fmt(max) : "…", note: ds.labels[peakIdx] },
            { label: "Average", value: phase === "done" ? fmt(avg) : "…", note: "all periods" },
            {
              label: "Change",
              value: phase === "done" ? `${change > 0 ? "+" : ""}${change.toFixed(0)}%` : "…",
              note: isGood ? "moving well" : "watch this",
              good: isGood,
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -4, rotateX: 10, scale: 1.05 }}
              style={{ transformPerspective: 600 }}
              className="rounded-xl border border-white bg-white/90 px-2.5 py-2 shadow-sm"
            >
              <p className="text-[10px] font-semibold text-gray-500">{s.label}</p>
              <p className={`text-base font-extrabold ${s.label === "Change" ? (s.good ? "text-emerald-600" : "text-rose-500") : "text-[#0f1030]"}`}>
                {s.value}
              </p>
              <p className="text-[9px] text-gray-400">{s.note}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
          <p className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.soft} ${theme.text}`}>
            <Search className="h-3 w-3" />
            {ds.question}
          </p>
          <p className="mt-2 min-h-[54px] text-[12px] leading-relaxed text-gray-600">
            {answer}
            {answerOn && answer.length < ds.answer.length && (
              <motion.span
                aria-hidden
                className={`ml-0.5 inline-block h-3 w-[2px] align-middle ${theme.solid}`}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>
        </div>
      </div>
    </ConsoleFrame>
  );
}

/* --------------------------------- Code ---------------------------------- */

function Highlight({ line }) {
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|\b(const|let|var|function|return|if|else|for|new|await|async|import|from|export|throw|try|catch)\b|(\b\d+(?:\.\d+)?\b)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "text-slate-500 italic" : m[2] ? "text-amber-300" : m[3] ? "text-fuchsia-300" : "text-sky-300";
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return <>{out}</>;
}

function CodeDemo({ data, theme }) {
  const [tab, setTab] = useState(0);
  const { phase, runId, run } = usePhase(800);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  const t = data.tabs[tab];
  const typedPrompt = useTypewriter(t.prompt, true, `${tab}-${runId}`, 22);

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {data.tabs.map((tb, i) => (
              <Chip
                key={tb.label}
                active={tab === i}
                onClick={() => {
                  setTab(i);
                  run();
                }}
                theme={theme}
              >
                {tb.label}
              </Chip>
            ))}
          </div>
          <RunButton theme={theme} label="Run" onClick={run} disabled={phase === "loading"} />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/90 px-3 py-2.5 shadow-sm">
          <Terminal className={`h-3.5 w-3.5 shrink-0 ${theme.text}`} />
          <p className="text-[12px] text-gray-600">
            {typedPrompt}
            <motion.span
              aria-hidden
              className={`ml-0.5 inline-block h-3 w-[2px] align-middle ${theme.solid}`}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          </p>
        </div>

        <div className="min-h-[190px] overflow-hidden rounded-2xl bg-[#0d1424] p-3 font-mono text-[11.5px] leading-6 shadow-inner">
          {phase === "done" ? (
            <motion.div key={`${tab}-${runId}`} variants={STAGGER} initial="hidden" animate="show">
              {t.lines.map((raw, i) => {
                const mark = raw.startsWith("+ ") ? "+" : raw.startsWith("- ") ? "-" : " ";
                const body = raw.startsWith("+ ") || raw.startsWith("- ") || raw.startsWith("  ") ? raw.slice(2) : raw;
                return (
                  <motion.div
                    key={i}
                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}
                    className={`flex whitespace-pre rounded ${
                      mark === "+" ? "bg-emerald-400/15" : mark === "-" ? "bg-rose-400/15" : ""
                    }`}
                  >
                    <span className="w-6 shrink-0 select-none pr-2 text-right text-slate-600">{i + 1}</span>
                    <span
                      className={`w-4 shrink-0 select-none ${
                        mark === "+" ? "text-emerald-300" : mark === "-" ? "text-rose-300" : "text-transparent"
                      }`}
                    >
                      {mark}
                    </span>
                    <span className="text-slate-200">
                      <Highlight line={body} />
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="space-y-2 pt-1">
              {[70, 92, 55, 80, 40].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-2.5 rounded-full bg-slate-700"
                  style={{ width: `${w}%` }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          )}
        </div>

        {phase === "done" && (
          <motion.ul key={`n-${tab}-${runId}`} variants={STAGGER} initial="hidden" animate="show" className="space-y-1.5">
            {t.notes.map((note) => (
              <motion.li key={note} variants={POP} className="flex items-start gap-2 text-[12px] leading-snug text-gray-600">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${theme.solid}`}>
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {note}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </ConsoleFrame>
  );
}

function Demo({ tool, theme }) {
  const p = tool.playground;
  if (p.kind === "text") return <TextDemo data={p} theme={theme} />;
  if (p.kind === "summary") return <SummaryDemo data={p} theme={theme} />;
  if (p.kind === "image") return <ImageDemo data={p} theme={theme} />;
  if (p.kind === "chart") return <ChartDemo data={p} theme={theme} />;
  return <CodeDemo data={p} theme={theme} />;
}

/* ====================================================================== */
/* Hero                                                                    */
/* ====================================================================== */

function Hero({ tool, theme, mx, my }) {
  const Icon = ICONS[tool.icon];
  const rotateY = useTransform(mx, [-1, 1], [-6, 6]);
  const rotateX = useTransform(my, [-1, 1], [4, -4]);

  return (
    <header className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-16 pt-32 md:px-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:px-20 lg:pt-36">
        <div>
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          >
            <Link href="/" className="flex items-center gap-1 transition-colors hover:text-gray-900">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>AI Tools</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span aria-current="page" className="font-medium text-gray-900">
              {tool.name}
            </span>
          </motion.nav>

          <div className="mt-8 flex items-center gap-3">
            <motion.span
              initial={{ opacity: 0, scale: 0.6, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ rotateY: 180, scale: 1.12 }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ transformPerspective: 500 }}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${theme.grad} ${theme.shadow}`}
            >
              <Icon className="h-7 w-7" />
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className={`relative overflow-hidden rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md ${theme.text}`}
            >
              {tool.badge}
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
                animate={{ x: ["-150%", "450%"] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
              />
            </motion.span>
          </div>

          <div style={{ perspective: 1000 }}>
            <Heading3D
              as="h1"
              eager
              tokens={tool.heading}
              gradClass={theme.gradText}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0f1030] sm:text-5xl lg:text-6xl"
            />
          </div>

          <Reveal3D as="p" delay={0.8} className="mt-6 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg">
            {tool.sub}
          </Reveal3D>

          <Reveal3D delay={0.95} className="mt-8 flex flex-wrap items-center gap-4">
            <Magnetic>
              <motion.a
                href="#try"
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r px-7 py-3.5 text-sm font-semibold text-white transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.grad} ${theme.shadow} ${theme.shadowHover} ${theme.ring}`}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ["-150%", "450%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
                />
                <span className="relative">{tool.cta}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </motion.a>
            </Magnetic>
            <Magnetic>
              <motion.a
                href="#how"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#0f1030] shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring}`}
              >
                See how it works
              </motion.a>
            </Magnetic>
          </Reveal3D>

          <ul className="mt-9 flex flex-wrap gap-2.5" style={{ perspective: 800 }}>
            {tool.chips.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, y: 18, rotateX: -50 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 1.1 + i * 0.08, ease: EASE }}
                whileHover={{ y: -5, scale: 1.08, rotateX: 12 }}
                className="cursor-default rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur-md transition-shadow hover:shadow-lg"
              >
                {c}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* interactive demo, floating in 3D */}
        <div id="try" className="relative scroll-mt-28" style={{ perspective: 1400 }}>
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative mx-auto max-w-[560px]">
            <Demo tool={tool} theme={theme} />
          </motion.div>

          {tool.floaters.map((f, i) => {
            const FIcon = ICONS[f.icon];
            const pos = ["-left-4 top-[6%]", "-right-3 top-[40%]", "left-2 -bottom-5"][i];
            const depth = [34, -30, 26][i];
            return (
              <ParallaxLayer key={f.label} mx={mx} my={my} depth={depth} className={`absolute z-20 hidden md:block ${pos}`}>
                <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}>
                  <Tilt
                    max={12}
                    lift={6}
                    scale={1.08}
                    glare
                    outerProps={{
                      initial: { opacity: 0, scale: 0.7, y: 24, rotateX: -30, transformPerspective: 900 },
                      animate: { opacity: 1, scale: 1, y: 0, rotateX: 0 },
                      transition: { duration: 0.8, delay: 1 + i * 0.15, ease: EASE },
                    }}
                    cardClassName="group flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/85 px-3.5 py-2.5 shadow-[0_14px_40px_-12px_rgba(79,70,229,0.35)] backdrop-blur-md transition-shadow hover:shadow-[0_28px_60px_-12px_rgba(79,70,229,0.55)]"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] bg-gradient-to-br ${theme.grad}`}
                    >
                      <FIcon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-[#0f1030]">{f.label}</span>
                  </Tilt>
                </motion.div>
              </ParallaxLayer>
            );
          })}
        </div>
      </div>
    </header>
  );
}

/* ====================================================================== */
/* Scrolling 3D text band                                                  */
/* ====================================================================== */

function MarqueeRow({ items, reverse = false, outline = false, accent }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden py-1">
      <motion.div
        className="flex w-max"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 26 + items.length * 3, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((text, i) => (
          <span
            key={i}
            className={`mr-10 inline-flex select-none items-center gap-10 whitespace-nowrap text-5xl font-extrabold tracking-tight transition-colors duration-300 md:text-7xl ${
              outline ? "text-transparent hover:text-gray-900" : "text-[#0f1030]"
            }`}
            style={
              outline
                ? { WebkitTextStroke: "1.5px #0f1030" }
                : { textShadow: "2px 2px 0 #dcd8f2, 4px 4px 0 #dcd8f2, 6px 6px 14px rgba(80,70,180,0.2)" }
            }
          >
            {text}
            <span className={accent} style={{ WebkitTextStroke: 0 }}>
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Band({ tool, theme }) {
  const rest = [...tool.band].reverse();
  return (
    <div aria-hidden className="relative overflow-hidden py-8 md:py-12" style={{ perspective: 1000 }}>
      <div
        className="space-y-2 md:space-y-4"
        style={{ transform: "rotateX(14deg) rotateZ(-1.5deg)", transformStyle: "preserve-3d" }}
      >
        <MarqueeRow items={tool.band} outline accent={theme.text} />
        <MarqueeRow items={rest} reverse accent={theme.text} />
      </div>
    </div>
  );
}

/* ====================================================================== */
/* How it works                                                            */
/* ====================================================================== */

function StepVisual({ index, theme }) {
  if (index === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
        <span className={`h-2 w-2 rounded-full ${theme.solid}`} />
        <motion.span
          className="h-2 rounded-full bg-gray-200"
          animate={{ width: ["10%", "70%", "70%", "10%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className={`h-4 w-[2px] ${theme.solid}`}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
        <div className="mb-2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${theme.solid}`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${theme.grad}`}
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
      <motion.span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${theme.solid}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </motion.span>
      <span className="text-xs font-semibold text-gray-600">Ready to use</span>
    </div>
  );
}

function HowItWorks({ tool, theme }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const [active, setActive] = useState(0);
  const n = tool.steps.length;

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999))));
    });
    return unsub;
  }, [scrollYProgress, n]);

  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead
        title="How it works"
        sub={`Three simple steps from idea to finished result with ${tool.name}.`}
      />

      <div ref={ref} className="relative mt-16" style={{ perspective: 1400 }}>
        <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-0.5 bg-gray-200 md:block">
          <motion.div
            className={`h-full origin-left bg-gradient-to-r ${theme.grad}`}
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        <ol className="grid gap-8 md:grid-cols-3">
          {tool.steps.map((step, i) => {
            const SIcon = ICONS[step.icon];
            const lit = i <= active;
            return (
              <li key={step.title} className="relative flex flex-col items-center">
                <motion.span
                  animate={{ scale: lit ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-extrabold transition-colors duration-500 ${
                    lit
                      ? `border-transparent bg-gradient-to-br text-white ${theme.grad} ${theme.shadow}`
                      : "border-gray-300 bg-[#faf9ff] text-gray-400"
                  }`}
                >
                  {i + 1}
                </motion.span>

                <GlassCard
                  className="mt-6 w-full"
                  delay={i * 0.12}
                  max={8}
                  lift={10}
                  glow={theme.blob}
                  cardClassName="p-6 text-center"
                >
                  <div className="relative flex justify-center" style={{ transform: "translateZ(40px)" }}>
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-700 group-hover:text-white group-hover:[transform:perspective(300px)_rotateY(360deg)] group-hover:bg-gradient-to-br ${theme.soft} ${theme.text} group-hover:${theme.grad}`}
                    >
                      <SIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <h3 className="relative mt-4 text-lg font-bold text-[#0f1030]" style={{ transform: "translateZ(28px)" }}>
                    {step.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-gray-500" style={{ transform: "translateZ(18px)" }}>
                    {step.text}
                  </p>
                  <div className="relative mt-5 text-left" style={{ transform: "translateZ(24px)" }}>
                    <StepVisual index={i} theme={theme} />
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Capabilities: auto-rotating tabs                                        */
/* ====================================================================== */

const ROTATE_MS = 5200;

function Capabilities({ tool, theme }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const caps = tool.capabilities;

  useEffect(() => {
    if (paused || !inView) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % caps.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [paused, inView, idx, caps.length]);

  const cap = caps[idx];
  const CapIcon = ICONS[cap.icon];

  return (
    <section id="capabilities" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead
        title="Everything it can do"
        sub="Pick a capability to see what it looks like in practice."
      />

      <div
        ref={ref}
        className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"
        style={{ perspective: 1600 }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div role="tablist" aria-label="Capabilities" className="space-y-2.5">
          {caps.map((c, i) => {
            const TabIcon = ICONS[c.icon];
            const on = i === idx;
            return (
              <motion.button
                key={c.title}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setIdx(i)}
                initial={{ opacity: 0, x: -30, rotateY: -30 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                whileHover={{ x: 8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 ${theme.ring} ${
                  on ? "border-white bg-white shadow-xl" : "border-white/60 bg-white/50 hover:bg-white/80"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                    on ? `bg-gradient-to-br text-white ${theme.grad}` : `${theme.soft} ${theme.text}`
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                </span>
                <span className={`text-sm font-bold ${on ? "text-[#0f1030]" : "text-gray-600"}`}>{c.title}</span>
                {on && (
                  <motion.span
                    key={`${idx}-${paused}`}
                    aria-hidden
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${theme.grad}`}
                    initial={{ width: paused ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="relative min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              role="tabpanel"
              initial={{ opacity: 0, rotateY: -22, x: 50 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 22, x: -50 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformPerspective: 1400 }}
              className="h-full"
            >
              <div className="relative h-full overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-[0_30px_80px_-24px_rgba(99,102,241,0.4)] backdrop-blur-xl md:p-9">
                <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${theme.blob}`} />
                <SpinRing
                  size={150}
                  colors={[theme.c1, theme.c2]}
                  duration={12}
                  className="absolute -right-6 -top-6 opacity-70"
                />

                <div className="relative">
                  <motion.span
                    whileHover={{ rotateY: 180, scale: 1.1 }}
                    style={{ transformPerspective: 500 }}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${theme.grad} ${theme.shadow}`}
                  >
                    <CapIcon className="h-8 w-8" />
                  </motion.span>
                  <h3 className="mt-5 text-2xl font-extrabold text-[#0f1030]">{cap.title}</h3>
                  <p className="mt-2 max-w-md text-base leading-relaxed text-gray-600">{cap.text}</p>

                  <motion.ul variants={STAGGER} initial="hidden" animate="show" className="mt-6 grid gap-3 sm:grid-cols-1">
                    {cap.points.map((pt) => (
                      <motion.li
                        key={pt}
                        variants={POP}
                        whileHover={{ x: 8, scale: 1.02 }}
                        className="flex cursor-default items-center gap-3 rounded-xl border border-white bg-white/80 px-4 py-3 shadow-sm"
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${theme.solid}`}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="text-sm font-semibold text-gray-700">{pt}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================== */
/* Use cases: flip cards                                                   */
/* ====================================================================== */

function FlipCard({ item, theme, index }) {
  const [flipped, setFlipped] = useState(false);
  const UIcon = ICONS[item.icon];
  const face = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

  return (
    <motion.li
      initial={{ opacity: 0, y: 50, rotateX: -24, transformPerspective: 1000 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE }}
      className="h-52"
      style={{ perspective: 1000 }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${item.title}. Flip to read more.`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
        onPointerUp={(e) => e.pointerType !== "mouse" && setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className={`h-full w-full cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 ${theme.ring}`}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div
            style={face}
            className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.3)] backdrop-blur-xl"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.soft} ${theme.text}`}>
              <UIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#0f1030]">{item.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-400">
                Hover or tap to flip <RefreshCw className="h-3 w-3" />
              </p>
            </div>
          </div>

          <div
            style={{ ...face, transform: "rotateY(180deg)" }}
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white ${theme.grad} ${theme.shadow}`}
          >
            <SpinRing size={120} colors={["#ffffff", "#ffffff"]} duration={10} className="absolute -right-8 -top-8 opacity-40" />
            <p className="relative text-[15px] font-semibold leading-relaxed">{item.text}</p>
            <a
              href="#try"
              className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#0f1030] shadow-md transition-transform hover:scale-105"
            >
              Try it <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.li>
  );
}

function UseCases({ tool, theme }) {
  return (
    <section id="use-cases" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead
        title="Built for how you work"
        sub={`See how different people use ${tool.name}. Flip a card to read more.`}
      />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tool.useCases.map((item, i) => (
          <FlipCard key={item.title} item={item} theme={theme} index={i} />
        ))}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/* Before / after slider                                                   */
/* ====================================================================== */

function Compare({ tool, theme }) {
  const c = tool.compare;
  const boxRef = useRef(null);
  const pos = useMotionValue(50);
  const rest = useTransform(pos, (v) => 100 - v);
  const clip = useMotionTemplate`inset(0 ${rest}% 0 0)`;
  const handleLeft = useTransform(pos, (v) => `${v}%`);
  const [aria, setAria] = useState(50);
  const dragging = useRef(false);
  const touched = useRef(false);
  const inView = useInView(boxRef, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();

  useEffect(() => pos.on("change", (v) => setAria(Math.round(v))), [pos]);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(pos, [50, 18, 82, 50], { duration: 3.2, ease: "easeInOut" });
    return () => controls.stop();
  }, [inView, reduce, pos]);

  const setFrom = (clientX) => {
    const r = boxRef.current.getBoundingClientRect();
    pos.set(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };

  const textCls = c.mono ? "whitespace-pre-wrap font-mono text-[13px]" : "text-base md:text-lg";

  return (
    <section id="compare" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24">
      <SectionHead
        title="See the difference"
        sub="Drag the handle to compare the starting point with the result."
      />

      <Reveal3D delay={0.2} className="mt-12" >
        <div style={{ perspective: 1400 }}>
          <motion.div
            ref={boxRef}
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={aria}
            onPointerDown={(e) => {
              dragging.current = true;
              touched.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              setFrom(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && setFrom(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") pos.set(Math.max(4, pos.get() - 6));
              if (e.key === "ArrowRight") pos.set(Math.min(96, pos.get() + 6));
            }}
            whileHover={{ rotateX: 2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformPerspective: 1400, touchAction: "pan-y" }}
            className={`relative h-80 cursor-ew-resize select-none overflow-hidden rounded-[28px] border border-white/80 shadow-[0_40px_90px_-30px_rgba(${theme.rgb},0.55)] focus-visible:outline-none focus-visible:ring-2 md:h-96 ${theme.ring}`}
          >
            {/* AFTER (full layer) */}
            <div className={`absolute inset-0 p-7 md:p-10 ${theme.tint}`}>
              {c.art && (
                <div className="absolute inset-0">
                  <GenArt palette={c.art.palette} seed={c.art.seed} />
                </div>
              )}
              <span className={`absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-bold ${c.art ? "bg-white/90" : "bg-white"} ${theme.text}`}>
                {c.afterLabel}
              </span>
              <p className={`relative mt-10 max-w-md ${textCls} ${c.art ? "rounded-2xl bg-white/85 p-4 font-semibold text-[#0f1030]" : "text-[#0f1030]"}`}>
                {c.after}
              </p>
            </div>

            {/* BEFORE (clipped) */}
            <motion.div className="absolute inset-0 bg-gray-100 p-7 md:p-10" style={{ clipPath: clip, WebkitClipPath: clip }}>
              <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-500">
                {c.beforeLabel}
              </span>
              <p className={`mt-10 max-w-md text-gray-500 ${textCls}`}>{c.before}</p>
            </motion.div>

            {/* handle */}
            <motion.div style={{ left: handleLeft }} className="absolute inset-y-0 z-10 w-0">
              <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.25)]" />
              <motion.span
                whileHover={{ scale: 1.15 }}
                animate={{ boxShadow: [`0 0 0 0 rgba(${theme.rgb},0.5)`, `0 0 0 14px rgba(${theme.rgb},0)`] }}
                transition={{ boxShadow: { duration: 1.6, repeat: Infinity } }}
                className={`absolute left-0 top-1/2 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white ${theme.grad}`}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </Reveal3D>
    </section>
  );
}

/* ====================================================================== */
/* Other tools                                                             */
/* ====================================================================== */

function OtherTools({ tool }) {
  const others = TOOL_LIST.filter((t) => t.slug !== tool.slug);
  return (
    <section id="other-tools" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead title="More AI tools" sub="Every tool works on its own, and they work even better together." />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1600 }}>
        {others.map((t, i) => {
          const th = THEMES[t.theme];
          const TIcon = ICONS[t.icon];
          return (
            <Tilt
              key={t.slug}
              as="li"
              max={10}
              lift={10}
              scale={1.04}
              glare
              outerProps={enter(i * 0.08)}
              className="h-full"
            >
              <Link
                href={`/ai-tools/${t.slug}`}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.3)] backdrop-blur-xl transition-shadow duration-500 [transform-style:preserve-3d] hover:shadow-[0_40px_90px_-24px_rgba(99,102,241,0.5)] focus-visible:outline-none focus-visible:ring-2 ${th.ring}`}
              >
                <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 ${th.blob}`} />
                <span
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${th.grad}`}
                  style={{ transform: "translateZ(40px)" }}
                >
                  <TIcon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold text-[#0f1030]" style={{ transform: "translateZ(28px)" }}>
                  {t.name}
                </h3>
                <p className="relative mt-1.5 text-sm text-gray-500" style={{ transform: "translateZ(16px)" }}>
                  {t.tagline}
                </p>
                <span className={`relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-3 ${th.text}`}>
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Tilt>
          );
        })}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/* Final call to action + footnote                                         */
/* ====================================================================== */

function FinalCta({ tool, theme }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:px-14 md:py-24">
      <Tilt max={4} lift={6} scale={1.01} glare outerProps={enter(0)} cardClassName="group">
        <div
          className={`absolute inset-0 overflow-hidden rounded-[34px] bg-gradient-to-br ${theme.grad}`}
          style={{ boxShadow: `0 40px 100px -30px rgba(${theme.rgb},0.7)` }}
          aria-hidden
        >
          <motion.div
            className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/25 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative grid items-center gap-8 p-9 text-white md:grid-cols-[1.3fr_0.7fr] md:p-14">
          <div style={{ transform: "translateZ(40px)" }}>
            <h2
              className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.12), 2px 2px 0 rgba(0,0,0,0.1), 4px 4px 12px rgba(0,0,0,0.2)" }}
            >
              {tool.finalTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">{tool.finalText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Magnetic>
                <motion.a
                  href="#try"
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0f1030] shadow-xl transition-shadow hover:shadow-2xl"
                >
                  {tool.cta}
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
              </Magnetic>
              <Magnetic>
                <motion.a
                  href="#other-tools"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  See other tools
                </motion.a>
              </Magnetic>
            </div>
          </div>

          <div className="relative mx-auto hidden h-44 w-44 md:block" style={{ transform: "translateZ(60px)" }} aria-hidden>
            <motion.div
              className="absolute inset-[14%] rounded-full"
              style={{
                background: "radial-gradient(circle at 32% 28%, #ffffff 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.25) 70%)",
                boxShadow: "inset -14px -18px 30px rgba(0,0,0,0.15), 0 24px 50px rgba(0,0,0,0.2)",
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <SpinRing size={176} thickness={4} colors={["#ffffff", "#ffffff"]} duration={10} tilt={70} className="absolute left-0 top-0" />
          </div>
        </div>
      </Tilt>
    </section>
  );
}

function Footnote({ tool }) {
  return (
    <Reveal3D className="flex flex-col items-center gap-2 pb-16 text-sm text-gray-500">
      <span>Built with the {tool.name} engine.</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-indigo-500"
      >
        <ChevronDown className="h-4 w-4" />
      </motion.span>
    </Reveal3D>
  );
}

/* ====================================================================== */
/* Page                                                                    */
/* ====================================================================== */

export default function AIToolPage({ slug }) {
  const tool = TOOLS[slug];
  const theme = THEMES[tool?.theme] || THEMES.violet;

  const rootRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  if (!tool) return null;

  return (
    <MotionConfig reducedMotion="user">
      <main
        ref={rootRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-x-clip bg-[#faf9ff]"
      >
        <Background theme={theme} mx={mx} my={my} />

        <div className="relative z-10">
          <Hero tool={tool} theme={theme} mx={mx} my={my} />
          <Band tool={tool} theme={theme} />
          <HowItWorks tool={tool} theme={theme} />
          <Capabilities tool={tool} theme={theme} />
          <UseCases tool={tool} theme={theme} />
          <Compare tool={tool} theme={theme} />
          <OtherTools tool={tool} />
          <FinalCta tool={tool} theme={theme} />
          <Footnote tool={tool} />
        </div>
      </main>
    </MotionConfig>
  );
}