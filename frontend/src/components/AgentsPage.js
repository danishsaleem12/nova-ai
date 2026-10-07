"use client";

/**
 * Agent page (ONE component for every /agents/[slug] page).
 *
 * Same layout system as AIToolPage.js: shared 3D/glassy chrome, each agent
 * only supplies data. To add an agent, add an entry to AGENTS below (and
 * its slug in app/agents/[slug]/page.js).
 *
 * This page renders the page body only (no Navbar/Footer). Wrap it the same
 * way you wrapped AIToolPage. Every agent has an interactive demo in the
 * hero; the demo content, numbers and copy below are sample text you can
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
  Puzzle,
  RefreshCw,
  Scissors,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Timer,
  TrendingUp,
  Users,
  Workflow,
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
  gear: Settings2,
  workflow: Workflow,
  puzzle: Puzzle,
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
/* DATA: one entry per agent (edit me)                                     */
/* ====================================================================== */

const AGENTS = {
  /* ---------------------------- Research Agent ---------------------------- */
  "research-agent": {
    slug: "research-agent",
    name: "Research Agent",
    tagline: "Deep research on demand",
    icon: "file",
    theme: "sky",
    badge: "Autonomous research",
    heading: [
      { text: "Research" },
      { text: "that" },
      { br: true },
      { text: "digs deeper, on its own.", gradient: true },
    ],
    sub: "Give it a question and a goal. It searches, reads, cross-checks sources, and hands you a structured report — no tab-hopping required.",
    cta: "Try Research Agent",
    chips: ["Market research", "Competitor analysis", "Literature review", "Due diligence"],
    floaters: [
      { icon: "search", label: "40+ sources scanned" },
      { icon: "shield", label: "Cross-checked facts" },
      { icon: "file", label: "Structured report" },
    ],
    playground: {
      kind: "agent",
      title: "Research console",
      task: "Research the top 3 competitors in the meal-kit delivery space",
      steps: [
        { label: "Understanding the request", detail: "Breaking the goal into research questions" },
        { label: "Searching the web", detail: "Scanning news, reviews, and company sites" },
        { label: "Reading & extracting", detail: "Pulling pricing, positioning, and reviews" },
        { label: "Cross-checking facts", detail: "Comparing sources for consistency" },
        { label: "Writing the report", detail: "Structuring findings into sections" },
      ],
      output:
        "Three players lead the category. HelloFresh leans on variety and brand recognition, Blue Apron competes on chef-designed recipes, and Home Chef wins on price and grocery-store pickup. All three are pushing lower-prep meals as the next growth area.",
    },
    band: ["Market research", "Competitor analysis", "Literature review", "Due diligence", "Trend reports", "Survey synthesis", "Fact-checking", "Source tracking"],
    steps: [
      { icon: "target", title: "Set the goal", text: "Describe what you want to know and why. The agent turns it into a research plan." },
      { icon: "search", title: "It searches and reads", text: "The agent browses sources, extracts key facts, and checks them against each other." },
      { icon: "file", title: "Get a structured report", text: "Review a clear summary with sources, then ask follow-up questions anytime." },
    ],
    capabilities: [
      { icon: "search", title: "Multi-source search", text: "Searches across the web, not just one engine's top results.", points: ["Scans dozens of sources", "Prioritizes credible sites", "Skips low-quality pages"] },
      { icon: "shield", title: "Fact cross-checking", text: "Flags claims that don't agree across sources instead of guessing.", points: ["Compares multiple sources", "Flags conflicting claims", "Notes source dates"] },
      { icon: "file", title: "Structured reports", text: "Turns messy findings into a report you can actually use.", points: ["Clear sections and headings", "Sources cited inline", "Exportable summary"] },
      { icon: "clock", title: "Saves hours", text: "Does the tab-hopping and skimming for you.", points: ["Runs while you work on other things", "No manual note-taking", "Ready in minutes, not hours"] },
      { icon: "bulb", title: "Follow-up questions", text: "Keeps context so you can dig deeper without repeating yourself.", points: ["Remembers the research so far", "Answers follow-ups directly", "Expands any section on request"] },
    ],
    useCases: [
      { icon: "target", title: "Founders", text: "Size up a market before committing to it." },
      { icon: "trending", title: "Investors", text: "Get a first pass on a company before a call." },
      { icon: "megaphone", title: "Marketers", text: "Understand competitors' positioning fast." },
      { icon: "book", title: "Students & analysts", text: "Pull together a literature review in one sitting." },
      { icon: "shield", title: "Legal & compliance", text: "Gather background facts before deeper review." },
      { icon: "users", title: "Product teams", text: "Learn what users are already saying online." },
    ],
    compare: {
      beforeLabel: "20 open tabs",
      afterLabel: "One clear report",
      before: "hellofresh pricing reddit review... blue apron vs home chef... meal kit market size 2026... chef'd cancelled...",
      after: "A three-page report comparing pricing, positioning, and growth strategy across the top three meal-kit competitors, with sources linked.",
    },
    finalTitle: "Ready to skip the tab-hopping?",
    finalText: "Give it a question, and get a sourced report back.",
  },

  /* ----------------------------- Coding Agent ----------------------------- */
  "coding-agent": {
    slug: "coding-agent",
    name: "Coding Agent",
    tagline: "Builds and debugs for you",
    icon: "gear",
    theme: "violet",
    badge: "Autonomous coding",
    heading: [
      { text: "Ship" },
      { text: "features," },
      { br: true },
      { text: "not just snippets.", gradient: true },
    ],
    sub: "Describe the feature or bug. The agent reads your codebase, makes the change, runs tests, and explains what it did.",
    cta: "Try Coding Agent",
    chips: ["Build features", "Fix bugs", "Write tests", "Refactor"],
    floaters: [
      { icon: "terminal", label: "Reads your repo" },
      { icon: "bug", label: "Finds root causes" },
      { icon: "check", label: "Runs tests itself" },
    ],
    playground: {
      kind: "code",
      title: "Coding agent console",
      tabs: [
        {
          label: "Build",
          prompt: "Add a debounced search input to the products page",
          lines: [
            "function useDebouncedSearch(delay = 300) {",
            "  const [query, setQuery] = useState(\"\");",
            "  const [debounced, setDebounced] = useState(\"\");",
            "",
            "  useEffect(() => {",
            "    const t = setTimeout(() => setDebounced(query), delay);",
            "    return () => clearTimeout(t);",
            "  }, [query, delay]);",
            "",
            "  return [query, setQuery, debounced];",
            "}",
          ],
          notes: [
            "Added a reusable debounced-search hook",
            "Wired it into the products page input",
            "Waits 300ms after typing stops before searching",
          ],
        },
        {
          label: "Debug",
          prompt: "Fix: cart total is wrong when a coupon is applied",
          lines: [
            "  function getCartTotal(items, coupon) {",
            "-   const total = items.reduce((s, i) => s + i.price, 0);",
            "-   return coupon ? total - coupon.amount : total;",
            "+   const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);",
            "+   const discount = coupon ? subtotal * coupon.percentOff : 0;",
            "+   return Math.max(0, subtotal - discount);",
            "  }",
          ],
          notes: [
            "Bug: quantity wasn't factored into the subtotal",
            "Coupon was treated as a flat amount instead of a percentage",
            "Total is now clamped so it never goes negative",
          ],
        },
        {
          label: "Test",
          prompt: "Add tests for the checkout discount logic",
          lines: [
            "test(\"applies percentage discount correctly\", () => {",
            "  const items = [{ price: 20, qty: 2 }];",
            "  const coupon = { percentOff: 0.1 };",
            "  expect(getCartTotal(items, coupon)).toBe(36);",
            "});",
            "",
            "test(\"never returns a negative total\", () => {",
            "  const items = [{ price: 5, qty: 1 }];",
            "  const coupon = { percentOff: 2 };",
            "  expect(getCartTotal(items, coupon)).toBe(0);",
            "});",
          ],
          notes: [
            "Covers the normal discount path",
            "Covers the edge case that caused the original bug",
            "Both tests pass against the fixed function",
          ],
        },
      ],
    },
    band: ["Build features", "Fix bugs", "Write tests", "Refactor", "Review PRs", "Migrate code", "Document", "Optimize"],
    steps: [
      { icon: "terminal", title: "Describe the task", text: "Tell it what to build or what's broken, in plain language." },
      { icon: "search", title: "It reads and plans", text: "The agent scans the relevant files and works out a plan before touching code." },
      { icon: "check", title: "Review and merge", text: "See a clear diff and explanation, then merge it or ask for changes." },
    ],
    capabilities: [
      { icon: "code", title: "Full-feature builds", text: "Goes beyond a single function to wire up a whole feature.", points: ["Touches multiple files", "Follows your existing patterns", "Explains each change"] },
      { icon: "bug", title: "Root-cause debugging", text: "Traces a bug back to its source instead of patching symptoms.", points: ["Reproduces the issue first", "Explains why it happened", "Suggests a regression test"] },
      { icon: "check", title: "Self-testing", text: "Writes and runs tests before handing work back to you.", points: ["Unit tests for new logic", "Runs the existing suite", "Flags anything it couldn't verify"] },
      { icon: "refresh", title: "Safe refactors", text: "Cleans up code while keeping behavior identical.", points: ["Small, reviewable diffs", "No unrelated changes", "Keeps your style conventions"] },
      { icon: "book", title: "Plain-English diffs", text: "Every change comes with a summary of what and why.", points: ["Line-by-line reasoning", "Flags risky changes", "Easy to review quickly"] },
    ],
    useCases: [
      { icon: "layers", title: "Startups", text: "Ship features without waiting on every PR." },
      { icon: "bug", title: "Engineering teams", text: "Clear the bug backlog faster." },
      { icon: "refresh", title: "Legacy codebases", text: "Refactor old code in small, safe steps." },
      { icon: "check", title: "QA teams", text: "Get test coverage for logic that has none." },
      { icon: "book", title: "New hires", text: "Understand unfamiliar parts of the codebase quickly." },
      { icon: "users", title: "Open-source maintainers", text: "Triage and fix issues from the backlog." },
    ],
    compare: {
      beforeLabel: "Bug report",
      afterLabel: "Fixed & tested",
      before: "\"Cart total is wrong when I apply a coupon — seems to ignore quantity.\"",
      after: "Root cause found: quantity wasn't included in the subtotal. Fixed, with two new tests covering the discount and the negative-total edge case.",
    },
    finalTitle: "Ready to clear your backlog?",
    finalText: "Describe the feature or bug, and review a ready diff.",
  },

  /* ---------------------------- Marketing Agent ---------------------------- */
  "marketing-agent": {
    slug: "marketing-agent",
    name: "Marketing Agent",
    tagline: "Campaigns on autopilot",
    icon: "megaphone",
    theme: "fuchsia",
    badge: "Autonomous marketing",
    heading: [
      { text: "Campaigns" },
      { text: "that" },
      { br: true },
      { text: "run themselves.", gradient: true },
    ],
    sub: "Set a goal and a budget. The agent drafts the campaign, launches it, and keeps optimizing based on what's actually working.",
    cta: "Try Marketing Agent",
    chips: ["Ad campaigns", "Email sequences", "A/B testing", "Performance reports"],
    floaters: [
      { icon: "trending", label: "Auto-optimizes spend" },
      { icon: "megaphone", label: "Drafts the copy" },
      { icon: "chart", label: "Reports in plain English" },
    ],
    playground: {
      kind: "chart",
      title: "Campaign dashboard",
      datasets: [
        {
          label: "Click-through rate (%)",
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          values: [1.8, 2.0, 2.1, 2.6, 3.4, 3.2, 3.9, 4.3],
          decimals: 1,
          good: "up",
          question: "Why did CTR jump in week 5?",
          answer: "Week 5 is when the agent swapped in a new headline variant. CTR rose 31% and held steady afterward.",
        },
        {
          label: "Cost per lead ($)",
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          values: [18.4, 17.9, 17.2, 15.8, 13.1, 12.4, 11.0, 9.8],
          decimals: 1,
          good: "down",
          question: "Is cost per lead improving?",
          answer: "Yes — cost per lead fell from $18.40 to $9.80 as the agent shifted budget toward the best-performing ad sets.",
        },
        {
          label: "Conversions",
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          values: [22, 26, 24, 35, 48, 44, 57, 63],
          decimals: 0,
          good: "up",
          question: "Which week converted best?",
          answer: "Week 8 converted best at 63, roughly triple week 1, after the agent narrowed targeting to the top two audiences.",
        },
      ],
    },
    band: ["Ad campaigns", "Email sequences", "A/B testing", "Performance reports", "Landing pages", "Audience targeting", "Budget pacing", "Creative variants"],
    steps: [
      { icon: "target", title: "Set the goal & budget", text: "Tell it what you're promoting and what success looks like." },
      { icon: "pen", title: "It drafts and launches", text: "The agent writes the copy, sets up the campaign, and goes live." },
      { icon: "trending", title: "It keeps optimizing", text: "Budget shifts toward what's working, with a plain-English report along the way." },
    ],
    capabilities: [
      { icon: "pen", title: "Copy that matches your brand", text: "Drafts ad and email copy in your voice, not a generic template.", points: ["Multiple headline variants", "Matches your brand tone", "Ready to review before launch"] },
      { icon: "target", title: "Audience targeting", text: "Finds and refines the audiences most likely to convert.", points: ["Starts from your best customers", "Narrows targeting over time", "Flags underperforming segments"] },
      { icon: "trending", title: "Budget optimization", text: "Shifts spend toward what's actually working, automatically.", points: ["Reallocates daily", "Pauses weak ad sets", "Stays within your budget cap"] },
      { icon: "chart", title: "Plain-English reports", text: "Explains performance without a spreadsheet.", points: ["Weekly summaries", "Highlights the why, not just the what", "Shareable with your team"] },
      { icon: "refresh", title: "Continuous A/B testing", text: "Keeps testing new variants in the background.", points: ["Tests headlines and creative", "Rotates in winners automatically", "Retires losers quickly"] },
    ],
    useCases: [
      { icon: "target", title: "Small businesses", text: "Run campaigns without a full marketing team." },
      { icon: "trending", title: "Growth teams", text: "Free up time from manual budget shifting." },
      { icon: "mail", title: "Ecommerce brands", text: "Keep email sequences fresh and relevant." },
      { icon: "megaphone", title: "Agencies", text: "Manage more client campaigns at once." },
      { icon: "chart", title: "Founders", text: "Get a weekly read on what's working." },
      { icon: "users", title: "Product marketers", text: "Launch campaigns around every release." },
    ],
    compare: {
      beforeLabel: "Manual campaign",
      afterLabel: "Agent-run campaign",
      before: "Set once, checked weekly, budget split evenly across ad sets whether they worked or not.",
      after: "Budget rebalanced daily toward the top performers, with cost per lead down 47% over eight weeks.",
    },
    finalTitle: "Ready to put your campaigns on autopilot?",
    finalText: "Set a goal and a budget — the agent handles the rest.",
  },

  /* --------------------------- Automation Agent --------------------------- */
  "automation-agent": {
    slug: "automation-agent",
    name: "Automation Agent",
    tagline: "Automate repeat work",
    icon: "workflow",
    theme: "emerald",
    badge: "Autonomous automation",
    heading: [
      { text: "Repeat" },
      { text: "work," },
      { br: true },
      { text: "handled automatically.", gradient: true },
    ],
    sub: "Describe the workflow once. The agent watches for the trigger, follows the steps, and only pings you when something needs a decision.",
    cta: "Try Automation Agent",
    chips: ["Lead routing", "Data syncing", "Notifications", "Approvals"],
    floaters: [
      { icon: "zap", label: "Runs on triggers" },
      { icon: "workflow", label: "Multi-step logic" },
      { icon: "check", label: "Only pings you when needed" },
    ],
    playground: {
      kind: "agent",
      title: "Automation console",
      task: "When a new lead fills the signup form, add them to the CRM and send a welcome email",
      steps: [
        { label: "Trigger detected", detail: "New form submission received" },
        { label: "Checking conditions", detail: "Confirming the lead matches the target segment" },
        { label: "Updating the CRM", detail: "Creating a new contact record" },
        { label: "Sending the welcome email", detail: "Using the onboarding template" },
        { label: "Notifying the team", detail: "Posting a summary to the sales channel" },
      ],
      output:
        "Lead added to the CRM as a Marketing Qualified Lead, welcome email sent, and a summary posted to #sales. No manual steps needed.",
    },
    band: ["Lead routing", "Data syncing", "Notifications", "Approvals", "Report generation", "Inventory checks", "Onboarding", "Reminders"],
    steps: [
      { icon: "zap", title: "Set the trigger", text: "Pick what starts the workflow — a form, a new record, a schedule." },
      { icon: "workflow", title: "Define the steps", text: "Describe what should happen, including any conditions or approvals." },
      { icon: "check", title: "Let it run", text: "The agent runs quietly in the background and flags anything unusual." },
    ],
    capabilities: [
      { icon: "zap", title: "Flexible triggers", text: "Starts from a form, a new record, a schedule, or another app.", points: ["Form submissions", "Scheduled runs", "Changes in connected apps"] },
      { icon: "workflow", title: "Multi-step logic", text: "Handles branching steps, not just single actions.", points: ["Conditional branches", "Multiple actions per run", "Waits for approvals when needed"] },
      { icon: "layers", title: "Connects your tools", text: "Moves data between the apps you already use.", points: ["CRM and spreadsheets", "Email and chat tools", "Calendars and forms"] },
      { icon: "shield", title: "Error handling", text: "Retries safely and tells you when it can't proceed.", points: ["Automatic retries", "Clear failure alerts", "Nothing silently dropped"] },
      { icon: "clock", title: "Runs on schedule or trigger", text: "Works instantly on events or on a recurring schedule.", points: ["Real-time triggers", "Daily or weekly runs", "Time-zone aware"] },
    ],
    useCases: [
      { icon: "target", title: "Sales teams", text: "Route and qualify leads without manual entry." },
      { icon: "layers", title: "Operations", text: "Keep records in sync across tools automatically." },
      { icon: "mail", title: "Support teams", text: "Auto-tag and route incoming tickets." },
      { icon: "users", title: "HR teams", text: "Automate onboarding checklists." },
      { icon: "chart", title: "Finance", text: "Generate recurring reports without spreadsheets." },
      { icon: "clock", title: "Founders", text: "Get routine reminders and checks handled for you." },
    ],
    compare: {
      beforeLabel: "Manual process",
      afterLabel: "Automated workflow",
      before: "New lead comes in, someone checks their inbox, copies details into the CRM, then remembers to send a welcome email — eventually.",
      after: "Lead is added to the CRM and welcomed within seconds of signing up, every time, with no one having to remember.",
    },
    finalTitle: "Ready to stop doing this by hand?",
    finalText: "Describe the workflow once, and let the agent run it from now on.",
  },

  /* ----------------------------- Custom Agents ----------------------------- */
  "custom-agent": {
    slug: "custom-agent",
    name: "Custom Agents",
    tagline: "Build your own agent",
    icon: "puzzle",
    theme: "amber",
    badge: "Build your own",
    heading: [
      { text: "Build" },
      { text: "an" },
      { text: "agent" },
      { br: true },
      { text: "for exactly your workflow.", gradient: true },
    ],
    sub: "Pick the tools it can use, describe its job, and set the guardrails. Deploy an agent shaped around how your team actually works.",
    cta: "Build a Custom Agent",
    chips: ["Pick your tools", "Set the goal", "Add guardrails", "Deploy anywhere"],
    floaters: [
      { icon: "puzzle", label: "Mix and match tools" },
      { icon: "shield", label: "Guardrails you set" },
      { icon: "zap", label: "Deploy in minutes" },
    ],
    playground: {
      kind: "agent",
      title: "Agent builder",
      task: "Build an agent that monitors Slack for support questions and drafts replies from our docs",
      steps: [
        { label: "Defining the goal", detail: "Answer support questions using our documentation" },
        { label: "Choosing tools", detail: "Slack, the knowledge base, and the ticketing system" },
        { label: "Setting guardrails", detail: "Draft only — a human approves before sending" },
        { label: "Testing the agent", detail: "Running it against last week's questions" },
        { label: "Deploying", detail: "Live in the #support channel" },
      ],
      output:
        "Agent deployed. It watches #support, drafts a reply from the docs for each question, and waits for a teammate's approval before sending.",
    },
    band: ["Pick your tools", "Set the goal", "Add guardrails", "Deploy anywhere", "Combine agents", "Set permissions", "Test safely", "Monitor runs"],
    steps: [
      { icon: "target", title: "Describe the job", text: "Say what the agent is responsible for, in plain language." },
      { icon: "puzzle", title: "Pick its tools", text: "Choose which apps and data it can access, and what it can and can't do on its own." },
      { icon: "zap", title: "Deploy and monitor", text: "Turn it on, watch its first runs, and adjust the guardrails anytime." },
    ],
    capabilities: [
      { icon: "puzzle", title: "Composable tools", text: "Give the agent only the tools its job actually needs.", points: ["Connect specific apps", "Mix and match capabilities", "Add tools later without rebuilding"] },
      { icon: "shield", title: "Guardrails you control", text: "Decide what it can do on its own and what needs approval.", points: ["Draft-only or auto-send modes", "Spending and scope limits", "Human approval steps"] },
      { icon: "users", title: "Team-specific behavior", text: "Shape the agent around how your team actually works.", points: ["Custom instructions", "Your terminology and tone", "Escalation rules"] },
      { icon: "chart", title: "Visibility into every run", text: "See what the agent did and why, after every run.", points: ["Run history", "Clear reasoning trail", "Easy to spot and fix mistakes"] },
      { icon: "refresh", title: "Iterate without starting over", text: "Adjust the goal, tools, or guardrails as you learn.", points: ["Edit instructions anytime", "Add or remove tools", "Roll back if something's off"] },
    ],
    useCases: [
      { icon: "mail", title: "Support teams", text: "Draft replies from your own documentation." },
      { icon: "layers", title: "Operations", text: "Build an agent around one specific recurring task." },
      { icon: "shield", title: "IT teams", text: "Automate access requests with clear guardrails." },
      { icon: "users", title: "HR teams", text: "Handle first-pass screening questions." },
      { icon: "chart", title: "Finance", text: "Build an agent that flags unusual transactions." },
      { icon: "target", title: "Any team", text: "Turn a recurring task into a reliable agent." },
    ],
    compare: {
      beforeLabel: "Off-the-shelf agent",
      afterLabel: "Custom agent",
      before: "Generic tool access, generic tone, and no guardrails specific to how your team actually wants things handled.",
      after: "Scoped to exactly the tools it needs, drafting in your team's voice, with approval required before anything goes out.",
    },
    finalTitle: "Ready to build an agent for your workflow?",
    finalText: "Describe the job, pick the tools, and deploy it in minutes.",
  },
};

const AGENT_LIST = Object.values(AGENTS);

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

/** idle -> running (steps light up one by one) -> done, for the agent demo. */
function useAgentRun(steps, stepMs = 620) {
  const [phase, setPhase] = useState("idle");
  const [active, setActive] = useState(-1);
  const [runId, setRunId] = useState(0);
  const timers = useRef([]);

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("running");
    setActive(-1);
    steps.forEach((_, i) => {
      const t = setTimeout(() => setActive(i), (i + 1) * stepMs);
      timers.current.push(t);
    });
    const done = setTimeout(() => {
      setPhase("done");
      setRunId((k) => k + 1);
    }, steps.length * stepMs + 300);
    timers.current.push(done);
  }, [steps, stepMs]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { phase, active, runId, run };
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
/* Generated art (used by the compare slider)                              */
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
    loading: ["Running…", `${theme.soft} ${theme.text}`],
    done: ["Done", "bg-emerald-50 text-emerald-600"],
  };
  const [label, cls] = map[phase] || map.idle;
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

/* --------------------------------- Agent run --------------------------------- */

function AgentDemo({ data, theme }) {
  const { phase, active, runId, run } = useAgentRun(data.steps, 620);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const typed = useTypewriter(data.output, phase === "done", runId, 14);

  return (
    <ConsoleFrame theme={theme} title={data.title} right={<StatusPill phase={phase === "running" ? "loading" : phase} theme={theme} />}>
      <div ref={ref} className="space-y-3">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
          <p className="text-[13px] leading-relaxed text-gray-600">{data.task}</p>
          <RunButton theme={theme} label="Run agent" onClick={run} disabled={phase === "running"} />
        </div>

        <div className="min-h-[190px] rounded-2xl border border-white bg-white p-4 shadow-sm">
          <ul className="space-y-2.5">
            {data.steps.map((s, i) => {
              const state = active > i || phase === "done" ? "done" : active === i ? "active" : "pending";
              return (
                <li key={s.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      state === "done"
                        ? `${theme.solid} text-white`
                        : state === "active"
                        ? `${theme.soft} ${theme.text}`
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    {state === "done" ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : state === "active" ? (
                      <motion.span
                        className={`h-2 w-2 rounded-full ${theme.solid}`}
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    )}
                  </span>
                  <div>
                    <p className={`text-[12.5px] font-semibold ${state === "pending" ? "text-gray-400" : "text-gray-700"}`}>{s.label}</p>
                    <p className="text-[11px] text-gray-400">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-h-[76px] rounded-2xl border border-white bg-white p-4 shadow-sm">
          {phase !== "done" ? (
            <p className="text-sm text-gray-400">The result will appear here once the agent finishes.</p>
          ) : (
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

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

function Demo({ agent, theme }) {
  const p = agent.playground;
  if (p.kind === "chart") return <ChartDemo data={p} theme={theme} />;
  if (p.kind === "code") return <CodeDemo data={p} theme={theme} />;
  return <AgentDemo data={p} theme={theme} />;
}

/* ====================================================================== */
/* Hero                                                                    */
/* ====================================================================== */

function Hero({ agent, theme, mx, my }) {
  const Icon = ICONS[agent.icon];
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
            <span>Agents</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span aria-current="page" className="font-medium text-gray-900">
              {agent.name}
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
              {agent.badge}
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
              tokens={agent.heading}
              gradClass={theme.gradText}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0f1030] sm:text-5xl lg:text-6xl"
            />
          </div>

          <Reveal3D as="p" delay={0.8} className="mt-6 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg">
            {agent.sub}
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
                <span className="relative">{agent.cta}</span>
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
            {agent.chips.map((c, i) => (
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
            <Demo agent={agent} theme={theme} />
          </motion.div>

          {agent.floaters.map((f, i) => {
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

function Band({ agent, theme }) {
  const rest = [...agent.band].reverse();
  return (
    <div aria-hidden className="relative overflow-hidden py-8 md:py-12" style={{ perspective: 1000 }}>
      <div
        className="space-y-2 md:space-y-4"
        style={{ transform: "rotateX(14deg) rotateZ(-1.5deg)", transformStyle: "preserve-3d" }}
      >
        <MarqueeRow items={agent.band} outline accent={theme.text} />
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

function HowItWorks({ agent, theme }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const [active, setActive] = useState(0);
  const n = agent.steps.length;

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
        sub={`Three simple steps from a plain-language request to a finished result with ${agent.name}.`}
      />

      <div ref={ref} className="relative mt-16" style={{ perspective: 1400 }}>
        <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-0.5 bg-gray-200 md:block">
          <motion.div
            className={`h-full origin-left bg-gradient-to-r ${theme.grad}`}
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        <ol className="grid gap-8 md:grid-cols-3">
          {agent.steps.map((step, i) => {
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

function Capabilities({ agent, theme }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const caps = agent.capabilities;

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

function UseCases({ agent, theme }) {
  return (
    <section id="use-cases" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead
        title="Built for how you work"
        sub={`See how different people use ${agent.name}. Flip a card to read more.`}
      />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agent.useCases.map((item, i) => (
          <FlipCard key={item.title} item={item} theme={theme} index={i} />
        ))}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/* Before / after slider                                                   */
/* ====================================================================== */

function Compare({ agent, theme }) {
  const c = agent.compare;
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
/* Other agents                                                            */
/* ====================================================================== */

function OtherAgents({ agent }) {
  const others = AGENT_LIST.filter((a) => a.slug !== agent.slug);
  return (
    <section id="other-agents" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-14 md:py-24 lg:px-20">
      <SectionHead title="More agents" sub="Every agent works on its own, and they work even better together." />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1600 }}>
        {others.map((a, i) => {
          const th = THEMES[a.theme];
          const AIcon = ICONS[a.icon];
          return (
            <Tilt
              key={a.slug}
              as="li"
              max={10}
              lift={10}
              scale={1.04}
              glare
              outerProps={enter(i * 0.08)}
              className="h-full"
            >
              <Link
                href={`/agents/${a.slug}`}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.3)] backdrop-blur-xl transition-shadow duration-500 [transform-style:preserve-3d] hover:shadow-[0_40px_90px_-24px_rgba(99,102,241,0.5)] focus-visible:outline-none focus-visible:ring-2 ${th.ring}`}
              >
                <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 ${th.blob}`} />
                <span
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${th.grad}`}
                  style={{ transform: "translateZ(40px)" }}
                >
                  <AIcon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold text-[#0f1030]" style={{ transform: "translateZ(28px)" }}>
                  {a.name}
                </h3>
                <p className="relative mt-1.5 text-sm text-gray-500" style={{ transform: "translateZ(16px)" }}>
                  {a.tagline}
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

function FinalCta({ agent, theme }) {
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
              {agent.finalTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">{agent.finalText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Magnetic>
                <motion.a
                  href="#try"
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0f1030] shadow-xl transition-shadow hover:shadow-2xl"
                >
                  {agent.cta}
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
              </Magnetic>
              <Magnetic>
                <motion.a
                  href="#other-agents"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  See other agents
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

function Footnote({ agent }) {
  return (
    <Reveal3D className="flex flex-col items-center gap-2 pb-16 text-sm text-gray-500">
      <span>Built with the {agent.name} engine.</span>
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

export default function AgentsPage({ slug }) {
  const agent = AGENTS[slug];
  const theme = THEMES[agent?.theme] || THEMES.violet;

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

  if (!agent) return null;

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
          <Hero agent={agent} theme={theme} mx={mx} my={my} />
          <Band agent={agent} theme={theme} />
          <HowItWorks agent={agent} theme={theme} />
          <Capabilities agent={agent} theme={theme} />
          <UseCases agent={agent} theme={theme} />
          <Compare agent={agent} theme={theme} />
          <OtherAgents agent={agent} />
          <FinalCta agent={agent} theme={theme} />
          <Footnote agent={agent} />
        </div>
      </main>
    </MotionConfig>
  );
}