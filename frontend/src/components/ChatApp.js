//src/components/ChatApp.js

"use client";

/**
 * ChatApp — the /chat page (opened by "Try it now" on /product/ai-chat).
 *
 * Frontend only. Same visual language as ProductPage / Hero / AISuite:
 * drifting aurora + blobs + glass spheres, extruded 3D headings, glossy
 * glass panels, tilt-on-hover cards with glare, magnetic buttons.
 *
 * Self-contained (helpers are duplicated on purpose, like your other files).
 *
 * BACKEND SEAM: everything the backend will replace is in two places:
 *   1. getReply()  — the async generator near the top. Right now it fakes a
 *      streamed answer. Later, fetch("/api/chat") and `yield` each text chunk.
 *   2. The DATA block (USER, MODELS, SEED chats) — swap for real user /
 *      model list / saved conversations.
 *
 * Features
 *  - Sidebar: nav, conversation list (select / delete / search), upgrade card
 *  - Top bar: search (filters conversations), notifications, user menu
 *  - Welcome state with suggestion pills, streamed replies with typing dots,
 *    stop / regenerate / copy, code blocks, attachments chips
 *  - Enter to send, Shift+Enter for a new line, Esc closes menus
 *  - Mobile: sidebar becomes a slide-over drawer
 */

import { useCallback, useEffect, useRef, useState } from "react";
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
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Compass,
  Copy,
  FolderOpen,
  Grid2x2,
  Image as ImageIcon,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  { icon: Grid2x2, label: "AI Tools", href: "#" },
  { icon: Compass, label: "Agents", href: "#" },
  { icon: FolderOpen, label: "Workspace", href: "#" },
  { icon: BookOpen, label: "Resources", href: "#" },
];

const SUGGESTIONS = [
  { label: "Write a blog post about AI trends", prompt: "Write a blog post about AI trends" },
  { label: "Create a marketing plan", prompt: "Create a marketing plan" },
  { label: "Help me with code", prompt: "Help me with code" },
  { label: "Generate an image", prompt: "Generate an image" },
];

const NOTIFICATIONS_UNREAD = true;

// Starting conversations (the first one is the empty "New Chat").
const SEED = [
  { id: "c-new", title: "New Chat", messages: [] },
  {
    id: "c-web",
    title: "Website Development Help",
    messages: [
      { id: "s1", role: "user", content: "How should I structure a Next.js landing page?" },
      {
        id: "s2",
        role: "assistant",
        content:
          "Start with a clear hero, then social proof, features, pricing and a closing call to action.\n\n- Keep every section in its own component\n- Put shared data in one file\n- Use a sticky navbar so people can jump between sections",
      },
    ],
  },
  {
    id: "c-mkt",
    title: "Marketing Strategy",
    messages: [
      { id: "s3", role: "user", content: "Give me a quick launch plan for a new AI tool." },
      {
        id: "s4",
        role: "assistant",
        content:
          "Here is a simple plan:\n\n1. Two weeks before: build a waitlist and share build-in-public updates\n2. Launch week: post a demo video and ask early users for quotes\n3. After launch: publish one use-case story every week",
      },
    ],
  },
  {
    id: "c-data",
    title: "Data Analysis Report",
    messages: [
      { id: "s5", role: "user", content: "What should a monthly analytics report include?" },
      {
        id: "s6",
        role: "assistant",
        content:
          "Keep it short: **headline numbers**, what changed since last month, the biggest win, the biggest risk, and the next action for each.",
      },
    ],
  },
  {
    id: "c-img",
    title: "Image Generation Ideas",
    messages: [
      { id: "s7", role: "user", content: "Give me prompt ideas for futuristic city art." },
      {
        id: "s8",
        role: "assistant",
        content:
          "Try these:\n\n- A neon skyline at dusk with floating trains\n- A rooftop garden city above the clouds\n- A glass metropolis reflected in a calm sea",
      },
    ],
  },
];

/* ====================================================================== */
/* Mock backend (replace me)                                               */
/* ====================================================================== */

const FENCE = "```";

function mockAnswer(prompt) {
  const p = prompt.toLowerCase();

  if (/code|function|bug|script|react|python|javascript|css|html/.test(p)) {
    return [
      "Happy to help with code. Here is a small starting point you can adapt:",
      "",
      FENCE + "js",
      "async function fetchJson(url) {",
      "  const res = await fetch(url);",
      "  if (!res.ok) throw new Error(`Request failed: ${res.status}`);",
      "  return res.json();",
      "}",
      FENCE,
      "",
      "Paste your own code and tell me what it should do, and I will go through it with you.",
    ].join("\n");
  }
  if (/blog|article|post|write/.test(p)) {
    return [
      "Here is an outline you can start from:",
      "",
      "- **Hook:** open with one surprising number or a short story",
      "- **Trend 1:** assistants that remember context",
      "- **Trend 2:** agents that finish tasks, not just answer",
      "- **Trend 3:** smaller models running on your own device",
      "- **Takeaway:** what readers can try this week",
      "",
      "Want me to write the full draft in a friendly, practical tone?",
    ].join("\n");
  }
  if (/marketing|plan|strategy|campaign|launch/.test(p)) {
    return [
      "A simple marketing plan in three steps:",
      "",
      "1. **Know the audience:** pick one group and write down their biggest frustration",
      "2. **Pick two channels:** for example short videos and an email list",
      "3. **Measure weekly:** sign-ups, replies, and which message worked best",
      "",
      "Tell me about your product and I will make this specific.",
    ].join("\n");
  }
  if (/image|picture|photo|draw|art|logo/.test(p)) {
    return [
      "Image generation is coming to this chat soon. Until then, here is a prompt you can reuse:",
      "",
      "A calm mountain lake at sunrise, soft pastel colors, glossy 3D style, high detail",
      "",
      "Tell me what you want to create and I will refine the prompt.",
    ].join("\n");
  }
  return [
    "Good question. Here is how I would approach it:",
    "",
    "- Start by defining the outcome you want",
    "- Break it into two or three small steps",
    "- Try the first step today and adjust from there",
    "",
    "This is a demo reply. Real answers appear once the backend is connected.",
  ].join("\n");
}

const uid = () => Math.random().toString(36).slice(2, 10);

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });

/**
 * Streams a reply as small text chunks.
 * TODO(backend): replace the body with something like
 *   const res = await fetch("/api/chat", { method: "POST", signal,
 *     body: JSON.stringify({ model: model.id, messages }) });
 *   const reader = res.body.getReader(); ... yield decoder.decode(value)
 */
// async function* getReply(messages, { signal }) {
//   const last = messages[messages.length - 1];
//   const prompt = last?.content || "your file";
//   const text = mockAnswer(prompt);

//   await sleep(900, signal); // "thinking"
//   const parts = text.split(/(\s+)/);
//   for (const part of parts) {
//     yield part;
//     await sleep(part.trim() ? 24 + Math.random() * 34 : 0, signal);
//   }
// }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function* getReply(messages, { signal, model }) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    signal,
    credentials: "include", // sends your auth cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model?.id,
      messages: messages.map(({ role, content }) => ({ role, content })),
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

const firstNameOf = (user) => (user?.name || "").trim().split(" ")[0] || "there";
const initialOf = (user) => (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

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

const USER_MENU = [
  { icon: User, label: "Profile", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
  { icon: ArrowLeft, label: "Back to home", href: "/" },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickAway(ref, close, open);

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 rounded-full border border-white bg-white/90 py-1 pl-1 pr-3 shadow-[0_10px_24px_-12px_rgba(79,70,229,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt=""
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-indigo-300 text-sm font-bold text-indigo-700 shadow-inner">
            {initialOf(user)}
          </span>
        )}
        <span className="hidden max-w-[110px] truncate text-[13px] font-semibold text-[#0f1030] sm:block">
          {firstNameOf(user)}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="text-gray-400">
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -10, rotateX: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ transformPerspective: 900, transformOrigin: "100% 0%" }}
            className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-white/90 bg-white/90 p-1.5 shadow-[0_30px_70px_-24px_rgba(79,70,229,0.55)] backdrop-blur-2xl"
          >
            <li className="px-3 pb-2 pt-1.5">
              <p className="truncate text-[13px] font-bold text-[#0f1030]">{user?.name}</p>
              <p className="truncate text-[11.5px] text-gray-500">{user?.email}</p>
            </li>
            <li aria-hidden className="mx-2 mb-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

            {USER_MENU.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  role="menuitem"
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#1b1b3a] outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:bg-indigo-50"
                >
                  <Icon className="h-4 w-4 text-indigo-500" />
                  {label}
                </a>
              </li>
            ))}

            <li>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#1b1b3a] outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:bg-red-50"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                Log out
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopBar({ query, setQuery, onOpenDrawer, user, onLogout }) {
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

        <motion.button
          type="button"
          aria-label="Notifications"
          whileHover={{ scale: 1.12, rotate: -8 }}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#2b2e4a] outline-none transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Bell className="h-[18px] w-[18px]" />
          {NOTIFICATIONS_UNREAD && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </motion.button>

        <UserMenu user={user} onLogout={onLogout} />
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

      {/* upgrade card */}
      <Tilt
        max={8}
        lift={4}
        scale={1.02}
        glare
        outerProps={pop(0.35)}
        className="relative mt-3 shrink-0"
        cardClassName="rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 via-indigo-50/80 to-violet-100/80 p-4 shadow-[0_18px_40px_-18px_rgba(99,102,241,0.55)]"
      >
        <div className="flex items-center gap-2" style={{ transform: "translateZ(30px)" }}>
          <span className="text-indigo-500">
            <Sparkle4 className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-bold text-[#0f1030]">Upgrade to Pro</span>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-snug text-gray-500" style={{ transform: "translateZ(18px)" }}>
          Get more models, higher limits and advanced features.
        </p>
        <a
          href="/#pricing"
          className="group relative mt-3 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(79,70,229,0.75)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          <motion.span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
            animate={{ x: ["-150%", "450%"] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
          <span className="relative">Upgrade Now</span>
          <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </Tilt>
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

function Welcome({ mx, my, onPick, name }) {
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
        Ask me anything, get creative, or solve problems. I&apos;m here to help you.
      </motion.p>

      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-3" style={{ perspective: 1200 }}>
        {SUGGESTIONS.map((s, i) => (
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

function Composer({ value, setValue, onSend, onStop, generating, attachments, setAttachments, taRef }) {
  const fileRef = useRef(null);
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
      if (!generating) onSend();
    }
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setAttachments((prev) =>
        [...prev, ...files.map((f) => ({ id: uid(), name: f.name, file: f }))].slice(0, 6)
      );
    }
    e.target.value = "";
  };

  const seed = (prefix) => {
    setValue((v) => v || prefix);
    taRef.current?.focus();
  };

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3.5 py-1.5 text-[11.5px] font-medium text-[#2b2e4a] shadow-sm outline-none transition-colors hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <input ref={fileRef} type="file" multiple hidden onChange={onFiles} />

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
            aria-label="Attach file"
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
            placeholder="Type your message here..."
            aria-label="Message"
            className="max-h-40 min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[14px] leading-snug text-[#0f1030] outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={() => seed("Generate an image of ")}
            aria-label="Start an image prompt"
            className="mb-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex"
          >
            <ImageIcon className="h-[18px] w-[18px]" />
          </button>

          <Magnetic strength={0.2} className="mb-0.5 shrink-0">
            <motion.button
              type="button"
              onClick={generating ? onStop : onSend}
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
        <button type="button" onClick={() => fileRef.current?.click()} className={chip}>
          <Paperclip className="h-3.5 w-3.5" />
          Attach File
        </button>
        <button type="button" onClick={() => seed("Generate an image of ")} className={chip}>
          <ImageIcon className="h-3.5 w-3.5" />
          Image
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

const freshChat = () => ({ id: uid(), title: "New Chat", messages: [] });

export default function ChatApp() {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const aborts = useRef(new Map()); // chatId -> AbortController

  const { user, logout } = useAuth();

  const [chats, setChats] = useState(SEED);
  const [activeId, setActiveId] = useState(SEED[0].id);
  const [model, setModel] = useState(MODELS[0]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [busy, setBusy] = useState({}); // chatId -> true while generating

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

  /** Runs one assistant reply for `chatId`, streaming into message `botId`. */
  const run = useCallback(
    async (chatId, botId, history) => {
      const ctrl = new AbortController();
      aborts.current.set(chatId, ctrl);
      setBusy((b) => ({ ...b, [chatId]: true }));

      const patch = (fn) =>
        setChats((prev) =>
          prev.map((c) =>
            c.id !== chatId ? c : { ...c, messages: c.messages.map((m) => (m.id === botId ? fn(m) : m)) }
          )
        );

      try {
        for await (const chunk of getReply(history, { signal: ctrl.signal, model })) {
          patch((m) => ({ ...m, content: m.content + chunk }));
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          patch((m) => ({ ...m, error: true, content: m.content || "Something went wrong. Please try again." }));
        }
      } finally {
        patch((m) => ({ ...m, pending: false }));
        aborts.current.delete(chatId);
        setBusy((b) => {
          const next = { ...b };
          delete next[chatId];
          return next;
        });
      }
    },
    [model]
  );

  const send = useCallback(
    (override) => {
      const content = (typeof override === "string" ? override : text).trim();
      const files = typeof override === "string" ? [] : attachments;
      if ((!content && files.length === 0) || !activeChat || busy[activeChat.id]) return;

      const chatId = activeChat.id;
      const userMsg = {
        id: uid(),
        role: "user",
        content,
        attachments: files.map(({ id, name }) => ({ id, name })),
      };
      const botId = uid();
      const botMsg = { id: botId, role: "assistant", content: "", pending: true };
      const history = [...activeChat.messages, userMsg];

      setChats((prev) =>
        prev.map((c) =>
          c.id !== chatId
            ? c
            : {
                ...c,
                title: c.messages.length === 0 ? makeTitle(content || files[0]?.name) : c.title,
                messages: [...c.messages, userMsg, botMsg],
              }
        )
      );
      setText("");
      if (typeof override !== "string") setAttachments([]);
      run(chatId, botId, history);
    },
    [text, attachments, activeChat, busy, run]
  );

  const stop = () => {
    if (activeChat) aborts.current.get(activeChat.id)?.abort();
  };

  const handleLogout = async () => {
    aborts.current.forEach((c) => c.abort()); // stop any running replies
    await logout();
    // ProtectedRoute sees the user is gone and sends them to /login
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
    run(activeChat.id, botId, history);
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

        <div className="relative z-10 flex h-full flex-col gap-3 p-2.5 sm:p-4">
          <TopBar
            query={query}
            setQuery={setQuery}
            onOpenDrawer={() => setDrawer(true)}
            user={user}
            onLogout={handleLogout}
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
                <ModelSelect value={model} onChange={setModel} />
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
                    name={firstNameOf(user)}
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
                  attachments={attachments}
                  setAttachments={setAttachments}
                  taRef={taRef}
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