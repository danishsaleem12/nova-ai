//src/components/Navbar.js

"use client";

/**
 * Navbar (single self-contained file).
 *
 * Usage (app/layout.js or app/page.js, above your sections):
 *   import Navbar from "./components/Navbar";
 *   <Navbar />
 *
 * Needs: framer-motion, lucide-react, Tailwind (v3.2+ for group/item).
 * All labels, links and dropdown items are in the DATA block below.
 * Section ids used by the active-link highlight: #home.
 *
 * Features
 *  - Floating glass pill with gloss, cursor spotlight, light sweep and scroll progress line
 *  - 4 dropdowns (hover on desktop, click/tap/keyboard everywhere), sliding hover highlight
 *  - Search panel with live results (Ctrl/Cmd + K to open, Esc to close)
 *  - Mobile menu with accordion groups
 *  - A single "Get Started" button that opens the chat app (no login / signup)
 *
 * NOTE: the "Product" group's items link to real routes
 *   (/product/ai-chat, /product/ai-image, etc.) matching the slugs in
 *   src/data/products.js, the "AI Tools" group's items link to the real
 *   /ai-tools/[slug] pages (/ai-tools/ai-writer, etc.) matching the slugs
 *   in app/components/AIToolPage.js, the "Agents" group's items link
 *   to the real /agents/[slug] pages (/agents/research-agent, etc.)
 *   matching the slugs in app/components/AgentsPage.js, and the
 *   "Resources" group's items link to the real /resources/[slug] pages
 *   (/resources/ai-blog, etc.) matching the slugs in
 *   components/ResourcesPage.js.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Braces,
  ChevronDown,
  Code2,
  CornerDownLeft,
  Cpu,
  FileSearch,
  FileText,
  Image as ImageIcon,
  LifeBuoy,
  Megaphone,
  Menu,
  MessageCircle,
  Mic,
  Newspaper,
  Pencil,
  Puzzle,
  Search,
  Terminal,
  Users,
  Wand2,
  Workflow,
  X,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BRAND = { first: "Nova", second: "AI", href: "/#home" };
const CTA = { label: "Get Started", href: "/chat" };
const SEARCH_PLACEHOLDER = "Search AI tools, agents, docs...";
const POPULAR = ["AI Chat", "AI Code", "AI Documents", "Documentation"];

// Items with `items` become dropdowns. Items with only `href` are plain links.
const NAV = [
  { id: "home", label: "Home", href: "/#home" },
  {
    id: "product",
    label: "Product",
    tone: "bg-blue-100 text-blue-600",
    items: [
      // hrefs match the slugs (object keys) in src/data/products.js exactly
      { icon: MessageCircle, label: "AI Chat", text: "Talk to a smart assistant", href: "/product/ai-chat" },
      { icon: ImageIcon, label: "AI Image", text: "Coming soon", href: "/product/ai-image" },
      { icon: Mic, label: "AI Voice", text: "Speak and listen", href: "/product/ai-voice" },
      { icon: FileText, label: "AI Documents", text: "Summarize and rewrite text", href: "/product/ai-documents" },
      { icon: Code2, label: "AI Code", text: "Explain, debug and write code", href: "/product/ai-code" },
    ],
  },
  {
    id: "tools",
    label: "AI Tools",
    tone: "bg-violet-100 text-violet-600",
    items: [
      // hrefs match the slugs (object keys) in the TOOLS map in
      // app/components/AIToolPage.js exactly
      { icon: Pencil, label: "AI Writer", text: "Blogs, emails and more", href: "/ai-tools/ai-writer" },
      { icon: Wand2, label: "Image Generator", text: "Coming soon", href: "/ai-tools/image-generator" },
      { icon: BarChart3, label: "Data Analyzer", text: "Find insights instantly", href: "/ai-tools/data-analyzer" },
      { icon: Terminal, label: "Code Assistant", text: "Write, explain and fix code", href: "/ai-tools/code-assistant" },
      { icon: AlignLeft, label: "AI Summarizer", text: "Long text made short", href: "/ai-tools/ai-summarizer" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    tone: "bg-indigo-100 text-indigo-600",
    items: [
      // hrefs match the slugs (object keys) in the AGENTS map in
      // app/components/AgentsPage.js exactly
      { icon: FileSearch, label: "Research Agent", text: "Coming soon", href: "/agents/research-agent" },
      { icon: Cpu, label: "Coding Agent", text: "Coming soon", href: "/agents/coding-agent" },
      { icon: Megaphone, label: "Marketing Agent", text: "Coming soon", href: "/agents/marketing-agent" },
      { icon: Workflow, label: "Automation Agent", text: "Coming soon", href: "/agents/automation-agent" },
      { icon: Puzzle, label: "Custom Agents", text: "Coming soon", href: "/agents/custom-agent" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    tone: "bg-sky-100 text-sky-600",
    items: [
      // hrefs match the slugs (object keys) in the RESOURCES map in
      // components/ResourcesPage.js exactly
      { icon: Newspaper, label: "AI Blog", text: "News, guides and ideas", href: "/resources/ai-blog" },
      { icon: BookOpen, label: "Documentation", text: "Learn how it all works", href: "/resources/documentation" },
      { icon: Braces, label: "API", text: "Build with NovaAI", href: "/resources/api" },
      { icon: LifeBuoy, label: "Help Center", text: "Answers and support", href: "/resources/help-center" },
      { icon: Users, label: "Community", text: "Meet other creators", href: "/resources/community" },
    ],
  },
];

// Flat list used by the search panel.
const ALL_ITEMS = NAV.flatMap((g) =>
  g.items ? g.items.map((i) => ({ ...i, group: g.label, tone: g.tone })) : []
);

/* ====================================================================== */
/* Motion helpers                                                          */
/* ====================================================================== */

const BAR = {
  hidden: { opacity: 0, y: -52, rotateX: -30 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.9, ease: EASE, staggerChildren: 0.1, delayChildren: 0.35 },
  },
};
const POP = {
  hidden: { opacity: 0, y: -14, rotateX: -40, scale: 0.94 },
  show: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};
const LIST = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const PANEL = {
  hidden: { opacity: 0, y: -12, rotateX: -20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.4, ease: EASE, staggerChildren: 0.045, delayChildren: 0.08 },
  },
  exit: { opacity: 0, y: -6, rotateX: -10, scale: 0.98, transition: { duration: 0.16 } },
};
const ITEM = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

const SPRING = { type: "spring", stiffness: 380, damping: 30 };

const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

/** Glossy glass sphere that bobs up and down. */
function Bubble({ size = 40, tone = "blue", delay = 0, bob = 7, className = "" }) {
  return (
    <motion.div
      aria-hidden
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: BUBBLE_TONES[tone],
        boxShadow: `inset -${size * 0.14}px -${size * 0.18}px ${size * 0.3}px rgba(60,40,200,0.35), 0 ${size * 0.3}px ${size * 0.6}px rgba(99,102,241,0.3)`,
      }}
      animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: bob, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/** Gently pulls its content toward the cursor (for buttons). */
function Magnetic({ children, strength = 0.28, className = "" }) {
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
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

function LogoMark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="nav-logo-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="nav-logo-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#nav-logo-a)" />
      <path d="M12 14.6 L14.1 20 H9.9 Z" fill="url(#nav-logo-b)" />
    </svg>
  );
}

/* ====================================================================== */
/* Brand + buttons                                                         */
/* ====================================================================== */

function Brand() {
  return (
    <motion.a
      href={BRAND.href}
      aria-label={`${BRAND.first}${BRAND.second} home`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="group flex items-center gap-2 rounded-full py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-[0_8px_20px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)_scale(1.08)]"
      >
        <LogoMark className="h-6 w-6" />
      </span>
      <span className="text-[22px] font-extrabold leading-none tracking-tight">
        <span className="text-[#0f1030]" style={{ textShadow: "1px 1px 0 #cfd6f8, 2px 2px 6px rgba(59,91,255,0.22)" }}>
          {BRAND.first}
        </span>
        <span
          className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent"
          style={{ filter: "drop-shadow(0 3px 4px rgba(79,70,229,0.3))" }}
        >
          {BRAND.second}
        </span>
      </span>
    </motion.a>
  );
}

function CtaButton({ block = false }) {
  const btn = (
    <motion.a
      href={CTA.href}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_14px_32px_-10px_rgba(79,70,229,0.75)] transition-shadow duration-300 hover:shadow-[0_22px_46px_-10px_rgba(79,70,229,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
        block ? "w-full" : ""
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/35 to-transparent"
      />
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
      />
      <span className="relative">{CTA.label}</span>
      <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
    </motion.a>
  );
  return block ? btn : <Magnetic>{btn}</Magnetic>;
}

function SearchButton({ open, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Search"
      aria-expanded={open}
      title="Search (Ctrl/Cmd + K)"
      whileHover={{ scale: 1.12, rotate: -8 }}
      whileTap={{ scale: 0.9 }}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        open ? "bg-indigo-50 text-indigo-600 shadow-inner" : "text-[#2b2e4a] hover:bg-white hover:text-indigo-600 hover:shadow-md"
      }`}
    >
      <Search className="h-[18px] w-[18px]" />
    </motion.button>
  );
}

function DropdownPanel({ group, onNavigate, onEscape }) {
  const [hi, setHi] = useState(null);
  const px = useMotionValue(50);
  const py = useMotionValue(0);
  const spot = useMotionTemplate`radial-gradient(220px circle at ${px}% ${py}%, rgba(129,140,248,0.18), transparent 70%)`;

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 100);
    py.set(((e.clientY - r.top) / r.height) * 100);
  };

  const onKeyDown = (e) => {
    const items = Array.from(e.currentTarget.querySelectorAll('[role="menuitem"]'));
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      onEscape();
    }
  };

  return (
    <motion.div
      id={`nav-menu-${group.id}`}
      role="menu"
      aria-label={group.label}
      variants={PANEL}
      initial="hidden"
      animate="show"
      exit="exit"
      onPointerMove={onMove}
      onPointerLeave={() => setHi(null)}
      onKeyDown={onKeyDown}
      style={{ transformPerspective: 900, transformOrigin: "50% 0%" }}
      className="relative rounded-3xl border border-white/90 bg-white/85 p-2.5 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.5)] backdrop-blur-2xl"
    >
      {/* notch */}
      <span
        aria-hidden
        className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-white/90 bg-white"
      />

      {/* decoration clipped to the card */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <motion.span className="absolute inset-0" style={{ background: spot }} />
        <span className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/90 to-transparent" />
        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-300/30 blur-2xl" />
        <span className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-300/30 blur-2xl" />
        <div className="absolute -right-2 top-2 opacity-90">
          <Bubble size={22} tone="pink" bob={6} />
        </div>
      </div>

      <div className="relative mb-1 flex items-center gap-2 px-2.5 pt-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-400 to-violet-500" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">{group.label}</span>
      </div>

      <ul className="relative">
        {group.items.map(({ icon: Icon, label, text, href }, i) => (
          <motion.li key={label} variants={ITEM}>
            <motion.a
              role="menuitem"
              href={href}
              onClick={onNavigate}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHi(i)}
              onFocus={() => setHi(i)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="group/item relative flex items-center gap-3 rounded-2xl px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {hi === i && (
                <motion.span
                  layoutId={`hl-${group.id}`}
                  transition={SPRING}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.4)] ring-1 ring-indigo-100"
                />
              )}
              <span
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-700 group-hover/item:[transform:perspective(300px)_rotateY(360deg)] ${group.tone}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold leading-tight text-[#0f1030]">{label}</span>
                <span className="mt-0.5 block truncate text-[11.5px] leading-tight text-gray-500">{text}</span>
              </span>
              <ArrowUpRight className="relative h-4 w-4 -translate-x-1 text-indigo-500 opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100" />
            </motion.a>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ====================================================================== */
/* Desktop nav entry (plain link or dropdown)                              */
/* ====================================================================== */

function NavEntry({ item, active, lit, open, onHover, onOpen, onScheduleClose, onClose, onActivate }) {
  const hoverOpened = useRef(false);
  const btnRef = useRef(null);
  const isMenu = Boolean(item.items);
  const isActive = active === item.id;

  const onEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    onHover(item.id);
    if (isMenu) {
      hoverOpened.current = true;
      onOpen(item.id);
    }
  };
  const onLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    hoverOpened.current = false;
    if (isMenu) onScheduleClose(item.id);
  };
  const onBlur = (e) => {
    if (isMenu && open && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) onClose();
  };
  const onClick = () => {
    if (hoverOpened.current) {
      hoverOpened.current = false; // the hover already opened it, so keep it open
      return;
    }
    if (open) onClose();
    else onOpen(item.id);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onOpen(item.id);
      setTimeout(() => document.querySelector(`#nav-menu-${item.id} [role="menuitem"]`)?.focus(), 70);
    }
  };

  const color = isActive ? "text-blue-600" : lit ? "text-indigo-600" : "text-[#2b2e4a]";
  const base = `relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-indigo-400 xl:px-4 ${color}`;

  const face = (
    <>
      {lit && (
        <motion.span
          layoutId="nav-hover"
          transition={SPRING}
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-indigo-50/80 shadow-[0_8px_18px_-8px_rgba(79,70,229,0.4)] ring-1 ring-white"
        />
      )}
      <span className="relative">{item.label}</span>
      {isMenu && (
        <motion.span
          className="relative"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      )}
    </>
  );

  return (
    <motion.li
      variants={POP}
      className="relative"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onBlur={onBlur}
    >
      {isMenu ? (
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={`nav-menu-${item.id}`}
          onClick={onClick}
          onKeyDown={onKey}
          className={base}
        >
          {face}
        </button>
      ) : (
        <a
          href={item.href}
          onClick={() => onActivate(item.id)}
          aria-current={isActive ? "page" : undefined}
          className={base}
        >
          {face}
        </a>
      )}

      {!isMenu && isActive && (
        <span className="pointer-events-none absolute inset-x-0 -bottom-[11px] flex justify-center">
          <motion.span
            layoutId="nav-underline"
            transition={SPRING}
            className="h-[3px] w-8 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 shadow-[0_2px_10px_rgba(99,102,241,0.7)]"
          />
        </span>
      )}

      {isMenu && (
        <AnimatePresence>
          {open && (
            <div
              key="panel"
              className="absolute left-1/2 top-full z-50 w-[19.5rem] -translate-x-1/2 pt-4"
            >
              <DropdownPanel
                group={item}
                onNavigate={onClose}
                onEscape={() => {
                  onClose();
                  btnRef.current?.focus();
                }}
              />
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.li>
  );
}

/* ====================================================================== */
/* Search panel                                                            */
/* ====================================================================== */

function SearchPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS.filter((r) => POPULAR.includes(r.label));
    return ALL_ITEMS.filter((r) => `${r.label} ${r.text} ${r.group}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const go = (r) => {
    onClose();
    if (r) window.location.assign(r.href);
  };

  const onKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[idx]);
    }
  };

  return (
    <motion.div
      variants={PANEL}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ transformPerspective: 900, transformOrigin: "50% 0%" }}
      className="relative rounded-3xl border border-white/90 bg-white/90 p-3 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.55)] backdrop-blur-2xl"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/90 to-transparent" />
        <span className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-300/30 blur-2xl" />
        <span className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />
        <div className="absolute right-3 top-3 opacity-90">
          <Bubble size={20} tone="cyan" bob={6} />
        </div>
      </div>

      <div className="relative flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 shadow-sm transition-shadow focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25)]">
        <Search className="h-[18px] w-[18px] shrink-0 text-indigo-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIdx(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={SEARCH_PLACEHOLDER}
          aria-label="Search"
          className="h-12 w-full bg-transparent text-[15px] text-[#0f1030] outline-none placeholder:text-gray-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 sm:block">
            Esc
          </kbd>
        )}
      </div>

      <div className="relative mt-3 flex items-center gap-2 px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-400 to-violet-500" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
          {query.trim() ? "Results" : "Popular"}
        </span>
      </div>

      <ul role="listbox" className="relative mt-1.5" onPointerLeave={() => {}}>
        {results.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.li key={r.label} variants={ITEM} role="option" aria-selected={idx === i}>
              <a
                href={r.href}
                onClick={onClose}
                onPointerEnter={(e) => e.pointerType === "mouse" && setIdx(i)}
                className="group/item relative flex items-center gap-3 rounded-2xl px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {idx === i && (
                  <motion.span
                    layoutId="search-hl"
                    transition={SPRING}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.4)] ring-1 ring-indigo-100"
                  />
                )}
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-700 group-hover/item:[transform:perspective(300px)_rotateY(360deg)] ${r.tone}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-tight text-[#0f1030]">{r.label}</span>
                  <span className="mt-0.5 block truncate text-[11.5px] leading-tight text-gray-500">{r.text}</span>
                </span>
                <span className="relative hidden shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-500 ring-1 ring-indigo-100 sm:block">
                  {r.group}
                </span>
                {idx === i && <CornerDownLeft className="relative h-3.5 w-3.5 shrink-0 text-indigo-500" />}
              </a>
            </motion.li>
          );
        })}
        {!results.length && (
          <li className="relative px-3 py-6 text-center text-sm text-gray-500">
            No matches for &ldquo;{query}&rdquo;. Try &ldquo;chat&rdquo;, &ldquo;image&rdquo; or &ldquo;agent&rdquo;.
          </li>
        )}
      </ul>

      <div className="relative mt-2 hidden items-center gap-4 border-t border-indigo-100/70 px-2 pt-2.5 text-[11px] text-gray-400 sm:flex">
        <span>&uarr;&darr; to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* Mobile menu                                                             */
/* ====================================================================== */

function MobileMenu({ active, onNavigate, onActivate }) {
  const [openGroup, setOpenGroup] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, rotateX: -14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.16 } }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{ transformPerspective: 900, transformOrigin: "50% 0%" }}
      className="relative max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-3xl border border-white/90 bg-white/90 p-3 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.55)] backdrop-blur-2xl"
    >
      <ul className="space-y-1">
        {NAV.map((item) =>
          item.items ? (
            <li key={item.id}>
              <button
                type="button"
                aria-expanded={openGroup === item.id}
                onClick={() => setOpenGroup((g) => (g === item.id ? null : item.id))}
                className="flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-[15px] font-semibold text-[#1b1b3a] transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {item.label}
                <motion.span animate={{ rotate: openGroup === item.id ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
                  <ChevronDown className="h-4 w-4 text-indigo-500" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openGroup === item.id && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {item.items.map(({ icon: Icon, label, text, href }) => (
                      <li key={label}>
                        <a
                          href={href}
                          onClick={onNavigate}
                          className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[#0f1030]">{label}</span>
                            <span className="block truncate text-xs text-gray-500">{text}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ) : (
            <li key={item.id}>
              <a
                href={item.href}
                onClick={() => {
                  onActivate(item.id);
                  onNavigate();
                }}
                className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-[15px] font-semibold transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  active === item.id ? "bg-indigo-50/70 text-blue-600" : "text-[#1b1b3a]"
                }`}
              >
                {item.label}
                {active === item.id && (
                  <span className="h-[3px] w-6 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />
                )}
              </a>
            </li>
          )
        )}
      </ul>

      <div className="mt-3 border-t border-indigo-100/70 pt-3">
        <CtaButton block />
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* Navbar                                                                  */
/* ====================================================================== */

function subscribeToScroll(callback) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const getScrolled = () => window.scrollY > 16;

export default function Navbar() {
  const navRef = useRef(null);
  const closeTimer = useRef(null);
  const pathname = usePathname();

  const [openId, setOpenId] = useState(null); // "product" | "tools" | ... | "search" | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState("home");
  // true once the page is scrolled a little (shrinks the bar, stronger glass)
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolled, () => false);

  // cursor spotlight on the pill
  const mxp = useMotionValue(0);
  const myp = useMotionValue(0);
  const hoverMV = useMotionValue(0);
  const glow = useSpring(hoverMV, { stiffness: 120, damping: 20 });
  const spot = useMotionTemplate`radial-gradient(280px circle at ${mxp}px ${myp}px, rgba(129,140,248,0.22), transparent 70%)`;

  // scroll progress line
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const closeAll = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpenId(null);
    setMobileOpen(false);
  }, []);
  const openMenu = useCallback((id) => {
    clearTimeout(closeTimer.current);
    setMobileOpen(false);
    setOpenId(id);
  }, []);
  const scheduleClose = useCallback((id) => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId((cur) => (cur === id ? null : cur)), 140);
  }, []);
  const toggleSearch = useCallback(() => {
    clearTimeout(closeTimer.current);
    setMobileOpen(false);
    setOpenId((cur) => (cur === "search" ? null : "search"));
  }, []);
  const toggleMobile = () => {
    clearTimeout(closeTimer.current);
    setOpenId(null);
    setMobileOpen((v) => !v);
  };
  // keyboard shortcuts + outside click + resize
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeAll();
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      clearTimeout(closeTimer.current);
    };
  }, [closeAll, toggleSearch]);

  // highlight the link whose section is on screen
  useEffect(() => {
    // on product pages no section link should look active (see `activeLink` below)
    if (pathname !== "/") return;
    const targets = NAV.filter((n) => n.href && n.href.startsWith("/#"))
      .map((n) => ({ id: n.id, el: document.querySelector(n.href.slice(1)) }))
      .filter((t) => t.el);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const hit = targets.find((t) => t.el === en.target);
          if (hit) setActive(hit.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((t) => io.observe(t.el));
    return () => {
      io.disconnect();
      setActive("home"); // back on the home page the first link is lit again
    };
  }, [pathname]);

  const activeLink = pathname === "/" ? active : null;

  const onPillMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mxp.set(e.clientX - r.left);
    myp.set(e.clientY - r.top);
  };

  const menuOpen = openId && openId !== "search" ? openId : null;
  const litId = hovered ?? menuOpen;
  const searchOpen = openId === "search";

  // the chat app has its own top bar
  if (pathname.startsWith("/chat")) return null;

  return (
    <MotionConfig reducedMotion="user">
      {/* dim + blur the page behind the search panel and mobile menu */}
      <AnimatePresence>
        {(searchOpen || mobileOpen) && (
          <motion.div
            key="scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeAll}
            className="fixed inset-0 z-40 bg-[#0f1030]/10 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <header id="navbar" className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-10 sm:pt-4 lg:px-16 xl:px-24 2xl:px-32">
        <motion.div
          ref={navRef}
          variants={BAR}
          initial="hidden"
          animate="show"
          onPointerMove={onPillMove}
          onPointerEnter={(e) => e.pointerType === "mouse" && hoverMV.set(1)}
          onPointerLeave={() => hoverMV.set(0)}
          style={{ transformPerspective: 1000, transformOrigin: "50% 0%" }}
          className="pointer-events-auto relative w-full"
        >
          {/* glass pill background (clipped) */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden rounded-full border backdrop-blur-xl transition-all duration-500 ${
              scrolled
                ? "border-white bg-white/85 shadow-[0_24px_60px_-18px_rgba(79,70,229,0.5),inset_0_-10px_20px_-12px_rgba(99,102,241,0.22)]"
                : "border-white/80 bg-white/65 shadow-[0_18px_50px_-20px_rgba(79,70,229,0.35),inset_0_-10px_20px_-12px_rgba(99,102,241,0.18)]"
            }`}
          >
            <span className="absolute inset-x-6 top-0 h-1/2 rounded-b-[100%] bg-gradient-to-b from-white/90 to-transparent opacity-70" />
            <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <motion.span className="absolute inset-0" style={{ background: spot, opacity: glow }} />
            <motion.span
              className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ x: ["-150%", "520%"] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 7, ease: "easeInOut" }}
            />
            <motion.span
              className={`absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 transition-opacity duration-500 ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{ scaleX: progress }}
            />
          </div>

          <nav
            aria-label="Primary"
            className={`relative flex items-center justify-between gap-2 px-3 transition-[padding] duration-500 sm:px-4 lg:px-6 xl:px-8 ${
              scrolled ? "py-1.5" : "py-2.5"
            }`}
          >
            <motion.div variants={POP}>
              <Brand />
            </motion.div>

            <motion.ul
              variants={LIST}
              onPointerLeave={() => setHovered(null)}
              className="hidden items-center gap-0.5 lg:flex"
            >
              {NAV.map((item) => (
                <NavEntry
                  key={item.id}
                  item={item}
                  active={activeLink}
                  lit={litId === item.id}
                  open={openId === item.id}
                  onHover={setHovered}
                  onOpen={openMenu}
                  onScheduleClose={scheduleClose}
                  onClose={closeAll}
                  onActivate={setActive}
                />
              ))}
            </motion.ul>

            <motion.div variants={POP} className="flex items-center gap-1.5 sm:gap-2.5">
              <SearchButton open={searchOpen} onClick={toggleSearch} />
              <div className="hidden items-center gap-2.5 lg:flex">
                <CtaButton />
              </div>
              <motion.button
                type="button"
                onClick={toggleMobile}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1b1b3a] shadow-md ring-1 ring-white transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "x" : "menu"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </nav>

          {/* search panel */}
          <AnimatePresence>
            {searchOpen && (
              <div
                key="search"
                className="absolute left-1/2 top-full z-50 w-[min(38rem,100%)] -translate-x-1/2 pt-3"
              >
                <SearchPanel onClose={closeAll} />
              </div>
            )}
          </AnimatePresence>

          {/* mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <div key="mobile" className="absolute inset-x-0 top-full z-50 pt-3 lg:hidden">
                <MobileMenu
                  active={activeLink}
                  onNavigate={closeAll}
                  onActivate={setActive}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </MotionConfig>
  );
}