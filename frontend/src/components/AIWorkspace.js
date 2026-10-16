"use client";

/**
 * AIWorkspace section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import AIWorkspace from "./components/AIWorkspace";
 *   <AIWorkspace ctaHref="#features" />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * All text is in the DATA block below. The dashboard is built from code
 * (no image files). The user name, activity list and numbers in the
 * dashboard are sample content: edit them to match your product.
 */

import { useEffect, useRef, useState } from "react";
import {
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
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  FileText,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Pencil,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BRAND = "NovaAI";
const USER_NAME = "Danish";

const BADGE = "Your AI Workspace";
const HEADING = [
  { text: "Work" },
  { text: "smarter" },
  { text: "with" },
  { br: true },
  { text: "powerful AI tools.", gradient: "from-sky-500 via-indigo-500 to-violet-500" },
];
const SUBTEXT =
  "Everything you need in one place — chat, create, analyze, automate and get things done faster with AI.";

const SIDE_BADGE = "All-in-one platform";
const SIDE_HEADING = [
  { text: "Built" },
  { text: "for" },
  { text: "creators," },
  { br: true },
  { text: "professionals" },
  { text: "and" },
  { text: "teams." },
];
const SIDE_TEXT =
  "NovaAI gives you the most advanced AI tools in a single, seamless platform. No more switching between apps — just pure productivity.";
const CHECKS = [
  "Access multiple AI models",
  "Work together in real-time",
  "Save time with automation",
  "Secure & private by design",
];
const CTA_LABEL = "Explore All Features";

const FEATURES = [
  { icon: Zap, title: "Lightning Fast", text: "Get results in seconds, not minutes." },
  { icon: ShieldCheck, title: "Enterprise Ready", text: "Your data stays private and secure." },
  { icon: Sparkles, title: "Always Improving", text: "Powered by the latest AI models." },
  { icon: Users, title: "Made for Teams", text: "Collaborate and build together." },
];

// Floating cards around the dashboard. pos = where they sit, depth = mouse parallax.
const FLOAT_CARDS = [
  {
    icon: MessageCircle,
    title: "AI Chat",
    text: "Get instant answers",
    tone: "bg-blue-100 text-blue-600",
    pos: "left-[0%] top-[12%]",
    depth: 34,
    bob: 5.2,
  },
  {
    icon: ImageIcon,
    title: "Generate Images",
    text: "Turn ideas into visuals",
    tone: "bg-violet-100 text-violet-600",
    pos: "left-[60%] top-[0%]",
    depth: -30,
    bob: 6.2,
  },
  {
    icon: FileText,
    title: "Write Content",
    text: "Blogs, emails, & more",
    tone: "bg-indigo-100 text-indigo-600",
    pos: "right-[-2%] top-[34%]",
    depth: 40,
    bob: 5.6,
  },
  {
    icon: BarChart3,
    title: "Analyze Data",
    text: "Find valuable insights",
    tone: "bg-blue-100 text-blue-600",
    pos: "right-[1%] bottom-[8%]",
    depth: -36,
    bob: 6.6,
  },
];

// Dashboard sample content
const DASH_NAV = [
  { icon: Home, label: "Home", active: true },
  { icon: MessageCircle, label: "Chat" },
  { icon: ImageIcon, label: "Image (soon)" },
  { icon: Pencil, label: "AI Writer" },
  { icon: BarChart3, label: "Data Analysis" },
  { icon: Bot, label: "Agents (soon)" },
  { icon: Zap, label: "Automation (soon)" },
];

const PROMPTS = ["Ask anything...", "Plan a product launch", "Summarize this report", "Write a welcome email"];

const QUICK = [
  { icon: MessageCircle, title: "Chat", text: "Talk with AI", bg: "from-blue-100 to-sky-50", chip: "bg-blue-500" },
  { icon: ImageIcon, title: "Generate", text: "Coming soon", bg: "from-violet-100 to-fuchsia-50", chip: "bg-violet-500" },
  { icon: Pencil, title: "Write", text: "Create content", bg: "from-emerald-100 to-teal-50", chip: "bg-emerald-500" },
  { icon: BarChart3, title: "Analyze", text: "Get insights", bg: "from-orange-100 to-amber-50", chip: "bg-orange-400" },
];

const ACTIVITY = [
  { icon: MessageCircle, text: "Marketing strategy plan", time: "2 hours ago", tone: "bg-blue-100 text-blue-600" },
  { icon: MessageCircle, text: "Weekly report summary", time: "4 hours ago", tone: "bg-violet-100 text-violet-600" },
  { icon: BarChart3, text: "Data analysis report", time: "6 hours ago", tone: "bg-indigo-100 text-indigo-600" },
];

const SPARK = [10, 16, 12, 22, 18, 28, 24, 34];
const TOTAL_TASKS = 248;
const TASKS_GROWTH = 12;

/* ====================================================================== */
/* 3D + motion helpers                                                     */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded. Both states use the
// same number of layers so Framer Motion can animate between them.
const extrude = (d, color = "#cfd6f8") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(59,91,255,0.2)`;

const TEXT_3D = extrude(0.7);
const TEXT_3D_LIFT = extrude(1.6);

const TILT_SPRING = { stiffness: 220, damping: 18 };

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 50, rotateX: -24, transformPerspective: 1000 },
  whileInView: { opacity: 1, y: 0, rotateX: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.8, delay, ease: EASE },
});

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } } };
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
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: "preserve-3d" }}
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
function Heading3D({ tokens, as: Tag = "h2", className = "" }) {
  let wordIndex = 0;
  const label = tokens.filter((tok) => !tok.br).map((tok) => tok.text).join(" ");

  return (
    <Tag className={className} aria-label={label}>
      {tokens.map((tok, i) => {
        if (tok.br) return <br key={i} />;
        const idx = wordIndex++;
        const hoverShadow = tok.gradient
          ? { filter: "drop-shadow(0 12px 14px rgba(79,70,229,0.45))" }
          : { textShadow: TEXT_3D_LIFT };

        return (
          <span key={i} aria-hidden className="mr-[0.25em] inline-block last:mr-0">
            <motion.span
              className={`inline-block cursor-default ${
                tok.gradient ? `bg-gradient-to-r ${tok.gradient} bg-clip-text text-transparent` : ""
              }`}
              initial={{ opacity: 0, rotateX: -85, y: 34 }}
              whileInView={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: { duration: 0.85, delay: 0.2 + idx * 0.09, ease: EASE },
              }}
              whileHover={{
                y: -7,
                rotateX: 12,
                rotateY: -10,
                ...hoverShadow,
                transition: { type: "spring", stiffness: 300, damping: 14 },
              }}
              viewport={{ once: true, amount: 0.6 }}
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
    </Tag>
  );
}

/** Number that counts up once it is in view. */
function CountUp({ to, decimals = 0, prefix = "", suffix = "", delay = 0.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [text, setText] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setText(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, to, decimals, delay]);

  return (
    <span ref={ref}>
      {prefix}
      {text}
      {suffix}
    </span>
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

/** Counts 0..length on a timer while on screen, so a UI can light up step by step. */
function useCycle(length, ms) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setI((v) => (v + 1) % (length + 1)), ms);
    return () => clearInterval(id);
  }, [inView, length, ms]);
  return { ref, step: i };
}

/** Re-plays a mini demo every `ms` while it is on screen. */
function useReplay(ms) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setKey((k) => k + 1), ms);
    return () => clearInterval(id);
  }, [inView, ms]);
  return { ref, key };
}

/** Types a prompt, holds, erases it, then moves to the next one. */
function useTypedLoop(prompts, active) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(prompts[0]);

  useEffect(() => {
    if (!active || reduce) return;
    let p = 0;
    let i = prompts[0].length;
    let dir = -1;
    let timer;
    const tick = () => {
      const full = prompts[p];
      i += dir;
      setText(full.slice(0, Math.max(i, 0)));
      if (dir === 1 && i >= full.length) {
        dir = -1;
        timer = setTimeout(tick, 1800);
        return;
      }
      if (dir === -1 && i <= 0) {
        dir = 1;
        p = (p + 1) % prompts.length;
        timer = setTimeout(tick, 350);
        return;
      }
      timer = setTimeout(tick, dir === 1 ? 55 : 22);
    };
    timer = setTimeout(tick, 2200);
    return () => clearTimeout(timer);
  }, [active, reduce, prompts]);

  return text;
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

const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

/** Glossy glass sphere that bobs up and down. */
function Bubble({ size = 40, tone = "blue", delay = 0, bob = 7, className = "" }) {
  return (
    <motion.div
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

const RING_MASK = (thickness) =>
  `radial-gradient(farthest-side, transparent calc(100% - ${thickness + 1}px), #000 calc(100% - ${thickness}px))`;

/**
 * A tilted orbit ring with glossy satellites riding on it.
 * The satellites counter-rotate so they stay round while they orbit.
 */
function OrbitRing({ inset, tilt, direction = 1, duration = 14, gradient, thickness = 5, satellites = [] }) {
  const spinTo = direction * 360;
  const mask = RING_MASK(thickness);

  return (
    <div
      className="absolute"
      style={{
        inset,
        transform: `rotateX(72deg) rotateZ(${tilt}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full opacity-70"
        style={{ background: gradient, WebkitMask: mask, mask, filter: "blur(6px)" }}
        animate={{ rotate: spinTo }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: gradient, WebkitMask: mask, mask }}
        animate={{ rotate: spinTo }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotate: spinTo }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {satellites.map((s, i) => {
          const a = (s.angle * Math.PI) / 180;
          return (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${50 + 50 * Math.cos(a)}%`,
                top: `${50 + 50 * Math.sin(a)}%`,
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                rotateX: -72,
                background: BUBBLE_TONES[s.tone],
                boxShadow: `0 0 ${s.size}px rgba(99,102,241,0.6)`,
              }}
              initial={{ rotate: -tilt }}
              animate={{ rotate: -tilt - spinTo }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

function CubeGlass({ size = 56, duration = 24, tone = "violet" }) {
  const half = size / 2;
  const tones = {
    violet: "from-violet-200/80 to-indigo-100/40 border-violet-300/70",
    sky: "from-sky-200/80 to-cyan-100/40 border-sky-300/70",
    pink: "from-pink-200/80 to-fuchsia-100/40 border-pink-300/70",
  };
  const faces = [
    "rotateY(0deg)",
    "rotateY(90deg)",
    "rotateY(180deg)",
    "rotateY(270deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)",
  ];
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
            className={`absolute inset-0 border bg-gradient-to-br ${tones[tone]}`}
            style={{ transform: `${f} translateZ(${half}px)` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 47 + 5) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.9) % 9,
  duration: 10 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my, scrollYProgress }) {
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -70]);
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(129,140,248,0.2), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      {/* slow aurora sweep */}
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

      {/* drifting blobs at different mouse depths */}
      <ParallaxLayer mx={mx} my={my} depth={30} className="absolute -left-24 top-10">
        <motion.div
          className="h-[26rem] w-[26rem] rounded-full bg-sky-300/40 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-44} className="absolute -right-32 top-[36%]">
        <motion.div
          className="h-[32rem] w-[32rem] rounded-full bg-violet-300/45 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute bottom-6 left-1/3">
        <motion.div
          className="h-[22rem] w-[22rem] rounded-full bg-pink-300/35 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {/* faint grid that drifts as you scroll */}
      <motion.div
        style={{
          y: gridY,
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        className="absolute inset-x-0 -bottom-16 -top-16"
      />

      {/* rising particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] ${p.tint}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -900], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {/* big glass bubbles at the edges, like the mockup */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -left-14 top-24 hidden md:block">
        <Bubble size={170} tone="cyan" bob={10} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={40} className="absolute -left-6 bottom-[20%] hidden md:block">
        <Bubble size={60} tone="blue" delay={0.8} bob={8} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-34} className="absolute right-[3%] top-[22%] hidden md:block">
        <Bubble size={32} tone="pink" delay={0.4} bob={7} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={46} className="absolute left-[46%] top-[58%] hidden lg:block">
        <CubeGlass size={40} duration={24} tone="violet" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-56} className="absolute right-[2%] bottom-[16%] hidden lg:block">
        <CubeGlass size={58} duration={30} tone="sky" />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[24%] top-[8%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[24%] top-[14%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "left-[4%] top-[48%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[6%] top-[70%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[40%] bottom-[8%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
/* Header                                                                  */
/* ====================================================================== */

function PillBadge({ icon: Icon, children, small = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -3, scale: 1.05 }}
      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.4)] backdrop-blur-md ${
        small ? "px-3.5 py-1.5" : "px-4 py-2"
      }`}
    >
      <motion.span
        whileHover={{ rotate: 180 }}
        className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white"
      >
        <Icon className="h-3 w-3" />
      </motion.span>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">{children}</span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function Header() {
  return (
    <div className="mx-auto max-w-3xl text-center" style={{ perspective: 1000 }}>
      <div className="mb-6">
        <PillBadge icon={Zap}>{BADGE}</PillBadge>
      </div>
      <Heading3D
        tokens={HEADING}
        className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0f1030] md:text-5xl lg:text-6xl"
      />
      <Reveal3D as="p" delay={0.6} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
        {SUBTEXT}
      </Reveal3D>
    </div>
  );
}

/* ====================================================================== */
/* Left column                                                             */
/* ====================================================================== */

function CheckItem({ label, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -24, rotateY: -50, transformPerspective: 700 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.6, delay: 0.5 + index * 0.1, ease: EASE }}
    >
      <motion.div
        whileHover={{ x: 8, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="group flex cursor-default items-center gap-3"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_6px_14px_-4px_rgba(59,91,255,0.7)] transition-transform duration-700 group-hover:scale-125 group-hover:[transform:perspective(300px)_rotateY(360deg)]">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="text-[15px] text-gray-700 transition-colors duration-300 group-hover:text-[#0f1030]">
          {label}
        </span>
      </motion.div>
    </motion.li>
  );
}

function LeftCopy({ ctaHref }) {
  return (
    <div style={{ perspective: 1000 }}>
      <PillBadge icon={Sparkles} small>
        {SIDE_BADGE}
      </PillBadge>

      <Heading3D
        as="h3"
        tokens={SIDE_HEADING}
        className="mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-[#0f1030] md:text-4xl"
      />

      <Reveal3D as="p" delay={0.35} className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-600">
        {SIDE_TEXT}
      </Reveal3D>

      <ul className="mt-7 space-y-3.5">
        {CHECKS.map((label, i) => (
          <CheckItem key={label} label={label} index={i} />
        ))}
      </ul>

      <Reveal3D delay={0.9} className="mt-9">
        <Magnetic>
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-10px_rgba(99,91,255,0.7)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-10px_rgba(99,91,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ["-150%", "450%"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
            />
            <span className="relative">{CTA_LABEL}</span>
            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </motion.a>
        </Magnetic>
      </Reveal3D>
    </div>
  );
}

/* ====================================================================== */
/* Dashboard mockup (built at a fixed design width, then scaled to fit)    */
/* ====================================================================== */

const DESIGN_W = 540;

function LogoMark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="ws-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#ws-logo)" />
    </svg>
  );
}

function Sidebar() {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <div className="mb-4 flex items-center gap-1.5">
        <LogoMark className="h-5 w-5" />
        <span className="text-sm font-bold text-[#0f1030]">{BRAND}</span>
      </div>
      <ul className="space-y-1">
        {DASH_NAV.map(({ icon: NavIcon, label, active }) => (
          <motion.li
            key={label}
            whileHover={{ x: 5 }}
            className={`flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
              active
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <NavIcon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function PromptInput() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const text = useTypedLoop(PROMPTS, inView);
  return (
    <div
      ref={ref}
      className="mt-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-[11px] text-gray-400">
        {text}
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-3 w-[2px] bg-indigo-500 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </span>
      <motion.span
        whileHover={{ scale: 1.2, rotate: -12 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-indigo-400/50"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <Send className="relative h-3 w-3" />
      </motion.span>
    </div>
  );
}

function QuickTiles() {
  const { ref, step } = useCycle(QUICK.length - 1, 2200);
  return (
    <div ref={ref} className="mt-3 grid grid-cols-4 gap-2" style={{ perspective: 700 }}>
      {QUICK.map(({ icon: QIcon, title, text, bg, chip }, i) => (
        <motion.div
          key={title}
          whileHover={{ y: -6, rotateX: 10, scale: 1.07 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className={`group relative cursor-default rounded-xl bg-gradient-to-br p-2.5 shadow-sm transition-shadow hover:shadow-lg ${bg} ${
            step === i ? "ring-2 ring-indigo-300" : "ring-0"
          }`}
        >
          {step === i && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-white/50"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
          <span
            className={`relative flex h-6 w-6 items-center justify-center rounded-lg text-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${chip}`}
          >
            <QIcon className="h-3 w-3" />
          </span>
          <p className="relative mt-2 text-[11px] font-bold text-[#0f1030]">{title}</p>
          <p className="relative text-[9px] text-gray-500">{text}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TasksCard() {
  const { ref, key } = useReplay(9000);
  const W = 120;
  const H = 46;
  const n = SPARK.length;
  const xs = SPARK.map((_, i) => 4 + (i * (W - 8)) / (n - 1));
  const ys = SPARK.map((v) => H - 4 - (v / 40) * (H - 8));
  const line = smoothPath(xs, ys);
  const area = `${line} L${xs[n - 1]},${H} L${xs[0]},${H} Z`;

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.03 }}
      className="rounded-xl bg-white/90 p-3 shadow-sm transition-shadow hover:shadow-lg"
    >
      <p className="text-[10px] font-semibold text-gray-500">Total Tasks</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-2xl font-extrabold text-[#0f1030]">
          <CountUp to={TOTAL_TASKS} />
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
          <TrendingUp className="h-2.5 w-2.5" />+{TASKS_GROWTH}%
        </span>
      </div>
      <motion.svg
        key={key}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 h-11 w-full overflow-visible"
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="ws-spark-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ws-spark-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#ws-spark-area)"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.8 } } }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#ws-spark-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0 },
            show: { pathLength: 1, transition: { duration: 1.4, ease: "easeInOut" } },
          }}
        />
      </motion.svg>
    </motion.div>
  );
}

function ActivityList() {
  return (
    <div className="rounded-xl bg-white/90 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#0f1030]">Recent Activity</p>
        <span className="cursor-pointer text-[9px] font-medium text-indigo-500 transition-colors hover:text-indigo-700">
          View all
        </span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {ACTIVITY.map(({ icon: AIcon, text, time, tone }, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.12, ease: EASE }}
            whileHover={{ x: 5, backgroundColor: "rgba(238,242,255,0.9)" }}
            className="flex cursor-default items-center gap-2 rounded-lg px-1.5 py-1"
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${tone}`}>
              <AIcon className="h-2.5 w-2.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{text}</span>
            <span className="shrink-0 text-[9px] text-gray-400">{time}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="grid w-full grid-cols-[130px_1fr] gap-3 rounded-3xl border border-white/90 bg-white/75 p-3.5 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.5)] backdrop-blur-xl">
      <Sidebar />

      <div className="min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[15px] font-bold text-[#0f1030]">
              Good morning, {USER_NAME}{" "}
              <motion.span
                className="inline-block origin-[70%_70%]"
                animate={{ rotate: [0, 18, -8, 18, -4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.4 }}
              >
                👋
              </motion.span>
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">What would you like to do today?</p>
          </div>
          <div className="flex items-center gap-2.5 text-gray-400">
            <Search className="h-3.5 w-3.5 transition-colors hover:text-indigo-500" />
            <span className="relative">
              <Bell className="h-3.5 w-3.5 transition-colors hover:text-indigo-500" />
              <motion.span
                className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-pink-500"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[9px] font-bold text-white">
              {USER_NAME[0]}
            </span>
          </div>
        </div>

        <PromptInput />
        <QuickTiles />

        <div className="mt-3 grid grid-cols-[1.5fr_1fr] gap-2">
          <ActivityList />
          <TasksCard />
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Stage: glass sphere + ring + tilted dashboard + floating cards          */
/* ====================================================================== */

function useStageMetrics(ref) {
  const [m, setM] = useState({ scale: 0.8, wide: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const w = el.getBoundingClientRect().width;
      const wide = w < 520;
      setM({ scale: (w * (wide ? 0.86 : 0.66)) / DESIGN_W, wide });
    };
    // ResizeObserver reports the initial size as soon as observing starts, so no direct call
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return m;
}

function GlassSphere() {
  return (
    <motion.div
      className="relative h-full w-full"
      style={{ z: -40, transformStyle: "preserve-3d" }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute -inset-[16%] rounded-full bg-violet-400/25 blur-3xl" />
      <div
        className="absolute inset-0 rounded-full border border-white/70"
        style={{
          background:
            "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95), rgba(214,228,255,0.55) 32%, rgba(167,180,255,0.35) 62%, rgba(196,181,253,0.5) 100%)",
          boxShadow:
            "inset 0 0 60px rgba(255,255,255,0.8), inset -30px -40px 80px rgba(129,140,248,0.35), 0 40px 80px rgba(99,102,241,0.25)",
        }}
      />
      {[12, 24, 36].map((i) => (
        <div key={i} className="absolute rounded-full border border-white/50" style={{ inset: `${i}%` }} />
      ))}
      <div className="absolute inset-[4%] overflow-hidden rounded-full">
        <motion.div
          className="absolute -inset-[25%] opacity-50 mix-blend-soft-light"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.95), transparent 35%, rgba(244,114,182,0.6), transparent 70%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute left-[14%] top-[8%] h-[26%] w-[40%] -rotate-[28deg] rounded-full bg-white/70 blur-md" />
      </div>
    </motion.div>
  );
}

function FloatCard({ card, index, mx, my }) {
  const Icon = card.icon;
  return (
    <ParallaxLayer mx={mx} my={my} depth={card.depth} className={`absolute z-20 hidden sm:block ${card.pos}`}>
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: card.bob, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
      >
        <Tilt
          max={12}
          lift={8}
          scale={1.06}
          glare
          outerProps={{
            initial: { opacity: 0, scale: 0.7, y: 30, rotateX: -30, transformPerspective: 900 },
            whileInView: { opacity: 1, scale: 1, y: 0, rotateX: 0 },
            viewport: { once: true, amount: 0.2 },
            transition: { duration: 0.8, delay: 0.7 + index * 0.12, ease: EASE },
          }}
          cardClassName="group flex min-w-[158px] items-center gap-3 rounded-2xl border border-white/90 bg-white/85 px-4 py-3 shadow-[0_14px_40px_-12px_rgba(79,70,229,0.35)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_28px_60px_-12px_rgba(79,70,229,0.55)]"
        >
          <span style={{ transform: "translateZ(34px)" }}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-700 group-hover:scale-110 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${card.tone}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </span>
          <span className="block" style={{ transform: "translateZ(22px)" }}>
            <span className="block text-sm font-bold leading-tight text-[#0f1030]">{card.title}</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-gray-500">{card.text}</span>
          </span>
        </Tilt>
      </motion.div>
    </ParallaxLayer>
  );
}

function Stage({ mx, my }) {
  const ref = useRef(null);
  const { scale, wide } = useStageMetrics(ref);
  const rotateY = useTransform(mx, [-1, 1], [-9, 9]);
  const rotateX = useTransform(my, [-1, 1], [6, -6]);

  return (
    <div
      ref={ref}
      className="group relative aspect-[4/3] w-full sm:aspect-[1.4/1]"
      style={{ perspective: 1400 }}
    >
      <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {/* big glass sphere behind the dashboard */}
        <div
          className="absolute left-[40%] top-[2%] aspect-square w-[46%]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <GlassSphere />
        </div>

        {/* wide orbit ring wrapping the lower part of the scene */}
        <OrbitRing
          inset="20% -6% -14% -6%"
          tilt={-9}
          direction={1}
          duration={20}
          thickness={4}
          gradient="conic-gradient(from 0deg, rgba(56,189,248,0), rgba(56,189,248,0.95) 90deg, rgba(167,139,250,0.95) 190deg, rgba(244,114,182,0.9) 260deg, rgba(56,189,248,0) 340deg)"
          satellites={[
            { angle: 150, size: 14, tone: "blue" },
            { angle: 320, size: 10, tone: "pink" },
          ]}
        />

        {/* the dashboard, tilted in 3D (levels out on hover) */}
        <motion.div
          className="absolute top-[22%]"
          style={{ left: wide ? "4%" : "8%", width: DESIGN_W, transformStyle: "preserve-3d" }}
          initial={{ y: 60, scale: 0.92, rotateX: 14 }}
          whileInView={{ y: 0, scale: 1, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
        >
          <div
            className="origin-top-left"
            style={{ transform: `scale(${scale})`, transformStyle: "preserve-3d" }}
          >
            <div className="[transform:translateZ(60px)_rotateY(-12deg)_rotateX(5deg)_rotateZ(-0.6deg)] transition-transform duration-700 group-hover:[transform:translateZ(60px)_rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)]">
              <DashboardPanel />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* small free-floating spheres */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute right-[10%] top-[10%] z-10">
        <Bubble size={26} tone="pink" delay={0.3} bob={6} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={44} className="absolute right-[12%] top-[62%] z-10">
        <Bubble size={12} tone="blue" delay={1} bob={5} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-38} className="absolute left-[6%] top-[68%] z-10">
        <Bubble size={16} tone="cyan" delay={0.6} bob={7} />
      </ParallaxLayer>

      {FLOAT_CARDS.map((card, i) => (
        <FloatCard key={card.title} card={card} index={i} mx={mx} my={my} />
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Features row                                                            */
/* ====================================================================== */

function FeaturesRow() {
  return (
    <div className="mt-20">
      <div className="relative h-px overflow-hidden bg-gradient-to-r from-transparent via-indigo-200 to-transparent">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          animate={{ x: ["-100%", "500%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1400 }}>
        {FEATURES.map(({ icon: FIcon, title, text }, i) => (
          <Tilt
            key={title}
            as="li"
            max={9}
            lift={8}
            scale={1.04}
            glare
            outerProps={enter(i * 0.1)}
            cardClassName="group flex items-start gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-white/60"
          >
            <span style={{ transform: "translateZ(40px)" }}>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-sm transition-all duration-700 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-xl group-hover:[transform:perspective(300px)_rotateY(360deg)]">
                <FIcon className="h-6 w-6" />
              </span>
            </span>
            <span className="block" style={{ transform: "translateZ(24px)" }}>
              <span className="block text-sm font-bold text-[#0f1030]">{title}</span>
              <span className="mt-1 block max-w-[10rem] text-xs leading-relaxed text-gray-500">{text}</span>
            </span>
          </Tilt>
        ))}
      </ul>
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function AIWorkspace({ ctaHref = "#features" }) {
  const sectionRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="workspace"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-20 md:py-28"
      >
        <Background mx={mx} my={my} scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          <Header />

          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-8">
            <LeftCopy ctaHref={ctaHref} />
            <Stage mx={mx} my={my} />
          </div>

          <FeaturesRow />
        </div>
      </section>
    </MotionConfig>
  );
}