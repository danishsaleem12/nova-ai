//src/components/ChatApp.js

"use client";

/**
 * ChatApp — the /chat page (opened by "Try it now" on /product/ai-chat).
 *
 * Same visual language as ProductPage / Hero / AISuite:
 * drifting aurora + blobs + glass spheres, extruded 3D headings, glossy
 * glass panels, tilt-on-hover cards with glare, magnetic buttons.
 *
 * Self-contained (helpers are duplicated on purpose, like your other files).
 *
 * Talks to the backend: getReply() streams the answer from POST /api/chat.
 * Chats are saved in the visitor's browser (localStorage), no account needed.
 * The DATA block (MODELS) is the model list shown in the picker.
 *
 * Features
 *  - Sidebar: nav, conversation list (select / delete / search)
 *  - Top bar: search (filters conversations), back-to-home link
 *  - Welcome state with suggestion pills, streamed replies with typing dots,
 *    stop / regenerate / copy, code blocks, attachments chips
 *  - Enter to send, Shift+Enter for a new line, Esc closes menus
 *  - Mobile: sidebar becomes a slide-over drawer
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Compass,
  Copy,
  FolderOpen,
  Grid2x2,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

// Placeholder model list. Replace with the real models from the backend.
const MODELS = [
  { id: "nova-pro", name: "Nova Pro", note: "Deepest reasoning" },
  { id: "nova-fast", name: "Nova Fast", note: "Quickest replies" },
];

const NAV = [
  { icon: MessageCircle, label: "AI Chat", href: "/chat", active: true },
  { icon: Grid2x2, label: "AI Tools", href: "/ai-tools/ai-writer" },
  { icon: Compass, label: "Agents", href: "/agents/research-agent" },
  { icon: FolderOpen, label: "Workspace", href: "/#workspace" },
  { icon: BookOpen, label: "Resources", href: "/resources/documentation" },
];

const SUGGESTIONS = [
  { label: "Write a blog post about AI trends", prompt: "Write a blog post about AI trends" },
  { label: "Create a marketing plan", prompt: "Create a marketing plan" },
  { label: "Help me with code", prompt: "Help me with code" },
  { label: "Summarize a document", prompt: "Summarize the key points of this text:\n\n" },
];

// Chat modes, opened with /chat?mode=code | docs | voice from the product pages.
// The backend adds matching instructions for the same keys (see chat.controller.js).
const MODES = {
  code: {
    label: "Code mode",
    intro: "Paste or attach code and I'll explain it, debug it, review it or help you write more.",
    placeholder: "Paste code or describe what you want to build...",
    suggestions: [
      { label: "Explain this code", prompt: "Explain what this code does, step by step:\n\n" },
      { label: "Find the bug", prompt: "Find the bug in this code and show the fix:\n\n" },
      { label: "Refactor it", prompt: "Refactor this code to be cleaner and easier to read:\n\n" },
      { label: "Write unit tests", prompt: "Write unit tests for this code:\n\n" },
    ],
  },
  docs: {
    label: "Documents mode",
    intro: "Attach a text file (.txt, .md, .csv…) or paste text, then summarize it, ask questions or rewrite it.",
    placeholder: "Paste text, or attach a file and ask a question about it...",
    suggestions: [
      { label: "Summarize this", prompt: "Summarize this in 5 bullet points:\n\n" },
      { label: "Pull out action items", prompt: "List every action item and deadline in this text:\n\n" },
      { label: "Make it clearer", prompt: "Rewrite this to be clearer and more concise:\n\n" },
      { label: "Proofread", prompt: "Proofread this and list the corrections you made:\n\n" },
    ],
  },
  voice: {
    label: "Voice mode",
    intro: "Tap the mic and speak. Replies are read aloud (needs a browser with speech support, such as Chrome or Edge).",
    placeholder: "Tap the mic and talk, or type here...",
    suggestions: [
      { label: "Tell me a fun fact", prompt: "Tell me a fun fact." },
      { label: "Plan my day", prompt: "Help me plan my day." },
      { label: "Quiz me on history", prompt: "Quiz me with a few quick history questions, one at a time." },
    ],
  },
};

/* ---------------------------------------------------------------------- */
/* Voice: uses the browser's built-in speech APIs (no extra server needed) */
/* Dictation: SpeechRecognition (Chrome, Edge, Safari). Read aloud:        */
/* speechSynthesis (all major browsers).                                   */
/* ---------------------------------------------------------------------- */

const getSpeechRecognition = () =>
  typeof window === "undefined" ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null;

/** Strips markdown so replies sound natural when read aloud. */
function plainForSpeech(md) {
  return String(md || "")
    .replace(/```[\s\S]*?```/g, " (code block skipped) ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[*_~>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speakText(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const clean = plainForSpeech(text).slice(0, 4000);
  if (!clean) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = navigator.language || "en-US";
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
  return true;
}

/** Which voice features this browser has. Starts false so server and client render the same. */
const noSubscribe = () => () => {};
function useVoiceSupport() {
  const stt = useSyncExternalStore(noSubscribe, () => Boolean(getSpeechRecognition()), () => false);
  const tts = useSyncExternalStore(noSubscribe, () => "speechSynthesis" in window, () => false);
  return useMemo(() => ({ stt, tts }), [stt, tts]);
}

const uid = () => Math.random().toString(36).slice(2, 10);

// Chat ids are UUIDs (used as the key when a chat is saved in localStorage).
const newChatId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const h = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${h(8)}-${h(4)}-4${h(3)}-${["8", "9", "a", "b"][Math.floor(Math.random() * 4)]}${h(3)}-${h(12)}`;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ---------------------------------------------------------------------- */
/* Attachments: text files only                                            */
/* The file is read in the browser and its text is sent with the message.  */
/* (PDF / Word / images need server-side parsing or a vision model.)       */
/* ---------------------------------------------------------------------- */

const TEXT_EXTENSIONS = [
  "txt", "md", "markdown", "csv", "tsv", "json", "log", "xml", "yml", "yaml", "toml", "ini", "env",
  "html", "css", "js", "jsx", "ts", "tsx", "py", "java", "c", "h", "cpp", "cs", "go", "rs", "rb",
  "php", "sh", "sql", "swift", "kt", "r",
];
const FILE_ACCEPT = TEXT_EXTENSIONS.map((e) => `.${e}`).join(",");
const MAX_ATTACHMENTS = 6;
const MAX_FILE_BYTES = 200 * 1024; // refuse bigger files
const MAX_FILE_CHARS = 30000; // text kept per file (the backend enforces the same limit)
const MAX_ATTACH_CHARS_TOTAL = 60000; // text sent per request, newest files first

/** Reads one picked file. Returns { text, truncated } or { error }. */
async function readTextAttachment(file) {
  const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (!TEXT_EXTENSIONS.includes(ext)) {
    return { error: `${file.name}: only text files are supported for now (.txt, .md, .csv, .json, code…).` };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: `${file.name} is too large (max ${MAX_FILE_BYTES / 1024} KB).` };
  }
  let text;
  try {
    text = await file.text();
  } catch {
    return { error: `Couldn't read ${file.name}.` };
  }
  if (text.includes("\u0000")) return { error: `${file.name} doesn't look like a text file.` };
  if (!text.trim()) return { error: `${file.name} is empty.` };
  const truncated = text.length > MAX_FILE_CHARS;
  return { text: truncated ? text.slice(0, MAX_FILE_CHARS) : text, truncated };
}

/** Attachments to send with each message: text only, within the total budget (newest first). */
function withAttachmentText(messages) {
  let budget = MAX_ATTACH_CHARS_TOTAL;
  const out = new Array(messages.length);
  for (let i = messages.length - 1; i >= 0; i--) {
    const { role, content, attachments } = messages[i];
    const files = [];
    if (role === "user") {
      for (const a of attachments || []) {
        if (!a.text || budget <= 0) continue;
        const text = a.text.slice(0, budget);
        budget -= text.length;
        files.push({ name: a.name, text });
      }
    }
    out[i] = { role, content, ...(files.length ? { attachments: files } : {}) };
  }
  return out;
}

async function* getReply(messages, { signal, model, mode }) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model?.id,
      ...(mode ? { mode } : {}),
      messages: withAttachmentText(messages),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

const makeTitle = (s) => {
  const t = (s || "New Chat").trim().replace(/\s+/g, " ");
  return t.length > 34 ? `${t.slice(0, 34)}…` : t;
};

/* ---- Saved chats (kept in this browser, no account needed) ---------------- */

const STORAGE_KEY = "novaai_chats_v1";
const MAX_STORED_CHATS = 100;

function readStoredChats() {
  try {
    const list = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(list)) return [];
    return list
      .filter((c) => c && typeof c.id === "string" && Array.isArray(c.messages))
      .map((c) => ({ id: c.id, title: c.title || "New Chat", messages: c.messages }));
  } catch {
    return [];
  }
}

function writeStoredChats(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED_CHATS)));
    return true;
  } catch {
    return false;
  }
}

/* ====================================================================== */
/* 3D + motion helpers (same as ProductPage.js)                            */
/* ====================================================================== */

const extrude = (d, color = "#cfd6f8") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(59,91,255,0.2)`;

const TEXT_3D = extrude(0.7);
const TEXT_3D_LIFT = extrude(1.6);
const TILT_SPRING = { stiffness: 220, damping: 18 };

const GLASS =
  "border border-white/80 bg-white/60 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)] backdrop-blur-xl";

const pop = (delay = 0) => ({
  initial: { opacity: 0, y: 30, rotateX: -20, transformPerspective: 1000 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

function useClickAway(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    const onKey = (e) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, handler, active]);
}

/** Card that tilts toward the mouse, lifts, and shows a moving glare. */
function Tilt({
  children,
  className = "",
  cardClassName = "",
  max = 8,
  lift = 8,
  scale = 1.02,
  glare = false,
  outerProps,
}) {
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
    <motion.div className={className} {...(outerProps || pop())}>
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
    </motion.div>
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
    <motion.div onPointerMove={onMove} onPointerLeave={onLeave} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
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
      animate={{ y: [0, -22, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: bob, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Sparkle4({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LogoMark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="chat-logo-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="chat-logo-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#chat-logo-a)" />
      <path d="M12 14.6 L14.1 20 H9.9 Z" fill="url(#chat-logo-b)" />
    </svg>
  );
}

/** Soft sheen + glow, clipped to its rounded parent. Parent must be `relative`. */
function PanelDecor({ a = "bg-violet-300/30", b = "bg-sky-300/30" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent" />
      <span className={`absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl ${a}`} />
      <span className={`absolute -bottom-20 -left-16 h-52 w-52 rounded-full blur-3xl ${b}`} />
    </div>
  );
}

/* ====================================================================== */
/* Background: aurora, blobs, bubbles, particles                           */
/* ====================================================================== */

const PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  left: (i * 47 + 11) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 1.1) % 9,
  duration: 12 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my }) {
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(129,140,248,0.2), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-[130vmax] w-[130vmax] flex-none opacity-35 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(196,181,253,0.7), rgba(125,211,252,0.6), rgba(249,168,212,0.5), rgba(196,181,253,0.7))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <ParallaxLayer mx={mx} my={my} depth={30} className="absolute -left-24 top-10">
        <motion.div
          className="h-[26rem] w-[26rem] rounded-full bg-violet-300/40 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-44} className="absolute -right-32 top-[30%]">
        <motion.div
          className="h-[32rem] w-[32rem] rounded-full bg-sky-300/45 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute bottom-10 left-1/3">
        <motion.div
          className="h-[22rem] w-[22rem] rounded-full bg-pink-300/35 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] ${p.tint}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -900], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -left-6 bottom-24 hidden md:block">
        <Bubble size={84} tone="cyan" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={38} className="absolute right-[3%] top-[14%] hidden md:block">
        <Bubble size={30} tone="pink" delay={0.8} bob={7} />
      </ParallaxLayer>

      {[
        { pos: "left-[24%] top-[3%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[30%] top-[5%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "right-[2%] bottom-[10%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
      ].map((s) => (
        <motion.span
          key={s.pos}
          className={`absolute ${s.pos} ${s.color}`}
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
/* Top bar                                                                 */
/* ====================================================================== */

function Brand() {
  return (
    <motion.a
      href="/"
      aria-label="NovaAI home"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="group flex items-center gap-2 rounded-full py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-[0_8px_20px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)_scale(1.08)]">
        <LogoMark className="h-6 w-6" />
      </span>
      <span className="text-[22px] font-extrabold leading-none tracking-tight">
        <span className="text-[#0f1030]" style={{ textShadow: "1px 1px 0 #cfd6f8, 2px 2px 6px rgba(59,91,255,0.22)" }}>
          Nova
        </span>
        <span
          className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent"
          style={{ filter: "drop-shadow(0 3px 4px rgba(79,70,229,0.3))" }}
        >
          AI
        </span>
      </span>
    </motion.a>
  );
}

function HomeLink() {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full border border-white bg-white/90 px-3.5 py-2 text-[13px] font-semibold text-[#0f1030] shadow-[0_10px_24px_-12px_rgba(79,70,229,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <ArrowLeft className="h-4 w-4 text-indigo-500" />
        <span className="hidden sm:inline">Back to home</span>
        <span className="sm:hidden">Home</span>
      </Link>
    </motion.div>
  );
}

function TopBar({ query, setQuery, onOpenDrawer }) {
  return (
    <motion.header
      {...pop(0.05)}
      className={`relative z-30 flex items-center justify-between gap-3 rounded-3xl px-3 py-2 sm:px-4 ${GLASS}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute inset-x-6 top-0 h-1/2 rounded-b-[100%] bg-gradient-to-b from-white/90 to-transparent opacity-70" />
      </div>

      <div className="relative flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open conversations"
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1b1b3a] shadow-md ring-1 ring-white outline-none transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
        <Brand />
      </div>

      <div className="relative flex items-center gap-2 sm:gap-3">
        <label className="hidden h-10 w-64 items-center gap-2 rounded-full border border-white bg-white/90 px-4 shadow-sm transition-shadow focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25)] sm:flex">
          <Search className="h-4 w-4 shrink-0 text-indigo-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            aria-label="Search conversations"
            className="w-full bg-transparent text-[13px] text-[#0f1030] outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </label>

        <HomeLink />
      </div>
    </motion.header>
  );
}

/* ====================================================================== */
/* Sidebar                                                                 */
/* ====================================================================== */

function Sidebar({ variant = "desktop", chats, activeId, onSelect, onNew, onRemove, query, setQuery, onClose }) {
  const pfx = variant === "mobile" ? "m" : "d";

  return (
    <div className={`relative flex h-full w-full flex-col rounded-[28px] p-3 ${GLASS}`}>
      <PanelDecor a="bg-sky-300/30" b="bg-violet-300/30" />

      {variant === "mobile" && (
        <div className="relative mb-3 flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversations"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1b1b3a] shadow-md ring-1 ring-white outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {variant === "mobile" && (
        <label className="relative mb-3 flex h-10 items-center gap-2 rounded-full border border-white bg-white/90 px-4 shadow-sm focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25)]">
          <Search className="h-4 w-4 shrink-0 text-indigo-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            aria-label="Search conversations"
            className="w-full bg-transparent text-[13px] text-[#0f1030] outline-none placeholder:text-gray-400"
          />
        </label>
      )}

      <nav aria-label="App" className="relative shrink-0">
        <ul className="space-y-1">
          {NAV.map(({ icon: Icon, label, href, active }) => (
            <li key={label}>
              <motion.a
                href={href}
                aria-current={active ? "page" : undefined}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`group/nav relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  active
                    ? "bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-600 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.5)] ring-1 ring-white"
                    : "text-[#2b2e4a] hover:bg-white/80 hover:text-indigo-600"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-700 group-hover/nav:[transform:perspective(300px)_rotateY(360deg)]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative mt-4 flex shrink-0 items-center justify-between border-t border-indigo-100/70 px-2 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Conversations</span>
        <motion.button
          type="button"
          onClick={onNew}
          aria-label="New chat"
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      <ul className="relative mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {chats.map((c) => {
          const isActive = c.id === activeId;
          return (
            <li key={c.id} className="group/chat relative">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={isActive ? "true" : undefined}
                className="relative flex w-full items-center gap-2.5 rounded-xl py-2 pl-3 pr-9 text-left text-[12.5px] font-medium text-[#2b2e4a] outline-none transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {isActive && (
                  <motion.span
                    layoutId={`${pfx}-chat-active`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.4)] ring-1 ring-indigo-100"
                  />
                )}
                <MessageSquare className={`relative h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-500" : "text-gray-400"}`} />
                <span className="relative truncate">{c.title}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                aria-label={`Delete ${c.title}`}
                className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 opacity-0 outline-none transition hover:bg-rose-50 hover:text-rose-500 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-300 group-hover/chat:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
        {!chats.length && (
          <li className="px-3 py-6 text-center text-xs text-gray-500">No chats match &ldquo;{query}&rdquo;.</li>
        )}
      </ul>
    </div>
  );
}

/* ====================================================================== */
/* Model select                                                            */
/* ====================================================================== */

function ModelSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickAway(ref, close, open);

  return (
    <div ref={ref} className="relative z-20">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 rounded-full border border-white bg-white/90 py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-semibold text-[#0f1030] shadow-[0_10px_24px_-12px_rgba(79,70,229,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
          <LogoMark className="h-4 w-4" />
        </span>
        {value.name}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="text-gray-400">
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -10, rotateX: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ transformPerspective: 900, transformOrigin: "0% 0%" }}
            className="absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_30px_70px_-24px_rgba(79,70,229,0.55)] backdrop-blur-2xl"
          >
            {MODELS.map((m) => {
              const selected = m.id === value.id;
              return (
                <li key={m.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(m);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:bg-indigo-50 ${
                      selected ? "bg-indigo-50" : "hover:bg-indigo-50/70"
                    }`}
                  >
                    <span>
                      <span className="block text-[13px] font-semibold text-[#0f1030]">{m.name}</span>
                      <span className="block text-[11px] text-gray-500">{m.note}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 text-indigo-500" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ====================================================================== */
/* Welcome (empty chat)                                                    */
/* ====================================================================== */

/** Words flip up in 3D, look extruded, and tilt on hover. */
function Heading3D({ tokens, className = "" }) {
  let wordIndex = 0;
  const label = tokens.map((tok) => tok.text).join(" ");

  return (
    <h1 className={className} aria-label={label}>
      {tokens.map((tok, i) => {
        const idx = wordIndex++;

        if (tok.emoji) {
          return (
            <span key={i} aria-hidden className="inline-block">
              <motion.span
                className="inline-block origin-[70%_70%]"
                initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: [0, 18, -8, 14, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.2 + idx * 0.1 },
                  scale: { duration: 0.6, delay: 0.2 + idx * 0.1, ease: EASE },
                  rotate: { duration: 2, delay: 0.9, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" },
                }}
              >
                {tok.text}
              </motion.span>
            </span>
          );
        }

        const hoverShadow = tok.gradient
          ? { filter: "drop-shadow(0 12px 14px rgba(79,70,229,0.45))" }
          : { textShadow: TEXT_3D_LIFT };

        return (
          <span key={i} aria-hidden className="mr-[0.25em] inline-block">
            <motion.span
              className={`inline-block cursor-default ${
                tok.gradient ? `bg-gradient-to-r ${tok.gradient} bg-clip-text text-transparent` : ""
              }`}
              initial={{ opacity: 0, rotateX: -85, y: 34 }}
              animate={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: { duration: 0.85, delay: 0.2 + idx * 0.1, ease: EASE },
              }}
              whileHover={{
                y: -8,
                rotateX: 12,
                rotateY: -10,
                ...hoverShadow,
                transition: { type: "spring", stiffness: 300, damping: 14 },
              }}
              style={{
                transformPerspective: 700,
                transformOrigin: "50% 100%",
                ...(tok.gradient
                  ? { filter: "drop-shadow(0 6px 8px rgba(79,70,229,0.3))" }
                  : { textShadow: TEXT_3D }),
              }}
            >
              {tok.text}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}

function SparkOrb({ mx, my }) {
  const rotateY = useTransform(mx, [-1, 1], [-18, 18]);
  const rotateX = useTransform(my, [-1, 1], [14, -14]);

  return (
    <div style={{ perspective: 800 }} aria-hidden>
      <motion.div className="relative mx-auto h-16 w-16" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <motion.div
          className="relative h-full w-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -inset-[35%] rounded-full bg-gradient-to-br from-blue-500 to-violet-600 opacity-35 blur-2xl" />
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border border-white/80"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 24%, #b7c6ff 56%, #8b7cf6 84%, #6d5ae0 100%)",
              boxShadow:
                "inset -8px -10px 18px rgba(60,40,180,0.4), inset 5px 5px 12px rgba(255,255,255,0.85), 0 14px 30px rgba(99,102,241,0.45)",
            }}
          >
            <motion.div
              className="absolute -inset-[25%] opacity-60 mix-blend-soft-light"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.95), transparent 35%, rgba(244,114,182,0.7), transparent 70%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="relative h-7 w-7 text-white drop-shadow-md" strokeWidth={1.8} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Welcome({ mx, my, onPick, name, mode }) {
  const cfg = mode ? MODES[mode] : null;
  const suggestions = cfg ? cfg.suggestions : SUGGESTIONS;
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 text-center" style={{ perspective: 1000 }}>
      <SparkOrb mx={mx} my={my} />

      <Heading3D
        className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#0f1030] sm:text-4xl"
        tokens={[
          { text: "Hello" },
          { text: name, gradient: "from-blue-500 to-violet-600" },
          { text: "👋", emoji: true },
        ]}
      />

      <motion.p {...pop(0.55)} className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
        {cfg ? cfg.intro : "Ask me anything, get creative, or solve problems. I'm here to help you."}
      </motion.p>

      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-3" style={{ perspective: 1200 }}>
        {suggestions.map((s, i) => (
          <Tilt
            key={s.label}
            max={10}
            lift={4}
            scale={1.04}
            glare
            outerProps={pop(0.7 + i * 0.08)}
            cardClassName="rounded-full border border-white bg-white/90 shadow-[0_10px_26px_-12px_rgba(79,70,229,0.5)]"
          >
            <button
              type="button"
              onClick={() => onPick(s.prompt)}
              className="group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-medium text-indigo-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {s.label}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Tilt>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Messages                                                                */
/* ====================================================================== */

function inline(str) {
  return str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[#0f1030]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      return (
        <code key={i} className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[12px] text-indigo-600">
          {seg.slice(1, -1)}
        </code>
      );
    }
    return seg;
  });
}

function Prose({ text }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(b)}
          </p>
        );
      })}
    </>
  );
}

function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, [text]);
  return [copied, copy];
}

function CodeBlock({ lang, code }) {
  const [copied, copy] = useCopy(code);
  return (
    <div className="overflow-hidden rounded-2xl border border-white bg-[#0f1030] shadow-[0_18px_40px_-18px_rgba(15,16,48,0.6)]">
      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          {lang && <span className="ml-2 text-[11px] font-medium text-gray-400">{lang}</span>}
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium text-gray-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-gray-200">
        <code>{code.replace(/\n$/, "")}</code>
      </pre>
    </div>
  );
}

/** Renders text with ``` code fences, lists, **bold** and `inline code`. */
function Rich({ text }) {
  const parts = text.split(/```([\w-]*)\n?([\s\S]*?)(?:```|$)/g);
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i] && parts[i].trim()) out.push(<Prose key={`p${i}`} text={parts[i]} />);
    if (i + 2 < parts.length) out.push(<CodeBlock key={`c${i}`} lang={parts[i + 1]} code={parts[i + 2]} />);
  }
  return <div className="space-y-3">{out}</div>;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1.5" role="status" aria-label="NovaAI is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-br from-sky-400 to-violet-500"
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const MSG_ENTER = {
  initial: { opacity: 0, y: 24, rotateX: -18, scale: 0.97, transformPerspective: 1000 },
  animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
  transition: { duration: 0.6, ease: EASE },
};

function Message({ msg, showRegenerate, onRegenerate }) {
  const [copied, copy] = useCopy(msg.content);
  const { tts } = useVoiceSupport();
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => setSpeaking(false), []);
  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else if (speakText(msg.content, () => setSpeaking(false))) {
      setSpeaking(true);
    }
  };

  if (msg.role === "user") {
    return (
      <motion.div {...MSG_ENTER} className="flex justify-end" style={{ transformOrigin: "100% 100%" }}>
        <div className="max-w-[85%] space-y-2">
          {msg.attachments?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {msg.attachments.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex max-w-[12rem] items-center gap-1.5 rounded-full border border-white bg-white/90 px-2.5 py-1 text-[11px] font-medium text-indigo-600 shadow-sm"
                >
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="truncate">{a.name}</span>
                </span>
              ))}
            </div>
          )}
          {msg.content && (
            <div className="whitespace-pre-wrap rounded-3xl rounded-tr-lg bg-gradient-to-br from-blue-500 to-violet-600 px-4 py-3 text-[13.5px] leading-relaxed text-white shadow-[0_16px_34px_-14px_rgba(79,70,229,0.75)]">
              {msg.content}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...MSG_ENTER} className="flex items-start gap-3" style={{ transformOrigin: "0% 100%" }}>
      <span
        aria-hidden
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80"
        style={{
          background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 30%, #b7c6ff 65%, #8b7cf6 100%)",
          boxShadow: "inset -4px -5px 9px rgba(60,40,180,0.3), 0 8px 18px rgba(99,102,241,0.35)",
        }}
      >
        <Sparkles className="h-4 w-4 text-white drop-shadow" />
      </span>

      <div className="min-w-0 max-w-[88%]">
        <div
          className={`rounded-3xl rounded-tl-lg border bg-white/85 px-4 py-3 text-[13.5px] leading-relaxed shadow-[0_14px_34px_-16px_rgba(79,70,229,0.4)] backdrop-blur ${
            msg.error ? "border-rose-200 text-rose-600" : "border-white text-[#1b1b3a]"
          }`}
        >
          {msg.content ? <Rich text={msg.content} /> : <TypingDots />}
          {msg.pending && msg.content && (
            <motion.span
              aria-hidden
              className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-indigo-500 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        {!msg.pending && msg.content && (
          <div className="mt-1.5 flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-500 outline-none transition-colors hover:bg-white hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {tts && (
              <button
                type="button"
                onClick={toggleSpeak}
                aria-pressed={speaking}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-500 outline-none transition-colors hover:bg-white hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {speaking ? <Square className="h-3 w-3 fill-current" /> : <Volume2 className="h-3 w-3" />}
                {speaking ? "Stop" : "Listen"}
              </button>
            )}
            {showRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-500 outline-none transition-colors hover:bg-white hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* Composer (input bar)                                                    */
/* ====================================================================== */

function Composer({ value, setValue, onSend, onStop, generating, attachments, setAttachments, taRef, onError, placeholder }) {
  const fileRef = useRef(null);
  const { stt } = useVoiceSupport();
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);

  // Dictation: speech is turned into text in the box; you still press Send.
  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return onError?.("Voice input isn't supported in this browser. Try Chrome, Edge or Safari.");
    stopSpeaking(); // don't listen to our own voice
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    const base = value ? `${value.replace(/\s+$/, "")} ` : "";
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setValue(base + t);
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        onError?.("Microphone access is blocked. Allow it in your browser's site settings and try again.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        onError?.(`Voice input stopped (${e.error}).`);
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };
  useEffect(() => () => recRef.current?.abort(), []);
  const handleSend = () => {
    recRef.current?.stop();
    onSend();
  };
  const canSend = value.trim().length > 0 || attachments.length > 0;

  // auto-grow the textarea up to a max height
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value, taRef]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!generating) handleSend();
    }
  };

  const onFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // lets the same file be picked again later
    if (!picked.length) return;

    const room = Math.max(0, MAX_ATTACHMENTS - attachments.length);
    if (room === 0) return onError?.(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);

    const added = [];
    const problems = [];
    for (const f of picked.slice(0, room)) {
      const r = await readTextAttachment(f);
      if (r.error) problems.push(r.error);
      else {
        added.push({ id: uid(), name: f.name, text: r.text, truncated: r.truncated });
        if (r.truncated) problems.push(`${f.name} is long: only the first ${MAX_FILE_CHARS.toLocaleString()} characters will be used.`);
      }
    }
    if (picked.length > room) problems.push(`Only ${MAX_ATTACHMENTS} files fit in one message.`);

    if (added.length) setAttachments((prev) => [...prev, ...added].slice(0, MAX_ATTACHMENTS));
    if (problems.length) onError?.(problems.join(" "));
  };

  const seed = (prefix) => {
    setValue((v) => v || prefix);
    taRef.current?.focus();
  };

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3.5 py-1.5 text-[11.5px] font-medium text-[#2b2e4a] shadow-sm outline-none transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <input ref={fileRef} type="file" multiple hidden accept={FILE_ACCEPT} onChange={onFiles} />

      <motion.div
        {...pop(0.15)}
        className="rounded-3xl border border-white bg-white/90 shadow-[0_14px_30px_-14px_rgba(79,70,229,0.4)] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25),0_14px_30px_-14px_rgba(79,70,229,0.4)]"
      >
        <AnimatePresence initial={false}>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 px-4 pt-3">
                {attachments.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex max-w-[13rem] items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1 text-[11px] font-medium text-indigo-600"
                  >
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                      aria-label={`Remove ${a.name}`}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 outline-none hover:bg-indigo-100 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach text file"
            title="Attach text files (.txt, .md, .csv, .json, code)"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Paperclip className="h-[18px] w-[18px]" />
          </button>

          <textarea
            ref={taRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder || "Type your message here..."}
            aria-label="Message"
            className="max-h-40 min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[14px] leading-snug text-[#0f1030] outline-none placeholder:text-gray-400"
          />

          {stt && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              title={listening ? "Stop listening" : "Dictate with your microphone"}
              className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                listening ? "animate-pulse bg-rose-50 text-rose-500" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <Mic className="h-[18px] w-[18px]" />
            </button>
          )}

          <Magnetic strength={0.2} className="mb-0.5 shrink-0">
            <motion.button
              type="button"
              onClick={generating ? onStop : handleSend}
              disabled={!generating && !canSend}
              aria-label={generating ? "Stop generating" : "Send message"}
              whileHover={{ scale: 1.1, rotate: generating ? 0 : -8 }}
              whileTap={{ scale: 0.92 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 text-white shadow-[0_12px_26px_-8px_rgba(79,70,229,0.8)] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {canSend && !generating && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-indigo-400/50"
                  animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              {generating ? <Square className="relative h-3.5 w-3.5 fill-current" /> : <Send className="relative h-4 w-4" />}
            </motion.button>
          </Magnetic>
        </div>
      </motion.div>

      <motion.div {...pop(0.25)} className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Attach text files (.txt, .md, .csv, .json, code)"
          className={chip}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach File
        </button>
        <button type="button" onClick={() => seed("Write code that ")} className={chip}>
          <Code2 className="h-3.5 w-3.5" />
          Code
        </button>
      </motion.div>

      <p className="mt-2 text-center text-[10.5px] text-gray-400">
        NovaAI can make mistakes. Check important information.
      </p>
    </div>
  );
}

/* ====================================================================== */
/* Page                                                                    */
/* ====================================================================== */

const freshChat = () => ({ id: newChatId(), title: "New Chat", messages: [] });

export default function ChatApp() {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const aborts = useRef(new Map()); // chatId -> AbortController

  // Start on an empty draft chat. Saved chats are loaded from this browser below.
  // A draft is only saved once it gets its first reply.
  const [firstDraft] = useState(freshChat);
  const [chats, setChats] = useState(() => [firstDraft]);
  const [activeId, setActiveId] = useState(firstDraft.id);
  const [notice, setNotice] = useState("");
  const deletedIds = useRef(new Set()); // chats the user deleted (never re-save these)
  const [model, setModel] = useState(MODELS[0]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [busy, setBusy] = useState({}); // chatId -> true while generating

  // Mode from the URL (/chat?mode=code|docs|voice), set when you arrive from a product page
  const [mode, setMode] = useState(null);
  useEffect(() => {
    // Read once after mount: the URL is not known while rendering on the server, and reading
    // it during render would make the server and browser HTML differ (hydration mismatch).
    const m = new URLSearchParams(window.location.search).get("mode");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m && Object.hasOwn(MODES, m)) setMode(m);
  }, []);
  const leaveMode = () => {
    setMode(null);
    window.history.replaceState(null, "", window.location.pathname);
  };
  useEffect(() => () => stopSpeaking(), []);

  // mouse parallax for the background
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const activeChat = chats.find((c) => c.id === activeId) || chats[0];
  const messages = activeChat?.messages ?? [];
  const lastMsg = messages[messages.length - 1];
  const generating = Boolean(activeChat && busy[activeChat.id]);

  const q = query.trim().toLowerCase();
  const visibleChats = q
    ? chats.filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)))
    : chats;

  // stop everything if the page unmounts
  useEffect(() => {
    const map = aborts.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  // keep the newest message in view while streaming
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeChat?.id, messages.length, lastMsg?.content]);

  const focusInput = () => setTimeout(() => taRef.current?.focus(), 60);

  // ---- Saved conversations -------------------------------------------------

  // Load the chats saved in this browser once. Anything already in state (the draft, or a chat
  // started before this ran) stays on top.
  useEffect(() => {
    const stored = readStoredChats();
    if (!stored.length) return;
    // Browser-only data (localStorage) can only be read after mount; reading it during render
    // would make the server and browser HTML differ (hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChats((prev) => {
      const known = new Set(stored.map((c) => c.id));
      return [...prev.filter((c) => !known.has(c.id)), ...stored];
    });
  }, []);

  // auto-hide the small error toast
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // Save (create or replace) one chat in this browser. Called after each reply finishes.
  const saveChat = useCallback((chatId, title, msgs) => {
    if (deletedIds.current.has(chatId)) return;
    const clean = msgs
      // an empty assistant bubble (stopped before any text) is not worth keeping
      .filter((m) => !(m.role === "assistant" && !m.content && !m.error))
      .map(({ id, role, content, error, attachments }) => ({
        id,
        role,
        content,
        ...(error ? { error: true } : {}),
        ...(attachments?.length ? { attachments: attachments.map(({ id, name }) => ({ id, name })) } : {}), // names only, never file text
      }));
    const rest = readStoredChats().filter((c) => c.id !== chatId);
    const ok = writeStoredChats([{ id: chatId, title, messages: clean }, ...rest]);
    if (!ok) setNotice("Couldn't save this chat in your browser. Your latest messages may be lost on refresh.");
  }, []);

  /** Runs one assistant reply for `chatId`, streaming into message `botId`. */
  const run = useCallback(
    async (chatId, botId, history, title) => {
      const ctrl = new AbortController();
      aborts.current.set(chatId, ctrl);
      setBusy((b) => ({ ...b, [chatId]: true }));

      const patch = (fn) =>
        setChats((prev) =>
          prev.map((c) =>
            c.id !== chatId ? c : { ...c, messages: c.messages.map((m) => (m.id === botId ? fn(m) : m)) }
          )
        );

      let reply = ""; // full text so far, used to save the finished chat
      let failed = false;

      try {
        for await (const chunk of getReply(history, { signal: ctrl.signal, model, mode })) {
          reply += chunk;
          patch((m) => ({ ...m, content: m.content + chunk }));
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          failed = true;
          patch((m) => ({ ...m, error: true, content: m.content || "Something went wrong. Please try again." }));
        }
        // In voice mode the finished reply is read aloud automatically
        if (mode === "voice" && reply) speakText(reply);
      } finally {
        patch((m) => ({ ...m, pending: false }));
        saveChat(chatId, title, [
          ...history,
          {
            id: botId,
            role: "assistant",
            content: reply || (failed ? "Something went wrong. Please try again." : ""),
            error: failed,
          },
        ]);
        aborts.current.delete(chatId);
        setBusy((b) => {
          const next = { ...b };
          delete next[chatId];
          return next;
        });
      }
    },
    [model, mode, saveChat]
  );

  const send = useCallback(
    (override) => {
      const content = (typeof override === "string" ? override : text).trim();
      const files = typeof override === "string" ? [] : attachments;
      if ((!content && files.length === 0) || !activeChat || busy[activeChat.id]) return;

      stopSpeaking();
      const chatId = activeChat.id;
      const userMsg = {
        id: uid(),
        role: "user",
        content,
        // `text` stays in memory so follow-up questions still include the file; it is never saved
        attachments: files.map(({ id, name, text, truncated }) => ({ id, name, text, truncated })),
      };
      const botId = uid();
      const botMsg = { id: botId, role: "assistant", content: "", pending: true };
      const history = [...activeChat.messages, userMsg];
      const title = activeChat.messages.length === 0 ? makeTitle(content || files[0]?.name) : activeChat.title;

      setChats((prev) =>
        prev.map((c) =>
          c.id !== chatId
            ? c
            : {
                ...c,
                title,
                messages: [...c.messages, userMsg, botMsg],
              }
        )
      );
      setText("");
      if (typeof override !== "string") setAttachments([]);
      run(chatId, botId, history, title);
    },
    [text, attachments, activeChat, busy, run]
  );

  const stop = () => {
    if (activeChat) aborts.current.get(activeChat.id)?.abort();
  };

  const regenerate = () => {
    if (!activeChat || busy[activeChat.id]) return;
    const msgs = activeChat.messages;
    let lastUser = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUser = i;
        break;
      }
    }
    if (lastUser < 0) return;

    const history = msgs.slice(0, lastUser + 1);
    const botId = uid();
    setChats((prev) =>
      prev.map((c) =>
        c.id !== activeChat.id
          ? c
          : { ...c, messages: [...history, { id: botId, role: "assistant", content: "", pending: true }] }
      )
    );
    run(activeChat.id, botId, history, activeChat.title);
  };

  const newChat = () => {
    const empty = chats.find((c) => c.messages.length === 0);
    if (empty) {
      setActiveId(empty.id);
    } else {
      const c = freshChat();
      setChats((prev) => [c, ...prev]);
      setActiveId(c.id);
    }
    setQuery("");
    setDrawer(false);
    focusInput();
  };

  const selectChat = (id) => {
    setActiveId(id);
    setDrawer(false);
    focusInput();
  };

  const removeChat = (id) => {
    const target = chats.find((c) => c.id === id);
    // Drafts that never got a message were never saved, so there is nothing to delete.
    if (target && target.messages.length > 0) {
      deletedIds.current.add(id); // stops the aborted reply below from re-saving it
      writeStoredChats(readStoredChats().filter((c) => c.id !== id));
    }
    aborts.current.get(id)?.abort();
    const next = chats.filter((c) => c.id !== id);
    if (next.length === 0) {
      const c = freshChat();
      setChats([c]);
      setActiveId(c.id);
      return;
    }
    setChats(next);
    if (id === activeId) setActiveId(next[0].id);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate h-[100dvh] overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff]"
      >
        <Background mx={mx} my={my} />

        {notice && (
          <div
            role="status"
            className="fixed bottom-4 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-200 bg-white/95 px-4 py-2.5 text-sm text-red-700 shadow-lg backdrop-blur"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
              className="font-semibold text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col gap-3 p-2.5 sm:p-4">
          <TopBar
            query={query}
            setQuery={setQuery}
            onOpenDrawer={() => setDrawer(true)}
          />

          <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
            {/* desktop sidebar */}
            <motion.aside {...pop(0.15)} className="hidden w-[17rem] shrink-0 lg:block xl:w-[18.5rem]">
              <Sidebar
                variant="desktop"
                chats={visibleChats}
                activeId={activeChat?.id}
                onSelect={selectChat}
                onNew={newChat}
                onRemove={removeChat}
                query={query}
                setQuery={setQuery}
              />
            </motion.aside>

            {/* main chat panel */}
            <motion.main
              {...pop(0.25)}
              className={`relative flex min-h-0 min-w-0 flex-1 flex-col rounded-[28px] ${GLASS}`}
            >
              <PanelDecor />

              <div className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-2">
                  <ModelSelect value={model} onChange={setModel} />
                  {mode && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 py-1 pl-3 pr-1.5 text-[11.5px] font-semibold text-indigo-600">
                      {MODES[mode].label}
                      <button
                        type="button"
                        onClick={leaveMode}
                        aria-label={`Leave ${MODES[mode].label}`}
                        className="flex h-4 w-4 items-center justify-center rounded-full outline-none hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={newChat}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/90 px-3.5 py-2 text-[12.5px] font-semibold text-indigo-600 shadow-[0_10px_24px_-12px_rgba(79,70,229,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Chat
                </motion.button>
              </div>

              <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {messages.length === 0 ? (
                  <Welcome
                    key={activeChat?.id}
                    mx={mx}
                    my={my}
                    name="there"
                    mode={mode}
                    onPick={(p) => send(p)}
                  />
                ) : (
                  <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6" style={{ perspective: 1200 }}>
                    {messages.map((m) => (
                      <Message
                        key={m.id}
                        msg={m}
                        showRegenerate={!generating && m.id === lastAssistantId}
                        onRegenerate={regenerate}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative px-3 pb-3 pt-2 sm:px-6 sm:pb-4">
                <Composer
                  value={text}
                  setValue={setText}
                  onSend={() => send()}
                  onStop={stop}
                  generating={generating}
                  onError={setNotice}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  taRef={taRef}
                  placeholder={mode ? MODES[mode].placeholder : undefined}
                />
              </div>
            </motion.main>
          </div>
        </div>

        {/* mobile drawer */}
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                key="scrim"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setDrawer(false)}
                className="fixed inset-0 z-40 bg-[#0f1030]/20 backdrop-blur-[3px] lg:hidden"
              />
              <motion.div
                key="drawer"
                initial={{ x: "-108%" }}
                animate={{ x: 0 }}
                exit={{ x: "-108%" }}
                transition={{ duration: 0.4, ease: EASE }}
                className="fixed inset-y-0 left-0 z-50 w-[20rem] max-w-[88vw] p-2.5 lg:hidden"
              >
                <Sidebar
                  variant="mobile"
                  chats={visibleChats}
                  activeId={activeChat?.id}
                  onSelect={selectChat}
                  onNew={newChat}
                  onRemove={removeChat}
                  query={query}
                  setQuery={setQuery}
                  onClose={() => setDrawer(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}