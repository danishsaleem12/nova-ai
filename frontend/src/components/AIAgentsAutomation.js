"use client";

/**
 * AIAgentsAutomation section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import AIAgentsAutomation from "./components/AIAgentsAutomation";
 *   <AIAgentsAutomation ctaHref="#agents" />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * All text lives in the DATA block below. The scene (central orb, agent
 * cards, pipeline steps, mini demos) is built entirely from code — no
 * image files are needed. Sample content (agent names, demo lines,
 * stats) is placeholder: edit it to match your product.
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
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Flag,
  Globe,
  Link2,
  Mail,
  Megaphone,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BRAND = "NovaAI";

const BADGE = "AI Agents (coming soon)";
const HEADING = [
  { text: "Let" },
  { text: "AI" },
  { text: "handle" },
  { br: true },
  { text: "the work.", gradient: "from-sky-500 via-indigo-500 to-violet-500" },
];
const SUBTEXT =
  "We're building AI agents that can research, analyze, create and carry out tasks for you. Agents are coming soon; the scene below is a preview.";

const SIDE_BADGE = "In development";
const SIDE_HEADING = [
  { text: "Specialized" },
  { text: "AI" },
  { text: "agents" },
  { br: true },
  { text: "for every task." },
];
const SIDE_TEXT =
  "Specialized agents for research, coding, marketing and automation are on our roadmap. Today you can use AI Chat, which is live.";

const CHECKS = [
  "Expert agents for different use cases",
  "Automate repetitive workflows",
  "Save time and boost productivity",
  "Get high-quality, consistent results",
];

const CTA_LABEL = "See the agents preview";

/* Pipeline row across the top of the visual scene. */
const PIPELINE_STEPS = [
  { icon: Flag, label: "Goal", text: "Set your goal", tone: "from-blue-500 to-indigo-500" },
  { icon: Search, label: "Research", text: "Gather information", tone: "from-sky-500 to-blue-500" },
  { icon: Cpu, label: "Analyze", text: "Find insights", tone: "from-indigo-500 to-violet-500" },
  { icon: Wand2, label: "Create", text: "Build content", tone: "from-violet-500 to-fuchsia-500" },
  { icon: Settings, label: "Execute", text: "Take action", tone: "from-fuchsia-500 to-pink-500" },
  { icon: CheckCircle2, label: "Done", text: "Get results", tone: "from-emerald-500 to-teal-500", done: true },
];

/* The four agent cards orbiting the central sphere. */
const RESEARCH_QUERY = "Latest AI trends 2025";
const RESEARCH_RESULTS = [
  "Top 5 AI tools for productivity",
  "Industry report 2025",
  "Future of artificial intelligence",
];
const RESEARCH_CHIPS = ["Web Search", "Summarize", "Sources"];

const CODING_SNIPPET = [
  "export const createAI = () => {",
  "  return {",
  "    success: true,",
  "    message: 'Task completed'",
  "  };",
  "};",
];
const CODING_CHIPS = ["Build", "Fix", "Deploy"];

const MARKETING_TASKS = ["Social media posts", "Email sequence", "Ad copy"];
const MARKETING_CHIPS = ["Content", "Social Media", "SEO"];

const AUTOMATION_LOG = [
  { app: "notion", label: "Notion", text: "Task created", time: "2m ago" },
  { app: "slack", label: "Slack", text: "Message sent", time: "3m ago" },
  { app: "gmail", label: "Gmail", text: "Email delivered", time: "3m ago" },
];
const AUTOMATION_CHIPS = ["Integrate", "Automate", "Save"];

const STATS = [
  { icon: Zap, value: "10x", label: "Faster productivity" },
  { icon: Users, value: "100+", label: "Pre-built agent templates" },
  { icon: Shield, value: "99.9%", label: "Reliability & security" },
  { icon: Sparkles, value: "Endless", label: "Possibilities" },
];

/* Row of tools the agents can plug into, shown as a slow infinite marquee
 * just above the stats. Duplicated once in the component so the loop is
 * seamless. */
const INTEGRATIONS = [
  { app: "notion", label: "Notion" },
  { app: "slack", label: "Slack" },
  { app: "gmail", label: "Gmail" },
  { app: "zapier", label: "Zapier" },
  { app: "drive", label: "Google Drive" },
  { app: "github", label: "GitHub" },
  { app: "trello", label: "Trello" },
  { app: "discord", label: "Discord" },
];

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
const STAGGER_FAST = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
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
              className={`inline-block cursor-default ${tok.gradient ? `bg-gradient-to-r ${tok.gradient} bg-clip-text text-transparent` : ""
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

/** Number that counts up once it is in view. Accepts a numeric `to` and
 * optional non-numeric `raw` label (e.g. "Endless") which just fades in. */
function CountUp({ to, decimals = 0, prefix = "", suffix = "", delay = 0.4, raw }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [text, setText] = useState(raw ? "" : (0).toFixed(decimals));

  useEffect(() => {
    if (!inView || raw != null) return; // a `raw` label is shown directly below, no counting
    const controls = animate(0, to, {
      duration: 1.6,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setText(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, to, decimals, delay, raw]);

  return (
    <span ref={ref}>
      {prefix}
      {raw != null ? (inView ? raw : "") : text}
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

/** Types a single line of text, holds, then loops. Used by the research
 * agent's query bar. */
function useTypedLoop(lines, active) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(lines[0]);

  useEffect(() => {
    if (!active || reduce) return;
    let p = 0;
    let i = lines[0].length;
    let dir = -1;
    let timer;
    const tick = () => {
      const full = lines[p];
      i += dir;
      setText(full.slice(0, Math.max(i, 0)));
      if (dir === 1 && i >= full.length) {
        dir = -1;
        timer = setTimeout(tick, 2000);
        return;
      }
      if (dir === -1 && i <= 0) {
        dir = 1;
        p = (p + 1) % lines.length;
        timer = setTimeout(tick, 350);
        return;
      }
      timer = setTimeout(tick, dir === 1 ? 55 : 22);
    };
    timer = setTimeout(tick, 1800);
    return () => clearTimeout(timer);
  }, [active, reduce, lines]);

  return text;
}

const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
  emerald: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d1fae5 24%, #34d399 60%, #059669 100%)",
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

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 47 + 9) % 100,
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
      <ParallaxLayer mx={mx} my={my} depth={-44} className="absolute -right-32 top-[34%]">
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

      {/* floating glass shapes at the edges */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -left-10 top-16 hidden md:block">
        <CubeGlass size={70} duration={26} tone="sky" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={40} className="absolute right-[3%] top-[8%] hidden md:block">
        <Bubble size={34} tone="pink" delay={0.4} bob={7} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-34} className="absolute left-[4%] bottom-[10%] hidden lg:block">
        <CubeGlass size={44} duration={22} tone="pink" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={46} className="absolute right-[2%] bottom-[6%] hidden lg:block">
        <Bubble size={56} tone="cyan" delay={0.7} bob={8} />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[24%] top-[6%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[26%] top-[16%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "left-[4%] top-[40%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[6%] top-[74%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[42%] bottom-[8%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.4)] backdrop-blur-md ${small ? "px-3.5 py-1.5" : "px-4 py-2"
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
        <PillBadge icon={Bot}>{BADGE}</PillBadge>
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
/* Left column: copy + checklist + CTA                                     */
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
/* Pipeline row (Goal -> Research -> Analyze -> Create -> Execute -> Done) */
/* ====================================================================== */

function PipelineRow() {
  const { ref, step } = useCycle(PIPELINE_STEPS.length, 1100);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/90 bg-white/75 px-3 py-2.5 shadow-[0_20px_50px_-18px_rgba(79,70,229,0.45)] backdrop-blur-xl sm:flex-nowrap"
    >
      {PIPELINE_STEPS.map(({ icon: StepIcon, label, text, tone, done: isFinal }, i) => {
        const lit = i <= step;
        return (
          <div key={label} className="flex flex-1 items-center">
            <motion.div
              whileHover={{ y: -3, scale: 1.05 }}
              className="flex min-w-[74px] flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-center"
            >
              <motion.span
                animate={{ scale: i === step ? 1.16 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-500 ${lit
                    ? isFinal
                      ? "border-transparent bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
                      : `border-transparent bg-gradient-to-br ${tone} text-white shadow-md`
                    : "border-indigo-100 bg-white text-indigo-400"
                  }`}
              >
                {i === step && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-indigo-400/50"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <StepIcon className="relative h-3.5 w-3.5" />
              </motion.span>
              <span className="text-[10px] font-bold text-[#0f1030]">{label}</span>
              <span className="hidden text-[8px] text-gray-400 sm:block">{text}</span>
            </motion.div>
            {i < PIPELINE_STEPS.length - 1 && (
              <span className="mx-0.5 hidden h-px flex-1 overflow-hidden rounded-full bg-indigo-100 sm:block">
                <motion.span
                  className="block h-full origin-left bg-indigo-400"
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

/* ====================================================================== */
/* Agent card shell                                                        */
/* ====================================================================== */

function AgentChips({ chips }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {chips.map((c) => (
        <motion.span
          key={c}
          whileHover={{ y: -2, scale: 1.06 }}
          className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[8.5px] font-semibold text-indigo-500"
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Shared shell for the four orbiting agent cards. `pos` places the card
 * absolutely within the Stage; `depth` controls its mouse parallax.
 */
function AgentCard({ icon: Icon, tone, title, text, chips, pos, depth, delay, mx, my, children }) {
  return (
    <ParallaxLayer mx={mx} my={my} depth={depth} className={`absolute z-20 ${pos}`}>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}>
        <Tilt
          max={7}
          lift={8}
          scale={1.03}
          glare
          outerProps={{
            initial: { opacity: 0, scale: 0.8, y: 30, rotateX: -24, transformPerspective: 900 },
            whileInView: { opacity: 1, scale: 1, y: 0, rotateX: 0 },
            viewport: { once: true, amount: 0.2 },
            transition: { duration: 0.8, delay: 0.5 + delay * 0.12, ease: EASE },
          }}
          cardClassName="group w-[168px] rounded-2xl border border-white/90 bg-white/85 p-3 shadow-[0_20px_46px_-16px_rgba(79,70,229,0.4)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_32px_64px_-16px_rgba(79,70,229,0.6)] sm:w-[188px]"
        >
          <div className="flex items-center gap-2" style={{ transform: "translateZ(30px)" }}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] bg-gradient-to-br ${tone}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-[12px] font-bold leading-tight text-[#0f1030]">{title}</p>
          </div>
          <p className="relative mt-1.5 text-[9.5px] leading-snug text-gray-500" style={{ transform: "translateZ(20px)" }}>
            {text}
          </p>
          <div style={{ transform: "translateZ(16px)" }}>
            <AgentChips chips={chips} />
            {children}
          </div>
        </Tilt>
      </motion.div>
    </ParallaxLayer>
  );
}

/* ---- Research Agent mini demo ---- */

function ResearchDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const query = useTypedLoop([RESEARCH_QUERY], inView);
  return (
    <div ref={ref} className="mt-2 rounded-lg bg-indigo-50/70 p-2">
      <div className="flex items-center gap-1 rounded-md bg-white px-1.5 py-1 shadow-sm">
        <Search className="h-2.5 w-2.5 shrink-0 text-indigo-400" />
        <span className="truncate text-[8.5px] text-gray-500">
          {query}
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-2 w-[1.5px] bg-indigo-400 align-middle"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </span>
      </div>
      <motion.ul
        variants={STAGGER_FAST}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="mt-1.5 space-y-1"
      >
        {RESEARCH_RESULTS.map((line) => (
          <motion.li key={line} variants={POP} className="flex items-start gap-1 text-[8px] text-gray-500">
            <Globe className="mt-[1.5px] h-2 w-2 shrink-0 text-sky-400" />
            <span className="truncate">{line}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ---- Coding Agent mini demo ---- */

function CodingDemo({ replayKey }) {
  const [lineCount, setLineCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLineCount(i);
      if (i >= CODING_SNIPPET.length) clearInterval(id);
    }, 260);
    return () => {
      clearInterval(id);
      setLineCount(0); // start from the first line again on replay / re-entry
    };
  }, [inView, replayKey]);

  return (
    <div ref={ref} className="mt-2 rounded-lg bg-[#0f1030] p-2 font-mono shadow-inner">
      <div className="mb-1 flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="ml-auto text-[7px] font-sans text-indigo-300">Generating code...</span>
      </div>
      <div className="space-y-0.5">
        {CODING_SNIPPET.slice(0, lineCount).map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="whitespace-pre text-[7.5px] leading-snug text-sky-200"
          >
            {line}
          </motion.p>
        ))}
        {lineCount < CODING_SNIPPET.length && (
          <motion.span
            aria-hidden
            className="inline-block h-2.5 w-[3px] bg-emerald-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Marketing Agent mini demo (art tile drawn with inline SVG) ---- */

function MarketingArtTile() {
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="aaa-mkt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#f0abfc" />
        </linearGradient>
      </defs>
      <rect width="100" height="60" fill="url(#aaa-mkt-sky)" />
      <circle cx="78" cy="16" r="9" fill="#fff" opacity="0.85" />
      <path d="M0 50 L18 30 L34 42 L54 20 L74 44 L100 26 L100 60 L0 60Z" fill="#4338ca" opacity="0.85" />
      <path d="M0 56 L26 40 L48 52 L70 34 L100 46 L100 60 L0 60Z" fill="#312e81" />
    </svg>
  );
}

function MarketingDemo() {
  return (
    <div className="mt-2 rounded-lg bg-fuchsia-50/70 p-2">
      <div className="h-10 w-full overflow-hidden rounded-md shadow-sm">
        <MarketingArtTile />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        className="mt-1.5 inline-flex items-center gap-1 text-[8.5px] font-bold text-fuchsia-600"
      >
        <Sparkles className="h-2.5 w-2.5" />
        Marketing campaign created!
      </motion.p>
      <motion.ul
        variants={STAGGER_FAST}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="mt-1 space-y-0.5"
      >
        {MARKETING_TASKS.map((t) => (
          <motion.li key={t} variants={POP} className="flex items-center gap-1 text-[8px] text-gray-500">
            <Check className="h-2 w-2 shrink-0 text-emerald-500" strokeWidth={3} />
            {t}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ---- Automation Agent mini demo ---- */

function AutomationAppMark({ app }) {
  switch (app) {
    case "notion":
      return <span className="font-serif text-[9px] font-black leading-none text-gray-900">N</span>;
    case "slack":
      return (
        <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
          <rect x="10" y="2" width="4" height="9" rx="2" fill="#36c5f0" />
          <rect x="13" y="10" width="9" height="4" rx="2" fill="#2eb67d" />
          <rect x="10" y="13" width="4" height="9" rx="2" fill="#ecb22e" />
          <rect x="2" y="10" width="9" height="4" rx="2" fill="#e01e5a" />
        </svg>
      );
    case "gmail":
      return <Mail className="h-3 w-3 text-red-500" />;
    default:
      return <Link2 className="h-3 w-3 text-gray-400" />;
  }
}

function AutomationDemo() {
  return (
    <div className="mt-2 rounded-lg bg-emerald-50/70 p-2">
      <p className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-600">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Workflow completed
      </p>
      <motion.ul
        variants={STAGGER_FAST}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="mt-1 space-y-1"
      >
        {AUTOMATION_LOG.map((row) => (
          <motion.li key={row.label} variants={POP} className="flex items-center gap-1.5 text-[8px] text-gray-500">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-white shadow-sm">
              <AutomationAppMark app={row.app} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              {row.label} → {row.text}
            </span>
            <span className="shrink-0 text-[7px] text-gray-400">{row.time}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ====================================================================== */
/* Central orb + connectors                                                */
/* ====================================================================== */

function CentralOrb() {
  return (
    <motion.div
      className="relative h-full w-full"
      style={{ transformStyle: "preserve-3d" }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute -inset-[30%] rounded-full bg-violet-400/30 blur-3xl" />
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 22%, #93b4ff 52%, #8b7cf6 82%, #6d5ae0 100%)",
          boxShadow:
            "inset -16px -20px 34px rgba(60,40,180,0.4), inset 10px 10px 26px rgba(255,255,255,0.8), 0 26px 50px rgba(99,102,241,0.45)",
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
        <div className="absolute left-[14%] top-[8%] h-[28%] w-[42%] -rotate-[28deg] rounded-full bg-white/70 blur-md" />
        <Sparkle4 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-white/90" />
      </div>

      <OrbitRing
        inset="-16%"
        tilt={-16}
        direction={1}
        duration={13}
        thickness={4}
        gradient="conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(147,197,253,0.95) 100deg, rgba(167,139,250,0.95) 210deg, rgba(255,255,255,0.1) 320deg)"
        satellites={[
          { angle: 40, size: 10, tone: "blue" },
          { angle: 220, size: 8, tone: "pink" },
        ]}
      />
    </motion.div>
  );
}

/**
 * Curved dotted connector from the center of the stage out to one corner.
 * `from` / `to` are percentages within the stage's own coordinate box.
 */
function Connector({ box, from, to, reverse = false }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const midX = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  return (
    <svg viewBox={`0 0 ${box} ${box}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="1.4"
        strokeDasharray="4 5"
        animate={{ strokeDashoffset: reverse ? [0, 18] : [0, -18] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

/* ====================================================================== */
/* Stage: pipeline row + orb + four agent cards + connectors               */
/* ====================================================================== */

const STAGE_BOX = 100;

function Stage({ mx, my }) {
  const { ref: replayRef, key: codingKey } = useReplay(6200);
  const rotateY = useTransform(mx, [-1, 1], [-6, 6]);
  const rotateX = useTransform(my, [-1, 1], [4, -4]);

  return (
    <div className="relative">
      <div className="mb-6">
        <PipelineRow />
      </div>

      <div
        ref={replayRef}
        className="group relative mx-auto w-full max-w-3xl min-h-[820px] sm:min-h-[620px] lg:min-h-[560px]"
        style={{ perspective: 1400 }}
      >
        <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {/* connector lines drawn in a 0-100 box, center at 50/50 */}
          <Connector box={STAGE_BOX} from={[50, 50]} to={[16, 22]} />
          <Connector box={STAGE_BOX} from={[50, 50]} to={[84, 22]} reverse />
          <Connector box={STAGE_BOX} from={[50, 50]} to={[16, 78]} reverse />
          <Connector box={STAGE_BOX} from={[50, 50]} to={[84, 78]} />

          {/* central glowing sphere */}
          <div
            className="absolute left-1/2 top-1/2 aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2"
            style={{ transformStyle: "preserve-3d" }}
          >
            <CentralOrb />
          </div>

          {/* four orbiting agent cards */}
          <AgentCard
            icon={Search}
            tone="from-blue-500 to-sky-500"
            title="Research Agent"
            text="Finds the best information from the web."
            chips={RESEARCH_CHIPS}
            pos="left-[0%] top-[4%]"
            depth={30}
            delay={0}
            mx={mx}
            my={my}
          >
            <ResearchDemo />
          </AgentCard>

          <AgentCard
            icon={Code2}
            tone="from-violet-500 to-indigo-500"
            title="Coding Agent"
            text="Writes, debugs and improves your code."
            chips={CODING_CHIPS}
            pos="right-[0%] top-[0%]"
            depth={-34}
            delay={1}
            mx={mx}
            my={my}
          >
            <CodingDemo replayKey={codingKey} />
          </AgentCard>

          <AgentCard
            icon={Megaphone}
            tone="from-pink-500 to-fuchsia-500"
            title="Marketing Agent"
            text="Creates campaigns, content and growth strategies."
            chips={MARKETING_CHIPS}
            pos="left-[2%] bottom-[2%]"
            depth={26}
            delay={2}
            mx={mx}
            my={my}
          >
            <MarketingDemo />
          </AgentCard>

          <AgentCard
            icon={Zap}
            tone="from-emerald-500 to-teal-500"
            title="Automation Agent"
            text="Connects your tools and automates workflows."
            chips={AUTOMATION_CHIPS}
            pos="right-[-1%] bottom-[0%]"
            depth={-28}
            delay={3}
            mx={mx}
            my={my}
          >
            <AutomationDemo />
          </AgentCard>

          {/* tiny free-floating spheres for extra depth */}
          <ParallaxLayer mx={mx} my={my} depth={-40} className="absolute left-[38%] top-[10%] z-10 hidden sm:block">
            <Bubble size={14} tone="pink" delay={0.3} bob={5} />
          </ParallaxLayer>
          <ParallaxLayer mx={mx} my={my} depth={36} className="absolute right-[36%] bottom-[8%] z-10 hidden sm:block">
            <Bubble size={12} tone="blue" delay={0.8} bob={6} />
          </ParallaxLayer>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-5 text-center text-xs font-medium text-gray-400"
      >
        Your goal → AI Agents → Real Results
      </motion.p>
    </div>
  );
}

/* ====================================================================== */
/* Integrations marquee                                                    */
/* ====================================================================== */

/** Small colored glyph for a recognizable app. Falls back to a generic
 * link icon for anything not explicitly drawn. */
function IntegrationMark({ app }) {
  switch (app) {
    case "notion":
      return <span className="font-serif text-[13px] font-black leading-none text-gray-900">N</span>;
    case "slack":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <rect x="10" y="2" width="4" height="9" rx="2" fill="#36c5f0" />
          <rect x="13" y="10" width="9" height="4" rx="2" fill="#2eb67d" />
          <rect x="10" y="13" width="4" height="9" rx="2" fill="#ecb22e" />
          <rect x="2" y="10" width="9" height="4" rx="2" fill="#e01e5a" />
        </svg>
      );
    case "gmail":
      return <Mail className="h-4 w-4 text-red-500" />;
    case "zapier":
      return <Zap className="h-4 w-4 text-orange-500" />;
    case "drive":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path d="M8.5 3 L15.5 3 L22 14.5 L18.5 20.5 L2 20.5 Z" fill="#fff" opacity="0" />
          <path d="M8.5 3 L15.5 3 L22 14.5 L15.2 14.5 Z" fill="#ffcf63" />
          <path d="M2 20.5 L5.6 14.5 L15.2 14.5 L18.5 20.5 Z" fill="#4285f4" />
          <path d="M8.5 3 L2 14.5 L5.6 20.5 L12 9 Z" fill="#34a853" />
        </svg>
      );
    case "github":
      return <Code2 className="h-4 w-4 text-gray-800" />;
    case "trello":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#0079bf" />
          <rect x="5" y="5" width="6" height="12" rx="1.4" fill="#fff" />
          <rect x="13" y="5" width="6" height="8" rx="1.4" fill="#fff" />
        </svg>
      );
    case "discord":
      return <Bot className="h-4 w-4 text-indigo-500" />;
    default:
      return <Link2 className="h-4 w-4 text-gray-400" />;
  }
}

function IntegrationChip({ app, label }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className="mx-2 flex shrink-0 items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 shadow-[0_10px_26px_-12px_rgba(79,70,229,0.4)] backdrop-blur-md"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm">
        <IntegrationMark app={app} />
      </span>
      <span className="whitespace-nowrap text-[11px] font-semibold text-gray-600">{label}</span>
    </motion.div>
  );
}

/**
 * Infinite horizontal marquee. Renders the integration list twice back to
 * back and animates the wrapper left by exactly one list-width, so the
 * loop point is invisible.
 */
function IntegrationsMarquee() {
  const reduce = useReducedMotion();
  const track = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <div className="mt-14">
      <Reveal3D as="p" className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
        Works with the tools you already use
      </Reveal3D>

      <div
        className="relative mt-5 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <motion.div
          className="flex w-max items-center py-1"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={reduce ? undefined : { duration: 26, repeat: Infinity, ease: "linear" }}
        >
          {track.map((item, i) => (
            <IntegrationChip key={`${item.app}-${i}`} app={item.app} label={item.label} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Stats row                                                               */
/* ====================================================================== */

function parseStatValue(value) {
  const match = value.match(/[\d.]+/);
  if (!match) return { numeric: null, prefix: "", suffix: value };
  const numeric = parseFloat(match[0]);
  const idx = value.indexOf(match[0]);
  const prefix = value.slice(0, idx);
  const suffix = value.slice(idx + match[0].length);
  const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0;
  return { numeric, prefix, suffix, decimals };
}

function StatItem({ icon: Icon, value, label, index }) {
  const parsed = parseStatValue(value);
  return (
    <Tilt
      max={6}
      lift={6}
      scale={1.03}
      outerProps={enter(index * 0.08)}
      cardClassName="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 backdrop-blur-md"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-sm">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <p className="text-lg font-extrabold text-[#0f1030]">
          {parsed.numeric != null ? (
            <CountUp
              to={parsed.numeric}
              decimals={parsed.decimals || 0}
              prefix={parsed.prefix}
              suffix={parsed.suffix}
              delay={0.3 + index * 0.1}
            />
          ) : (
            <CountUp raw={value} delay={0.3 + index * 0.1} to={0} />
          )}
        </p>
        <p className="text-[11px] text-gray-500">{label}</p>
      </div>
    </Tilt>
  );
}

function StatsRow() {
  return (
    <div className="mt-16">
      <div className="relative h-px overflow-hidden bg-gradient-to-r from-transparent via-indigo-200 to-transparent">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          animate={{ x: ["-100%", "500%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1200 }}>
        {STATS.map((s, i) => (
          <li key={s.label}>
            <StatItem icon={s.icon} value={s.value} label={s.label} index={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function AIAgentsAutomation({ ctaHref = "#agents" }) {
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
        id="agents"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-20 md:py-28"
      >
        <Background mx={mx} my={my} scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          <Header />

          <div className="mt-16 grid items-start gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-8">
            <LeftCopy ctaHref={ctaHref} />
            <Stage mx={mx} my={my} />
          </div>

          <IntegrationsMarquee />
          <StatsRow />
        </div>
      </section>
    </MotionConfig>
  );
}