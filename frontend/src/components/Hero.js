"use client";

/**
 * Hero section (single self-contained file, no Navbar).
 *
 * Usage in app/page.js:
 *   import Hero from "./components/Hero";
 *   <Hero exploreHref="#features" />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * The badge text, headline, stats and card labels are in the DATA block
 * below. The stats (10K+, 50K+, 99.9%) come from the mockup, so replace
 * them with your real numbers before publishing.
 *
 * DEMO BUTTON:
 *  - DEMO.video set  -> "Watch Demo" opens a video popup.
 *  - DEMO.video ""   -> button becomes "Try Live Demo" and links to
 *                       DEMO.fallbackHref (default /chat).
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom"; // NEW: modal is rendered on document.body
import {
  AnimatePresence, // NEW: modal enter/exit animation
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  Pencil,
  Play,
  ShieldCheck,
  Users,
  X, // NEW: modal close icon
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BADGE = "Next Generation AI Platform";

const HEADING = [
  { text: "AI", gradient: "from-blue-500 to-violet-600" },
  { text: "that" },
  { text: "thinks." },
  { br: true },
  { text: "Creates." },
  { text: "Evolves.", gradient: "from-blue-500 via-indigo-500 to-fuchsia-500" },
];

const SUBTEXT =
  "Build faster with intelligent AI tools, powerful agents, and a platform designed for the future.";

// NEW: Demo button config.
// video: YouTube embed URL ("https://www.youtube.com/embed/VIDEO_ID"),
//        or a file in /public ("/demo.mp4"). Leave "" if you have no video yet.
// fallbackHref: where the button goes when `video` is empty.
const DEMO = {
  video: "",
  fallbackHref: "/chat",
  title: "See NovaAI in action",
};

const STATS = [
  { icon: Users, value: 10, decimals: 0, suffix: "K+", label: "Active Users" },
  { icon: Zap, value: 50, decimals: 0, suffix: "K+", label: "AI Tasks Completed" },
  { icon: ShieldCheck, value: 99.9, decimals: 1, suffix: "%", label: "Uptime" },
];

// pos: where the card floats around the orb. depth: mouse-parallax strength.
const FEATURE_CARDS = [
  {
    icon: MessageCircle,
    title: "AI Chat",
    text: "Ask anything...",
    tone: "bg-blue-100 text-blue-600",
    pos: "left-[2%] top-[14%]",
    depth: 34,
    bob: 5.2,
  },
  {
    icon: ImageIcon,
    title: "Generate Images",
    text: "Turn ideas into visuals",
    tone: "bg-violet-100 text-violet-600",
    pos: "left-[44%] top-[0%]",
    depth: -28,
    bob: 6.4,
  },
  {
    icon: Pencil,
    title: "Write Content",
    text: "Blogs, emails, & more",
    tone: "bg-fuchsia-100 text-fuchsia-600",
    pos: "right-[-3%] top-[20%]",
    depth: 40,
    bob: 5.8,
  },
  {
    icon: BarChart3,
    title: "Analyze Data",
    text: "Get insights instantly",
    tone: "bg-blue-100 text-blue-600",
    pos: "left-[-2%] top-[54%]",
    depth: -36,
    bob: 6.8,
  },
  {
    icon: Bot,
    title: "Build Agents",
    text: "Automate your workflow",
    tone: "bg-indigo-100 text-indigo-600",
    pos: "right-[-1%] top-[64%]",
    depth: 30,
    bob: 5.5,
  },
];

/* ====================================================================== */
/* 3D helpers                                                              */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded. Both states use the
// same number of layers so Framer Motion can animate between them.
const extrude = (d, color = "#cfd6f8") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(59,91,255,0.2)`;

const TEXT_3D = extrude(0.7);
const TEXT_3D_LIFT = extrude(1.6);

const TILT_SPRING = { stiffness: 220, damping: 18 };

const DEFAULT_ENTER = {
  initial: { opacity: 0, y: 40, rotateX: -22, transformPerspective: 900 },
  whileInView: { opacity: 1, y: 0, rotateX: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: EASE },
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
    <Outer className={className} {...(outerProps || DEFAULT_ENTER)}>
      <motion.div
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        whileHover={{ y: -lift, scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
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
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
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
    <h1 className={className} aria-label={label}>
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
              animate={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: { duration: 0.85, delay: 0.25 + idx * 0.1, ease: EASE },
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

/** Number that counts up once it is in view. */
function CountUp({ to, decimals = 0, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [text, setText] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 2,
      delay: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setText(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, to, decimals]);

  return (
    <span ref={ref}>
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
/* Background: aurora, 3D waves, bubbles, particles                        */
/* ====================================================================== */

// Each pair has the same path commands, so Framer Motion can morph between them.
const WAVES = [
  {
    from: "M0,190 C200,90 420,300 720,210 C1020,120 1240,260 1440,170 L1440,400 L0,400 Z",
    to: "M0,240 C220,150 440,260 720,170 C1000,100 1220,300 1440,210 L1440,400 L0,400 Z",
    fill: "url(#hero-wave-a)",
    duration: 11,
  },
  {
    from: "M0,250 C240,170 480,320 760,240 C1040,160 1240,300 1440,230 L1440,400 L0,400 Z",
    to: "M0,210 C260,290 500,200 760,270 C1020,340 1240,190 1440,260 L1440,400 L0,400 Z",
    fill: "url(#hero-wave-b)",
    duration: 13,
  },
  {
    from: "M0,300 C260,230 520,340 800,290 C1080,240 1260,330 1440,280 L1440,400 L0,400 Z",
    to: "M0,270 C280,330 540,260 800,320 C1060,380 1260,270 1440,320 L1440,400 L0,400 Z",
    fill: "url(#hero-wave-c)",
    duration: 9,
  },
];

function Waves({ mx }) {
  const x = useTransform(mx, [-1, 1], [-30, 30]);
  return (
    <motion.div style={{ x }} className="absolute -inset-x-10 bottom-0 h-[44%]">
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="hero-wave-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="hero-wave-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5d0fe" stopOpacity="0.7" />
            <stop offset="0.55" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="1" stopColor="#93c5fd" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="hero-wave-c" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a5b4fc" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#e0e7ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="hero-wave-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {WAVES.map((w, i) => (
          <g key={i}>
            <motion.path
              fill={w.fill}
              initial={{ d: w.from }}
              animate={{ d: [w.from, w.to, w.from] }}
              transition={{ duration: w.duration, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              fill="none"
              stroke="url(#hero-wave-line)"
              strokeWidth="2.5"
              initial={{ d: w.from.replace(/ L1440,400 L0,400 Z$/, "") }}
              animate={{
                d: [
                  w.from.replace(/ L1440,400 L0,400 Z$/, ""),
                  w.to.replace(/ L1440,400 L0,400 Z$/, ""),
                  w.from.replace(/ L1440,400 L0,400 Z$/, ""),
                ],
              }}
              transition={{ duration: w.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.7) % 8,
  duration: 9 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function HeroBackground({ mx, my }) {
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(129,140,248,0.22), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* cursor spotlight */}
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
      <ParallaxLayer mx={mx} my={my} depth={-44} className="absolute -right-32 top-24">
        <motion.div
          className="h-[32rem] w-[32rem] rounded-full bg-sky-300/45 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute bottom-16 left-1/3">
        <motion.div
          className="h-[22rem] w-[22rem] rounded-full bg-pink-300/35 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {/* 3D waves */}
      <Waves mx={mx} />

      {/* rising particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] ${p.tint}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -720], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {/* big glossy bubbles, like the mockup's corners */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -right-12 top-24 hidden md:block">
        <Bubble size={150} tone="blue" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-30} className="absolute right-6 top-[38%] hidden md:block">
        <Bubble size={54} tone="pink" delay={1.2} bob={8} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={44} className="absolute -left-6 bottom-[26%] hidden md:block">
        <Bubble size={70} tone="cyan" delay={0.6} bob={8} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={36} className="absolute left-[46%] top-[10%] hidden lg:block">
        <Bubble size={24} tone="pink" delay={0.3} bob={6} />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[6%] top-[16%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "left-[44%] top-[30%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "right-[30%] top-[10%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[6%] bottom-[30%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[30%] bottom-[24%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
/* Hero visual: glowing AI orb on a glass podium                           */
/* ====================================================================== */

const SPHERE_BG =
  "radial-gradient(circle at 50% 50%, #ffffff 0%, #c6ecff 7%, #58c4ff 20%, #3b6cff 42%, #3a2fd0 68%, #1b1a66 100%)";

function Podium() {
  const layers = Array.from({ length: 8 });
  return (
    <div
      className="absolute left-[6%] top-[38%] aspect-square w-[88%]"
      style={{ transform: "rotateX(74deg)", transformStyle: "preserve-3d" }}
    >
      {/* soft shadow under the podium */}
      <div
        className="absolute inset-[4%] rounded-full bg-indigo-400/50 blur-2xl"
        style={{ transform: "translateZ(-56px)" }}
      />
      {/* glass thickness */}
      {layers.map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            transform: `translateZ(${-(i + 1) * 4}px)`,
            background:
              i === layers.length - 1 ? "#a5b4fc" : "linear-gradient(180deg, #eef1ff, #c7d2fe)",
          }}
        />
      ))}
      {/* top face */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full border border-white/90"
        style={{
          background:
            "radial-gradient(circle, #ffffff 0%, #dbe7ff 28%, #e9defc 52%, #c7d2fe 80%, #ffffff 100%)",
          boxShadow: "inset 0 0 40px rgba(255,255,255,0.9), 0 0 60px rgba(99,102,241,0.5)",
        }}
      >
        <motion.div
          className="absolute inset-[9%] rounded-full border-2 border-dashed border-indigo-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[18%] rounded-full border-2 border-sky-300/70 shadow-[0_0_24px_rgba(56,189,248,0.7)]" />
        <div className="absolute inset-[28%] rounded-full border-2 border-indigo-400/60 shadow-[0_0_24px_rgba(99,102,241,0.7)]" />
        {[0, 1.2, 2.4].map((delay) => (
          <motion.div
            key={delay}
            className="absolute inset-[22%] rounded-full border-2 border-sky-400/80"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.7], opacity: [0.9, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, delay, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="absolute inset-[36%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, #ffffff 0%, rgba(125,211,252,0.9) 40%, rgba(99,102,241,0) 75%)",
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
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
        style={{ background: gradient, WebkitMask: mask, mask, filter: "blur(7px)" }}
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

function MechanicalRing() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 h-full w-full"
      style={{ filter: "drop-shadow(0 8px 12px rgba(80,90,180,0.35))" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#e3e9ff" />
          <stop offset="1" stopColor="#aab6ea" />
        </linearGradient>
      </defs>
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }}>
        <circle cx="100" cy="100" r="91" fill="none" stroke="url(#hero-ring-grad)" strokeWidth="13" strokeDasharray="40 7.65" strokeLinecap="round" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeDasharray="34 13.65" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}>
        <circle cx="100" cy="100" r="79" fill="none" stroke="#b8c2ee" strokeWidth="5" strokeDasharray="22 6" strokeLinecap="round" />
        <circle cx="100" cy="100" r="79" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeDasharray="22 6" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function PlasmaOrb() {
  return (
    <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
      {/* glass shell */}
      <div
        className="absolute inset-[6%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(226,232,255,0.55) 45%, rgba(196,181,253,0.35) 100%)",
          boxShadow: "inset 0 0 40px rgba(255,255,255,0.9), 0 30px 60px rgba(99,102,241,0.35)",
        }}
      />

      {/* glowing plasma sphere */}
      <div
        className="absolute inset-[13%] overflow-hidden rounded-full"
        style={{
          background: SPHERE_BG,
          boxShadow: "inset 0 0 50px rgba(20,20,90,0.75), 0 0 70px rgba(56,130,255,0.8)",
        }}
      >
        <motion.div
          className="absolute -inset-[25%] mix-blend-screen blur-md"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(120,220,255,0.8) 60deg, rgba(255,255,255,0) 130deg, rgba(167,139,250,0.75) 210deg, rgba(255,255,255,0) 290deg, rgba(56,189,248,0.65) 340deg, rgba(255,255,255,0) 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-[25%] mix-blend-screen blur-md"
          style={{
            background:
              "conic-gradient(from 90deg, rgba(255,255,255,0) 0deg, rgba(244,114,182,0.6) 70deg, rgba(255,255,255,0) 150deg, rgba(96,165,250,0.8) 240deg, rgba(255,255,255,0) 330deg)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-[25%] opacity-70"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.6) 0deg 0.8deg, transparent 0.8deg 6deg)",
            WebkitMask: "radial-gradient(circle, transparent 6%, #000 22%, transparent 70%)",
            mask: "radial-gradient(circle, transparent 6%, #000 22%, transparent 70%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.9) 6%, rgba(160,235,255,0.7) 16%, rgba(255,255,255,0) 42%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-[14%] top-[8%] h-[26%] w-[40%] -rotate-[28deg] rounded-full bg-white/50 blur-md" />
      </div>

      <MechanicalRing />

      {/* the two big orbit rings, with satellites */}
      <OrbitRing
        inset="-24%"
        tilt={-20}
        direction={1}
        duration={16}
        thickness={5}
        gradient="conic-gradient(from 0deg, rgba(56,189,248,0), rgba(56,189,248,1) 90deg, rgba(99,102,241,1) 190deg, rgba(56,189,248,0) 300deg)"
        satellites={[
          { angle: 20, size: 15, tone: "blue" },
          { angle: 200, size: 10, tone: "pink" },
        ]}
      />
      <OrbitRing
        inset="-38%"
        tilt={16}
        direction={-1}
        duration={22}
        thickness={4}
        gradient="conic-gradient(from 120deg, rgba(244,114,182,0), rgba(244,114,182,1) 100deg, rgba(167,139,250,1) 200deg, rgba(244,114,182,0) 320deg)"
        satellites={[{ angle: 90, size: 13, tone: "pink" }]}
      />
    </div>
  );
}

function FeatureCard({ card, index, mx, my }) {
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
            animate: { opacity: 1, scale: 1, y: 0, rotateX: 0 },
            transition: { duration: 0.8, delay: 0.9 + index * 0.12, ease: EASE },
          }}
          cardClassName="group flex min-w-[168px] items-center gap-3 rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-[0_14px_40px_-12px_rgba(79,70,229,0.35)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_28px_60px_-12px_rgba(79,70,229,0.55)]"
        >
          <span style={{ transform: "translateZ(34px)" }}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-700 group-hover:scale-110 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${card.tone}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </span>
          <span className="block" style={{ transform: "translateZ(22px)" }}>
            <span className="block text-sm font-bold leading-tight text-[#1b1b3a]">{card.title}</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-gray-500">{card.text}</span>
          </span>
        </Tilt>
      </motion.div>
    </ParallaxLayer>
  );
}

function HeroVisual({ mx, my }) {
  const rotateY = useTransform(mx, [-1, 1], [-14, 14]);
  const rotateX = useTransform(my, [-1, 1], [10, -10]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" style={{ perspective: 1200 }}>
      <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {/* ambient glow */}
        <motion.div
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.4),transparent_65%)] blur-2xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <Podium />

          <motion.div
            className="absolute left-[19%] top-[8%] aspect-square w-[62%]"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <PlasmaOrb />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* small free-floating spheres around the orb */}
      <ParallaxLayer mx={mx} my={my} depth={-58} className="absolute left-[12%] top-[34%] z-10">
        <Bubble size={16} tone="blue" delay={0.2} bob={5} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={52} className="absolute right-[20%] top-[8%] z-10">
        <Bubble size={12} tone="cyan" delay={0.9} bob={6} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-46} className="absolute right-[8%] top-[52%] z-10">
        <Bubble size={20} tone="pink" delay={0.5} bob={7} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={40} className="absolute left-[22%] top-[66%] z-10">
        <Bubble size={11} tone="blue" delay={1.1} bob={5} />
      </ParallaxLayer>

      {FEATURE_CARDS.map((card, i) => (
        <FeatureCard key={card.title} card={card} index={i} mx={mx} my={my} />
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Left column                                                             */
/* ====================================================================== */

function Badge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -3, scale: 1.05 }}
      className="relative mb-7 inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-white/80 bg-blue-100/70 px-4 py-2 shadow-[0_8px_30px_-8px_rgba(59,91,255,0.4)] backdrop-blur-md"
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="text-blue-600"
      >
        <Sparkle4 className="h-4 w-4" />
      </motion.span>
      <span className="text-sm font-semibold text-blue-600">{BADGE}</span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function ExploreButton({ href }) {
  return (
    <Magnetic>
      <motion.a
        href={href}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-10px_rgba(59,91,255,0.7)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-10px_rgba(59,91,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ["-150%", "450%"] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        />
        <span className="relative">Explore AI</span>
        <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
      </motion.a>
    </Magnetic>
  );
}

// CHANGED: with `onOpen` it is a button that opens the video modal ("Watch Demo").
// Without it, it is a normal link to `href` ("Try Live Demo").
function DemoButton({ href, onOpen }) {
  const Tag = onOpen ? motion.button : motion.a;
  const tagProps = onOpen ? { type: "button", onClick: onOpen } : { href };

  return (
    <Magnetic>
      <Tag
        {...tagProps}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="group inline-flex items-center gap-3 rounded-full border border-white bg-white/90 px-7 py-4 text-base font-semibold text-[#1b1b3a] shadow-[0_12px_30px_-10px_rgba(79,70,229,0.35)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_24px_50px_-10px_rgba(79,70,229,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-blue-400/50"
            animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <Play className="relative h-5 w-5 fill-blue-600 text-blue-600 transition-transform duration-300 group-hover:scale-125" />
        </span>
        {onOpen ? "Watch Demo" : "Try Live Demo"}
      </Tag>
    </Magnetic>
  );
}

/**
 * NEW: Fullscreen video popup. Esc, backdrop click or the X button closes it.
 * Rendered with a portal on document.body so it always sits above the fixed
 * Navbar (the hero section uses `isolate`, which would trap its z-index).
 */
function DemoModal({ open, onClose }) {
  // true in the browser, false while server-rendering: the portal needs document.body
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const isFile = /\.(mp4|webm)$/i.test(DEMO.video);
  // add autoplay to YouTube/Vimeo embeds
  const embedSrc = DEMO.video + (DEMO.video.includes("?") ? "&" : "?") + "autoplay=1&rel=0";

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-label={DEMO.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            // z-[60] sits above the fixed navbar (z-50)
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1030]/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92, rotateX: -12, transformPerspective: 900 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/90 bg-white/90 p-3 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.7)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <span className="text-[13px] font-bold text-[#0f1030]">{DEMO.title}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close demo"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#0f1030]">
                {isFile ? (
                  <video src={DEMO.video} controls autoPlay playsInline className="h-full w-full" />
                ) : (
                  <iframe
                    src={embedSrc}
                    title={DEMO.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body
  );
}

function StatItem({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: -40, transformPerspective: 700 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 1.0 + index * 0.12, ease: EASE }}
      className={index > 0 ? "sm:border-l sm:border-indigo-200/70" : ""}
    >
      <motion.div
        whileHover={{ y: -6, rotateX: 14, scale: 1.07 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        style={{ transformPerspective: 600 }}
        className={`group flex cursor-default items-center gap-3 py-1 ${index > 0 ? "sm:pl-7" : ""} ${
          index < STATS.length - 1 ? "sm:pr-7" : ""
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-indigo-600 transition-all duration-700 group-hover:bg-white group-hover:shadow-lg group-hover:[transform:perspective(300px)_rotateY(360deg)]">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <span>
          <span
            className="block text-xl font-extrabold leading-none text-[#1b1b3a]"
            style={{ textShadow: "1px 1px 0 #cfd6f8, 2px 2px 0 #cfd6f8, 3px 3px 8px rgba(59,91,255,0.25)" }}
          >
            <CountUp to={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
          </span>
          <span className="mt-1 block text-xs text-gray-500">{stat.label}</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

function ScrollCue() {
  const onClick = () => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  return (
    <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Scroll to explore"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6, ease: EASE }}
        whileHover={{ y: -5, scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group flex flex-col items-center gap-2 text-sm font-medium text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <span className="flex h-12 w-7 justify-center rounded-full border-2 border-indigo-300/80 bg-white/70 pt-2 shadow-md backdrop-blur-md transition-colors group-hover:border-indigo-500">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-indigo-500"
            animate={{ y: [0, 18, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <span className="transition-colors group-hover:text-indigo-600">Scroll to explore</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-indigo-500"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

// CHANGED: demoHref now defaults to DEMO.fallbackHref (/chat) instead of "#demo"
export default function Hero({ exploreHref = "#features", demoHref = DEMO.fallbackHref }) {
  const sectionRef = useRef(null);
  const [demoOpen, setDemoOpen] = useState(false); // NEW: video modal state
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);

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
        id="home"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-[#f6f4ff] via-[#eef4ff] to-[#f9f2ff]"
      >
        <HeroBackground mx={mx} my={my} />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 pb-44 pt-32 md:px-14 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:px-20 lg:pt-36">
          <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative">
            <Badge />

            <Heading3D
              tokens={HEADING}
              className="text-5xl font-extrabold leading-[1.06] tracking-tight text-[#0f1030] sm:text-6xl lg:text-7xl"
            />

            <Reveal3D
              as="p"
              delay={0.9}
              className="mt-7 max-w-lg text-lg leading-relaxed text-gray-600"
            >
              {SUBTEXT}
            </Reveal3D>

            <Reveal3D delay={1.05} className="mt-9 flex flex-wrap items-center gap-4">
              <ExploreButton href={exploreHref} />
              {/* CHANGED: opens the modal if DEMO.video is set, otherwise links to demoHref */}
              <DemoButton
                href={demoHref}
                onOpen={DEMO.video ? () => setDemoOpen(true) : undefined}
              />
            </Reveal3D>

            <div className="mt-12 flex flex-wrap items-center gap-y-5" style={{ perspective: 900 }}>
              {STATS.map((stat, i) => (
                <StatItem key={stat.label} stat={stat} index={i} />
              ))}
            </div>
          </motion.div>

          <motion.div style={{ y: visualY }}>
            <HeroVisual mx={mx} my={my} />
          </motion.div>
        </div>

        <ScrollCue />
      </section>

      {/* NEW: video popup (rendered on document.body through a portal) */}
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </MotionConfig>
  );
}