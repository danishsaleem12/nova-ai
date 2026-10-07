/**
 * Plain data module — deliberately NOT "use client".
 *
 * ResourcesPage.js is a client component ("use client"), and Next's RSC
 * boundary means plain data/functions exported from a client module
 * cannot be safely consumed by server code (generateStaticParams,
 * generateMetadata) — the import comes through as an opaque client
 * reference instead of the real array/object, which is why
 * RESOURCE_SLUGS.map() failed with "is not a function".
 *
 * So the resource data lives here instead: ResourcesPage.js imports
 * RESOURCES from this file to render, and
 * app/resources/[slug]/page.js imports RESOURCE_SLUGS/RESOURCES from
 * this file directly for generateStaticParams/generateMetadata. Add a
 * new resource by adding an entry to RESOURCES below — nothing else
 * needs to change.
 */

export const RESOURCES = {
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

export const RESOURCE_SLUGS = Object.keys(RESOURCES);
export const RESOURCE_LIST = Object.values(RESOURCES);