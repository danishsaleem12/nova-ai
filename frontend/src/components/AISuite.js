"use client";

/**
 * AISuit section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import AISuit from "./components/AISuit";
 *   <AISuit />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * All text is in the DATA block below. The sample images are drawn with
 * inline SVG, so no image files are needed. The demo conversation, chart
 * numbers and app names are placeholders: edit them to match your product.
 */

import { useEffect, useRef, useState } from "react";
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
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Compass,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BRAND = "NovaAI";
const BADGE = "Powered by Intelligence";

const HEADING = [
  { text: "Everything" },
  { text: "you" },
  { text: "need" },
  { text: "to" },
  { br: true },
  { text: "build with AI.", gradient: "from-blue-500 via-indigo-500 to-violet-500" },
];

const SUBTEXT =
  "One intelligent platform for conversations, creativity, automation, analysis, and everything in between.";

const FOOTNOTE = "One platform. Infinite possibilities.";

const WRITER_TEXT =
  "Artificial intelligence is transforming the way we work, create, and solve problems. As technology continues to evolve, the possibilities are limitless...";

const WRITER_TOOLS = [
  { icon: Pencil, label: "Write" },
  { icon: RefreshCw, label: "Rewrite" },
  { icon: Sparkles, label: "Improve" },
  { icon: AlignLeft, label: "Summarize" },
];

const CHAT_NAV = [
  { icon: MessageCircle, label: "New Chat", active: true },
  { icon: Compass, label: "Explore" },
  { icon: BookOpen, label: "Library" },
  { icon: Settings, label: "Settings" },
];

const CHART_POINTS = [22, 38, 30, 52, 44, 66, 58, 82];

const AGENT_STEPS = [
  { icon: Search, label: "Research" },
  { icon: BarChart3, label: "Analyze" },
  { icon: Sparkles, label: "Create" },
  { icon: Check, label: "Complete" },
];

const FLOW_STEPS = [
  { icon: Calendar, label: "Trigger" },
  { icon: Bot, label: "AI Agent" },
  { icon: Settings, label: "Action" },
  { icon: Check, label: "Completed", done: true },
];

const APPS = ["gmail", "slack", "notion", "plus"];

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

// Variants used by the mini demos inside each card.
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } } };
const STAGGER_FAST = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};
const TILE = {
  hidden: { opacity: 0, scale: 0.7, filter: "blur(14px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};
const VIEWPORT = { once: false, amount: 0.3 };

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
function Heading3D({ tokens, className = "" }) {
  let wordIndex = 0;
  const label = tokens.filter((tok) => !tok.br).map((tok) => tok.text).join(" ");

  return (
    <h2 className={className} aria-label={label}>
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
                transition: { duration: 0.85, delay: 0.2 + idx * 0.1, ease: EASE },
              }}
              whileHover={{
                y: -8,
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
    </h2>
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

/** Re-plays a card's mini demo every `ms` while the card is on screen. */
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

/** Counts 0..length on a timer, so a flow can light up step by step. */
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

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

// Each pair has the same path commands, so Framer Motion can morph between them.
const WAVES = [
  {
    from: "M0,190 C200,90 420,300 720,210 C1020,120 1240,260 1440,170 L1440,400 L0,400 Z",
    to: "M0,240 C220,150 440,260 720,170 C1000,100 1220,300 1440,210 L1440,400 L0,400 Z",
    fill: "url(#suit-wave-a)",
    duration: 12,
  },
  {
    from: "M0,270 C260,210 520,330 800,270 C1080,210 1260,320 1440,260 L1440,400 L0,400 Z",
    to: "M0,240 C280,320 540,240 800,300 C1060,360 1260,230 1440,300 L1440,400 L0,400 Z",
    fill: "url(#suit-wave-b)",
    duration: 10,
  },
];

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
  left: (i * 47 + 11) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.9) % 9,
  duration: 10 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my, scrollYProgress }) {
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -70]);
  const wavesX = useTransform(mx, [-1, 1], [-30, 30]);
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

      {/* 3D waves */}
      <motion.div style={{ x: wavesX }} className="absolute -inset-x-10 bottom-0 h-[26%]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="suit-wave-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="suit-wave-b" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f5d0fe" stopOpacity="0.7" />
              <stop offset="0.55" stopColor="#c4b5fd" stopOpacity="0.55" />
              <stop offset="1" stopColor="#93c5fd" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {WAVES.map((w, i) => (
            <motion.path
              key={i}
              fill={w.fill}
              initial={{ d: w.from }}
              animate={{ d: [w.from, w.to, w.from] }}
              transition={{ duration: w.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </motion.div>

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

      {/* floating glass shapes */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -left-8 top-28 hidden md:block">
        <Bubble size={96} tone="cyan" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={46} className="absolute left-[3%] top-[46%] hidden lg:block">
        <CubeGlass size={46} duration={24} tone="violet" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-56} className="absolute right-[2%] top-[62%] hidden lg:block">
        <CubeGlass size={62} duration={30} tone="sky" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={38} className="absolute right-[6%] top-[42%] hidden md:block">
        <Bubble size={30} tone="pink" delay={0.8} bob={7} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-34} className="absolute bottom-[12%] left-[6%] hidden md:block">
        <CubeGlass size={38} duration={20} tone="pink" />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[22%] top-[6%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[26%] top-[22%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "left-[4%] top-[34%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[4%] top-[82%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[48%] bottom-[10%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
/* Header: badge, heading, and the 3D glass orb                            */
/* ====================================================================== */

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

function HeaderOrb({ mx, my, className = "" }) {
  const rotateY = useTransform(mx, [-1, 1], [-22, 22]);
  const rotateX = useTransform(my, [-1, 1], [16, -16]);

  return (
    <div className={className} style={{ perspective: 900 }} aria-hidden>
      <motion.div className="relative h-full w-full" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -inset-[30%] rounded-full bg-violet-400/30 blur-3xl" />

          <div
            className="absolute inset-[16%] overflow-hidden rounded-full"
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
          </div>

          <OrbitRing
            inset="-14%"
            tilt={-18}
            direction={1}
            duration={12}
            thickness={4}
            gradient="conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(147,197,253,0.95) 100deg, rgba(167,139,250,0.95) 210deg, rgba(255,255,255,0.1) 320deg)"
            satellites={[
              { angle: 30, size: 12, tone: "blue" },
              { angle: 210, size: 9, tone: "pink" },
            ]}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Badge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -3, scale: 1.05 }}
      className="relative mb-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.4)] backdrop-blur-md"
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="text-blue-600"
      >
        <Sparkle4 className="h-3.5 w-3.5" />
      </motion.span>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">{BADGE}</span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function Header({ mx, my }) {
  return (
    <div className="relative">
      <HeaderOrb mx={mx} my={my} className="absolute right-0 top-[-14px] hidden h-44 w-44 md:block lg:h-52 lg:w-52" />

      <div className="mx-auto max-w-3xl text-center" style={{ perspective: 1000 }}>
        <Badge />
        <Heading3D
          tokens={HEADING}
          className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0f1030] md:text-5xl lg:text-6xl"
        />
        <Reveal3D
          as="p"
          delay={0.6}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg"
        >
          {SUBTEXT}
        </Reveal3D>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Bento card shell                                                        */
/* ====================================================================== */

/**
 * Glass card. The frosted background is its own layer so the content on
 * top keeps real 3D depth (backdrop-filter would otherwise flatten it).
 */
function BentoCard({ icon: Icon, title, text, className = "", delay = 0, glow = "bg-violet-300/30", children, contentClass = "" }) {
  return (
    <Tilt
      className={className}
      max={5}
      lift={10}
      scale={1.015}
      glare
      outerProps={enter(delay)}
      cardClassName="group flex h-full flex-col p-6 md:p-7"
    >
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/55 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_40px_90px_-24px_rgba(99,102,241,0.55)]"
      >
        <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${glow}`} />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      </div>

      <div className="relative flex items-center gap-3" style={{ transform: "translateZ(44px)" }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 shadow-sm transition-all duration-700 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:[transform:perspective(300px)_rotateY(360deg)]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-bold text-[#0f1030]">{title}</h3>
      </div>

      <p
        className="relative mt-3 max-w-xs text-sm leading-relaxed text-gray-500"
        style={{ transform: "translateZ(26px)" }}
      >
        {text}
      </p>

      <div
        className={`relative mt-5 flex-1 [transform-style:preserve-3d] ${contentClass}`}
        style={{ transform: "translateZ(14px)" }}
      >
        {children}
      </div>
    </Tilt>
  );
}

function LogoMark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="suit-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#suit-logo)" />
    </svg>
  );
}

/* ====================================================================== */
/* Card 1: AI Chat                                                         */
/* ====================================================================== */

function ChatMockup({ replayKey }) {
  return (
    <div className="w-full [transform:perspective(1200px)_rotateX(9deg)_rotateY(-12deg)_rotateZ(1deg)] transition-transform duration-700 group-hover:[transform:perspective(1200px)_rotateX(0deg)_rotateY(0deg)_rotateZ(0deg)]">
      <motion.div
        key={replayKey}
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="grid grid-cols-[92px_1fr] gap-3 rounded-2xl border border-white/90 bg-white/75 p-3 shadow-[0_24px_50px_-16px_rgba(79,70,229,0.4)]"
      >
        {/* sidebar */}
        <motion.div variants={POP} className="rounded-xl bg-white/70 p-2">
          <div className="mb-3 flex items-center gap-1.5">
            <LogoMark className="h-4 w-4" />
            <span className="text-xs font-bold text-[#0f1030]">{BRAND}</span>
          </div>
          <ul className="space-y-1">
            {CHAT_NAV.map(({ icon: NavIcon, label, active }) => (
              <motion.li
                key={label}
                whileHover={{ x: 4 }}
                className={`flex cursor-default items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "bg-indigo-100 text-indigo-600" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <NavIcon className="h-3 w-3 shrink-0" />
                {label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* conversation */}
        <div className="space-y-3 rounded-xl bg-gradient-to-b from-white/80 to-indigo-50/60 p-3">
          <motion.div variants={POP} className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[10px] font-bold text-white">
              Y
            </span>
            <div>
              <p className="text-[10px] font-bold text-[#0f1030]">You</p>
              <p className="mt-1 rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[11px] text-gray-600 shadow-sm">
                Analyze this idea and improve it.
              </p>
            </div>
          </motion.div>

          <motion.div variants={POP} className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <LogoMark className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#0f1030]">{BRAND}</p>
              <div className="mt-1 rounded-xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-semibold text-[#0f1030]">Here&apos;s a stronger approach...</p>
                <motion.ul variants={STAGGER_FAST} className="mt-1.5 space-y-1">
                  {[
                    "Focus on a specific audience",
                    "Add a unique value proposition",
                    "Use a multi-channel strategy",
                  ].map((line) => (
                    <motion.li key={line} variants={POP} className="flex items-start gap-1.5 text-[10px] text-gray-500">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                      {line}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>
          </motion.div>

          <motion.div variants={POP} className="ml-8 inline-flex gap-1 rounded-full bg-white px-3 py-2 shadow-sm">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-indigo-300"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>

          <motion.div
            variants={POP}
            className="flex items-center justify-between rounded-xl border border-white bg-white px-3 py-2 shadow-sm"
          >
            <span className="text-[10px] text-gray-400">Type your message...</span>
            <motion.span
              whileHover={{ scale: 1.2, rotate: -12 }}
              whileTap={{ scale: 0.9 }}
              className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-indigo-400/50"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <Send className="relative h-3 w-3" />
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ChatCard() {
  const { ref, key } = useReplay(13000);
  return (
    <BentoCard
      icon={MessageCircle}
      title="AI Chat"
      text="Have natural conversations with an AI that understands context and helps you think faster."
      delay={0}
      glow="bg-blue-300/30"
      contentClass="flex items-end pt-2"
    >
      {/* floating status pill */}
      <motion.div
        aria-hidden
        className="absolute -top-24 right-0 hidden sm:block md:-top-28"
        style={{ z: 60 }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="flex items-center gap-2 rounded-full border border-white/90 bg-white/85 px-3.5 py-2 shadow-[0_12px_30px_-10px_rgba(79,70,229,0.45)] backdrop-blur-md"
        >
          <motion.span
            className="h-5 w-5 rounded-full"
            style={{ background: BUBBLE_TONES.blue }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="text-xs font-semibold text-indigo-600">AI is thinking...</span>
        </motion.div>
      </motion.div>

      <div ref={ref} className="w-full">
        <ChatMockup replayKey={key} />
      </div>
    </BentoCard>
  );
}

/* ====================================================================== */
/* Card 2: Image Generation (art drawn with inline SVG)                    */
/* ====================================================================== */

function ArtMountains() {
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="art-m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d5ae0" />
          <stop offset="0.55" stopColor="#e6a6e8" />
          <stop offset="1" stopColor="#ffd9c9" />
        </linearGradient>
        <radialGradient id="art-m-moon" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdb8ff" />
        </radialGradient>
      </defs>
      <rect width="160" height="120" fill="url(#art-m-sky)" />
      {[[20, 14], [48, 26], [132, 12], [148, 40], [70, 10]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" opacity="0.8" />
      ))}
      <circle cx="104" cy="36" r="17" fill="url(#art-m-moon)" />
      <path d="M0 96 L26 60 L44 78 L72 40 L104 86 L130 62 L160 94 L160 120 L0 120Z" fill="#7a63e0" opacity="0.9" />
      <path d="M0 106 L34 80 L60 98 L92 72 L130 102 L160 86 L160 120 L0 120Z" fill="#4c3fb5" />
      <path d="M0 114 C40 108 80 118 160 110 L160 120 L0 120Z" fill="#fff" opacity="0.25" />
    </svg>
  );
}

function ArtIce() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="art-i-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd0ff" />
          <stop offset="1" stopColor="#eaf5ff" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#art-i-sky)" />
      <path d="M0 100 L22 46 L38 70 L58 24 L84 74 L100 52 L100 100Z" fill="#5a9bea" />
      <path d="M58 24 L84 74 L66 70 L58 52 Z" fill="#dff0ff" opacity="0.9" />
      <path d="M22 46 L38 70 L26 68 Z" fill="#dff0ff" opacity="0.8" />
      <path d="M0 100 L30 76 L54 92 L78 80 L100 96 L100 100Z" fill="#2f6fd0" />
    </svg>
  );
}

function ArtCity() {
  const towers = [
    [6, 46, 12], [18, 30, 10], [29, 52, 9], [39, 20, 12], [52, 40, 10], [63, 26, 11], [75, 48, 9], [85, 34, 10],
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="art-c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b8cf0" />
          <stop offset="1" stopColor="#d5c4ff" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#art-c-sky)" />
      {towers.map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={100 - y} fill={i % 2 ? "#3a4fbf" : "#2b3aa0"} />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={x + 2} y={y + 6 + r * 9} width="2" height="3" fill="#ffe9a8" opacity="0.85" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function ArtCrystal() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="art-x-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c8ff" />
          <stop offset="1" stopColor="#7d68e8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#art-x-bg)" />
      <path d="M18 100 L36 30 L54 100Z" fill="#a78bfa" />
      <path d="M36 30 L54 100 L42 100 Z" fill="#ede4ff" opacity="0.9" />
      <path d="M46 100 L68 44 L90 100Z" fill="#8b6cf0" />
      <path d="M68 44 L90 100 L76 100 Z" fill="#f3ecff" opacity="0.85" />
      <path d="M0 100 L20 78 L40 96 L100 80 L100 100Z" fill="#5b45c8" />
    </svg>
  );
}

function ArtLotus() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="art-l-bg" cx="0.5" cy="0.6" r="0.8">
          <stop offset="0" stopColor="#5a6cf0" />
          <stop offset="1" stopColor="#1e2a78" />
        </radialGradient>
        <linearGradient id="art-l-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd3f3" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#art-l-bg)" />
      <g transform="translate(50 62)">
        {[-62, -36, 0, 36, 62].map((r, i) => (
          <ellipse key={i} cx="0" cy="-14" rx="7" ry="17" fill="url(#art-l-petal)" transform={`rotate(${r})`} opacity={i === 2 ? 1 : 0.9} />
        ))}
      </g>
      <ellipse cx="50" cy="82" rx="28" ry="4" fill="#8fb4ff" opacity="0.5" />
    </svg>
  );
}

function Tile({ children, className = "" }) {
  return (
    <motion.div
      variants={TILE}
      whileHover={{
        scale: 1.08,
        y: -4,
        rotateZ: 1.5,
        zIndex: 20,
        transition: { type: "spring", stiffness: 300, damping: 18 },
      }}
      className={`relative overflow-hidden rounded-xl border border-white/80 shadow-md ${className}`}
    >
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        variants={{ hidden: { x: "-150%" }, show: { x: "350%", transition: { duration: 1.2, delay: 0.6 } } }}
      />
    </motion.div>
  );
}

function ImageCard() {
  const { ref, key } = useReplay(11000);
  return (
    <BentoCard
      className="md:col-span-6"
      icon={ImageIcon}
      title="Image Generation (coming soon)"
      text="Planned: turn simple ideas into visuals. Not available yet, so this is a preview."
      delay={0.08}
      glow="bg-fuchsia-300/25"
    >
      <div ref={ref} className="relative pb-3">
        <motion.div
          key={key}
          variants={STAGGER_FAST}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="grid h-44 grid-cols-[1.4fr_1fr_1fr] grid-rows-2 gap-2 sm:h-52"
        >
          <Tile className="row-span-2">
            <ArtMountains />
          </Tile>
          <Tile>
            <ArtIce />
          </Tile>
          <Tile>
            <ArtCity />
          </Tile>
          <Tile>
            <ArtCrystal />
          </Tile>
          <Tile>
            <ArtLotus />
          </Tile>
          <motion.span
            variants={POP}
            whileHover={{ scale: 1.08, y: -2 }}
            className="absolute bottom-0 left-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3" />4 images generated
          </motion.span>
        </motion.div>
      </div>
    </BentoCard>
  );
}

/* ====================================================================== */
/* Card 3: AI Writer                                                       */
/* ====================================================================== */

function Typewriter({ text }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    let timer;
    const tick = () => {
      setCount(i);
      if (i < text.length) {
        i += 1;
        timer = setTimeout(tick, 32);
      } else {
        timer = setTimeout(() => {
          i = 0;
          tick();
        }, 3200);
      }
    };
    timer = setTimeout(tick, 0); // first step on the next tick, not synchronously in the effect
    return () => clearTimeout(timer);
  }, [inView, reduce, text]);

  const shown = reduce ? text : text.slice(0, count);

  return (
    <p ref={ref} className="relative text-[13px] leading-relaxed text-gray-500">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {shown}
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block h-3.5 w-[2px] bg-indigo-500 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </span>
    </p>
  );
}

function WriterCard() {
  const { ref, step: activeTool } = useCycle(3, 2200);
  return (
    <BentoCard
      className="md:col-span-6"
      icon={Pencil}
      title="AI Writer"
      text="Create blogs, emails, copy, and ideas without starting from scratch."
      delay={0.16}
      glow="bg-violet-300/30"
    >
      <div
        ref={ref}
        className="rounded-2xl border border-white/90 bg-white/75 p-3 shadow-[0_18px_40px_-16px_rgba(79,70,229,0.35)] transition-transform duration-500 [transform:perspective(1000px)_rotateX(4deg)] group-hover:[transform:perspective(1000px)_rotateX(0deg)_translateY(-3px)]"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm">
            Blog Post <ChevronDown className="h-3 w-3" />
          </span>
          {WRITER_TOOLS.map(({ icon: ToolIcon, label }, i) => (
            <motion.span
              key={label}
              whileHover={{ y: -3, scale: 1.08 }}
              className={`inline-flex cursor-default items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                activeTool === i ? "bg-indigo-500 text-white shadow-md" : "bg-white/80 text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              <ToolIcon className="h-3 w-3" />
              {label}
            </motion.span>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          <p className="text-sm font-bold text-[#0f1030]">The Future of AI</p>
          <div className="mt-2">
            <Typewriter text={WRITER_TEXT} />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

/* ====================================================================== */
/* Card 4: Data Analysis (+ nested AI Agents panel)                        */
/* ====================================================================== */

function smoothPath(xs, ys) {
  return xs
    .map((x, i) => {
      if (i === 0) return `M${x},${ys[i]}`;
      const cx = (xs[i - 1] + x) / 2;
      return `C${cx},${ys[i - 1]} ${cx},${ys[i]} ${x},${ys[i]}`;
    })
    .join(" ");
}

function ChartMockup({ replayKey }) {
  const W = 240;
  const H = 120;
  const padX = 10;
  const padY = 14;
  const n = CHART_POINTS.length;
  const xs = CHART_POINTS.map((_, i) => padX + (i * (W - 2 * padX)) / (n - 1));
  const ys = CHART_POINTS.map((v) => H - padY - (v / 100) * (H - 2 * padY));
  const line = smoothPath(xs, ys);
  const area = `${line} L${xs[n - 1]},${H} L${xs[0]},${H} Z`;
  const [hover, setHover] = useState(null);

  return (
    <motion.div
      key={replayKey}
      variants={STAGGER}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="rounded-2xl border border-white/90 bg-white/75 p-3 shadow-[0_18px_40px_-16px_rgba(79,70,229,0.35)]"
    >
      <motion.span
        variants={POP}
        whileHover={{ scale: 1.08 }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600"
      >
        <CountUp to={38} prefix="+" suffix="%" /> Growth
        <TrendingUp className="h-3 w-3" />
      </motion.span>

      <div className="relative mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="suit-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="suit-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              stroke="#c7d2fe"
              strokeWidth="0.8"
              strokeDasharray="3 4"
              opacity="0.7"
            />
          ))}
          <motion.path
            d={area}
            fill="url(#suit-area)"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1, delay: 0.9 } } }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="url(#suit-line)"
            strokeWidth="3"
            strokeLinecap="round"
            variants={{
              hidden: { pathLength: 0 },
              show: { pathLength: 1, transition: { duration: 1.6, ease: "easeInOut" } },
            }}
          />
          {xs.map((x, i) => (
            <g key={i}>
              <motion.circle
                cx={x}
                cy={ys[i]}
                r={hover === i ? 5.5 : 3.5}
                fill="#fff"
                stroke="#6366f1"
                strokeWidth="2"
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  show: { opacity: 1, scale: 1, transition: { delay: 0.3 + i * 0.16, type: "spring" } },
                }}
              />
              <circle
                cx={x}
                cy={ys[i]}
                r="11"
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          ))}
        </svg>

        <AnimatePresence>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${(xs[hover] / W) * 100}%`, top: `${(ys[hover] / H) * 100}%` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: -6, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                className="whitespace-nowrap rounded-lg bg-[#0f1030] px-2 py-1 text-[10px] font-semibold text-white shadow-lg"
              >
                Week {hover + 1} · {CHART_POINTS[hover]}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <motion.span
        variants={POP}
        whileHover={{ scale: 1.06, y: -2 }}
        className="relative mt-2 inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-600 shadow-md"
      >
        <span className="relative flex h-4 w-4 items-center justify-center text-amber-500">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-amber-300/60"
            animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <Lightbulb className="relative h-3 w-3" />
        </span>
        Insight detected
      </motion.span>
    </motion.div>
  );
}

function AgentsPanel({ className = "" }) {
  const { ref, step } = useCycle(AGENT_STEPS.length, 1200);
  return (
    <motion.div
      ref={ref}
      style={{ z: 60 }}
      whileHover={{ y: -6, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`rounded-2xl border border-white/90 bg-white/90 p-3 shadow-[0_24px_50px_-14px_rgba(79,70,229,0.5)] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <Bot className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-[#0f1030]">AI Agents</p>
      </div>
      <p className="mt-1.5 text-[10px] leading-snug text-gray-500">
        Give AI a goal and let intelligent agents handle the work.
      </p>

      <div className="mt-3 flex items-start justify-between">
        {AGENT_STEPS.map(({ icon: StepIcon, label }, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex flex-1 items-start">
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  animate={{ scale: active ? 1.18 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-500 ${
                    done || active
                      ? "border-transparent bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md"
                      : "border-indigo-100 bg-white text-indigo-400"
                  }`}
                >
                  {active && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-indigo-400/50"
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <StepIcon className="relative h-3 w-3" />
                </motion.span>
                <span className="text-[8px] font-medium text-gray-500">{label}</span>
              </div>
              {i < AGENT_STEPS.length - 1 && (
                <span className="mx-0.5 mt-3.5 h-px flex-1 overflow-hidden rounded-full bg-indigo-100">
                  <motion.span
                    className="block h-full origin-left bg-indigo-400"
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function DataCard() {
  const { ref, key } = useReplay(10000);
  return (
    <BentoCard
      className="md:col-span-7"
      icon={BarChart3}
      title="Data Analysis"
      text="Turn complex information into clear insights."
      delay={0.24}
      glow="bg-sky-300/30"
    >
      <div ref={ref} className="relative md:min-h-[230px]">
        <div className="md:w-[60%]">
          <ChartMockup replayKey={key} />
        </div>
        <AgentsPanel className="mt-4 md:absolute md:right-0 md:top-6 md:mt-0 md:w-[52%]" />
      </div>
    </BentoCard>
  );
}

/* ====================================================================== */
/* Card 5: Automation                                                      */
/* ====================================================================== */

function AppMark({ app }) {
  switch (app) {
    case "gmail":
      return <span className="text-base font-black leading-none text-red-500">M</span>;
    case "slack":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <rect x="10" y="2" width="4" height="9" rx="2" fill="#36c5f0" />
          <rect x="13" y="10" width="9" height="4" rx="2" fill="#2eb67d" />
          <rect x="10" y="13" width="4" height="9" rx="2" fill="#ecb22e" />
          <rect x="2" y="10" width="9" height="4" rx="2" fill="#e01e5a" />
        </svg>
      );
    case "notion":
      return <span className="font-serif text-base font-black leading-none text-gray-900">N</span>;
    default:
      return <Plus className="h-4 w-4 text-gray-400" />;
  }
}

function AutomationCard() {
  const { ref, step } = useCycle(FLOW_STEPS.length, 1300);
  const H = 168;
  const tile = 36;
  const gap = (H - tile * APPS.length) / (APPS.length - 1);
  const centers = APPS.map((_, i) => tile / 2 + i * (tile + gap));

  return (
    <BentoCard
      className="md:col-span-5"
      icon={Zap}
      title="Automation (coming soon)"
      text="Planned: connect your tools and let AI automate repetitive workflows. This is a preview."
      delay={0.32}
      glow="bg-indigo-300/30"
    >
      <div ref={ref} className="flex items-stretch justify-between gap-1">
        <ul className="flex flex-col justify-between" style={{ height: H }}>
          {FLOW_STEPS.map(({ icon: StepIcon, label, done: isFinal }, i) => {
            const passed = i < step;
            const active = i === step;
            const lit = passed || active;
            return (
              <motion.li
                key={label}
                whileHover={{ x: 5, scale: 1.05 }}
                className={`relative flex w-[122px] cursor-default items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold shadow-md transition-colors duration-500 ${
                  lit
                    ? isFinal
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "border-white/90 bg-white/85 text-indigo-500"
                }`}
              >
                {active && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-xl bg-indigo-400/40"
                    animate={{ scale: [1, 1.12], opacity: [0.6, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <StepIcon className="relative h-3.5 w-3.5 shrink-0" />
                <span className="relative">{label}</span>
                {i < FLOW_STEPS.length - 1 && (
                  <ChevronDown className="absolute -bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 text-indigo-300" />
                )}
              </motion.li>
            );
          })}
        </ul>

        <svg viewBox={`0 0 32 ${H}`} className="w-8 flex-none" style={{ height: H }} aria-hidden>
          {centers.map((y, i) => (
            <motion.path
              key={i}
              d={`M0,${H / 2} C16,${H / 2} 16,${y} 32,${y}`}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              animate={{ strokeDashoffset: [0, -14] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </svg>

        <ul className="flex flex-col justify-between" style={{ height: H }}>
          {APPS.map((app, i) => (
            <motion.li
              key={app}
              whileHover={{ scale: 1.2, rotate: 6, y: -2 }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center rounded-xl border border-white/90 bg-white shadow-md"
              style={{ width: tile, height: tile }}
            >
              <AppMark app={app} />
            </motion.li>
          ))}
        </ul>
      </div>
    </BentoCard>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function AISuit() {
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
        id="features"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-20 md:py-28"
      >
        <Background mx={mx} my={my} scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          <Header mx={mx} my={my} />

          <div className="mt-16 grid gap-5 lg:grid-cols-[0.65fr_1fr]" style={{ perspective: 1600 }}>
            <ChatCard />
            <div className="grid gap-5 md:grid-cols-12">
              <ImageCard />
              <WriterCard />
              <DataCard />
              <AutomationCard />
            </div>
          </div>

          <Reveal3D className="mt-16 flex flex-col items-center gap-2 text-sm text-gray-500">
            <span>{FOOTNOTE}</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-indigo-500"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </Reveal3D>
        </div>
      </section>
    </MotionConfig>
  );
}