"use client";

/**
 * Testimonials section (single self-contained file).
 *
 * Drop it into app/page.js like your other sections:
 *   import Testimonials from "./components/Testimonials";
 *   <Testimonials />
 *
 * DEMO CONTENT: every name, quote, company and number below is fictional
 * (this is a demo project). The companies are invented and use generic
 * letter-badge marks, so no real brand logos or trademarks are shown.
 * Everything you need to edit is in the DATA block right below.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
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
import { ArrowLeft, ArrowRight, Globe, Quote, ShieldCheck, Sparkles, Star } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const HEADING = [
  { text: "Loved" },
  { text: "by" },
  { text: "creators," },
  { text: "teams" },
  { br: true },
  { text: "and" },
  { text: "businesses" },
  { text: "worldwide.", gradient: true },
];

const SUBTEXT =
  "Join thousands of happy users who are already building, creating, and achieving more with our AI platform.";

const STATS = [
  { icon: Sparkles, value: 50, decimals: 0, suffix: "K+", label: "Active Users" },
  { icon: Star, value: 4.9, decimals: 1, suffix: "/5", label: "Average Rating" },
  { icon: Globe, value: 120, decimals: 0, suffix: "+", label: "Countries" },
  { icon: ShieldCheck, value: 99.9, decimals: 1, suffix: "%", label: "Uptime" },
];

// Fictional demo companies (not real brands). `brand` is a key into DEMO_BRANDS below.
const STRIP = [
  { brand: "brightlabs", label: "BrightLabs" },
  { brand: "novatech", label: "NovaTech" },
  { brand: "pixelcraft", label: "PixelCraft" },
  { brand: "cloudnine", label: "CloudNine" },
  { brand: "loopify", label: "Loopify" },
];

// brand: which mark shows in the card's corner (or leave it out for none).
// photo: optional image path, e.g. "/images/alex.png". Initials show otherwise.
const TESTIMONIALS = [
  {
    name: "Alex Carter",
    role: "Product Designer, BrightLabs",
    quote: "This platform has completely changed the way I work. The AI tools are incredibly powerful and easy to use.",
    brand: "brightlabs",
    tone: "from-sky-400 to-blue-500",
  },
  {
    name: "Sarah Mitchell",
    role: "Founder, NovaTech",
    quote: "The AI agents are a game changer! They handle repetitive work so I can focus on what really matters.",
    brand: "novatech",
    tone: "from-pink-400 to-rose-500",
  },
  {
    name: "James Wilson",
    role: "CTO, PixelCraft",
    quote: "Incredible platform with so many useful tools. The workspace is clean, fast and super intuitive.",
    brand: "pixelcraft",
    tone: "from-indigo-400 to-violet-500",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Lead, Quillstone",
    quote: "I've tried many AI tools, but this one brings everything together. It's powerful, flexible and reliable.",
    brand: "quillstone",
    tone: "from-amber-400 to-orange-500",
  },
  {
    name: "Daniel Kim",
    role: "Engineering Manager, CloudNine",
    quote: "Setup took minutes and the whole team was productive the same day. The support has been fantastic.",
    brand: "cloudnine",
    tone: "from-emerald-400 to-teal-500",
  },
  {
    name: "Priya Sharma",
    role: "Head of Growth, Loopify",
    quote: "We automated our weekly reporting and now save hours every single week. It just works.",
    brand: "loopify",
    tone: "from-fuchsia-400 to-purple-500",
  },
  {
    name: "Lucas Meyer",
    role: "Independent Developer",
    quote: "Clean design, fast performance, and the AI features actually do what they promise.",
    tone: "from-cyan-400 to-sky-500",
  },
  {
    name: "Aisha Khan",
    role: "Operations Lead, Northbeam",
    quote: "Our workflows are smoother than ever, and our customers have noticed the difference.",
    brand: "northbeam",
    tone: "from-rose-400 to-pink-500",
  },
];

/* ====================================================================== */
/* Demo brand marks (fictional companies, generic letter badges)           */
/* ====================================================================== */

const DEMO_BRANDS = {
  brightlabs: { letter: "B", from: "#38bdf8", to: "#3b82f6" },
  novatech: { letter: "N", from: "#f472b6", to: "#e11d48" },
  pixelcraft: { letter: "P", from: "#818cf8", to: "#7c3aed" },
  quillstone: { letter: "Q", from: "#fbbf24", to: "#f97316" },
  cloudnine: { letter: "C", from: "#34d399", to: "#0d9488" },
  loopify: { letter: "L", from: "#e879f9", to: "#9333ea" },
  northbeam: { letter: "N", from: "#fb7185", to: "#ec4899" },
};

function BrandMark({ brand, className = "h-5 w-5" }) {
  const b = DEMO_BRANDS[brand];
  if (!b) return null;
  const id = `tm-demo-${brand}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={b.from} />
          <stop offset="1" stopColor={b.to} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill={`url(#${id})`} />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#fff"
      >
        {b.letter}
      </text>
    </svg>
  );
}

/* ====================================================================== */
/* 3D helpers                                                              */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded. Both states use the
// same number of layers so Framer Motion can animate between them.
const extrude = (d, color = "#c9cdf7") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(79,70,229,0.18)`;

const TEXT_3D = extrude(0.6);
const TEXT_3D_LIFT = extrude(1.5);

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

/** Heading whose words flip up in 3D, look extruded, and tilt on hover. */
function Heading3D({ tokens, className = "" }) {
  let wordIndex = 0;
  const label = tokens.filter((tok) => !tok.br).map((tok) => tok.text).join(" ");

  return (
    <h2 className={className} aria-label={label}>
      {tokens.map((tok, i) => {
        if (tok.br) return <br key={i} className="hidden md:block" />;
        const idx = wordIndex++;
        const hoverShadow = tok.gradient
          ? { filter: "drop-shadow(0 10px 12px rgba(99,102,241,0.45))" }
          : { textShadow: TEXT_3D_LIFT };

        return (
          <span key={i} aria-hidden className="mr-[0.25em] inline-block last:mr-0">
            <motion.span
              className={`inline-block cursor-default ${
                tok.gradient
                  ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent"
                  : ""
              }`}
              initial={{ opacity: 0, rotateX: -85, y: 30 }}
              whileInView={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: { duration: 0.75, delay: 0.15 + idx * 0.07, ease: EASE },
              }}
              whileHover={{
                y: -6,
                rotateX: 10,
                rotateY: -8,
                ...hoverShadow,
                transition: { type: "spring", stiffness: 300, damping: 14 },
              }}
              viewport={{ once: true, amount: 0.6 }}
              style={{
                transformPerspective: 700,
                transformOrigin: "50% 100%",
                ...(tok.gradient
                  ? { filter: "drop-shadow(0 5px 6px rgba(99,102,241,0.3))" }
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

/** Number that counts up once it scrolls into view. */
function CountUp({ to, decimals = 0, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [text, setText] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
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

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

function GlassCube({ size = 60, duration = 24, tone = "violet" }) {
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

function GlassRing({ size = 90, duration = 18, className = "" }) {
  return (
    <div style={{ width: size, height: size, perspective: 600 }}>
      <motion.div
        className={`h-full w-full rounded-full border-[5px] ${className}`}
        animate={{ rotateX: [0, 360], rotateY: [0, 180] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function FloatingBubble({ size = 40, delay = 0, className = "" }) {
  return (
    <motion.div
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 28%, #ffffff 0%, #dbe4ff 30%, #a5b4fc 65%, #8b5cf6 100%)",
        boxShadow: "inset -6px -8px 14px rgba(79,70,229,0.35), 0 12px 30px rgba(99,102,241,0.3)",
      }}
      animate={{ y: [0, -22, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Background({ mx, my, scrollYProgress }) {
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -60]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* slow aurora sweep */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-[120vmax] w-[120vmax] flex-none opacity-40 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(196,181,253,0.65), rgba(125,211,252,0.55), rgba(249,168,212,0.55), rgba(196,181,253,0.65))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* drifting blobs, each on its own parallax depth */}
      <ParallaxLayer mx={mx} my={my} depth={30} className="absolute -left-24 -top-24">
        <motion.div
          className="h-[26rem] w-[26rem] rounded-full bg-violet-300/40 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-40} className="absolute -right-32 top-10">
        <motion.div
          className="h-[30rem] w-[30rem] rounded-full bg-sky-300/40 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={24} className="absolute bottom-0 left-1/4">
        <motion.div
          className="h-[24rem] w-[24rem] rounded-full bg-pink-300/35 blur-3xl"
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

      {/* 3D perspective floor with lines flowing toward the viewer */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] overflow-hidden"
        style={{
          perspective: 700,
          WebkitMaskImage: "linear-gradient(to top, #000 5%, transparent 85%)",
          maskImage: "linear-gradient(to top, #000 5%, transparent 85%)",
        }}
      >
        <div
          className="absolute -inset-x-1/2 -bottom-[10%] h-[160%]"
          style={{ transform: "rotateX(64deg)", transformOrigin: "50% 100%" }}
        >
          <motion.div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.25) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
            animate={{ backgroundPositionY: ["0px", "72px"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* floating glass shapes */}
      <ParallaxLayer mx={mx} my={my} depth={46} className="absolute left-[44%] top-[6%] hidden md:block">
        <GlassCube size={54} duration={26} tone="violet" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-56} className="absolute right-[4%] top-[44%] hidden md:block">
        <GlassCube size={70} duration={32} tone="sky" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={38} className="absolute left-[3%] top-[58%] hidden md:block">
        <GlassCube size={46} duration={22} tone="pink" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-30} className="absolute right-[22%] top-[3%] hidden md:block">
        <GlassRing size={84} duration={18} className="border-violet-300/70" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={30} className="absolute bottom-[6%] left-[38%] hidden md:block">
        <GlassRing size={64} duration={14} className="border-sky-300/80" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-64} className="absolute right-[10%] top-[26%] hidden md:block">
        <FloatingBubble size={30} delay={0.6} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={50} className="absolute bottom-[22%] left-[10%] hidden md:block">
        <FloatingBubble size={44} delay={1.4} />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[24%] top-[14%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[28%] top-[36%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.7 },
        { pos: "left-[8%] top-[42%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.3 },
        { pos: "right-[8%] bottom-[16%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[50%] bottom-[34%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
/* 3D glass orb with rings and satellites                                  */
/* ====================================================================== */

const RING_MASK = {
  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
  mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
};

function Orb({ mx, my, className = "" }) {
  const rotateY = useTransform(mx, [-1, 1], [-22, 22]);
  const rotateX = useTransform(my, [-1, 1], [16, -16]);

  return (
    <div className={`relative ${className}`} style={{ perspective: 900 }} aria-hidden>
      <motion.div
        className="relative h-full w-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* glow */}
          <div className="absolute -inset-[30%] rounded-full bg-violet-400/30 blur-3xl" />

          {/* the sphere */}
          <div
            className="absolute inset-[14%] overflow-hidden rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 26%, #ffffff 0%, #d7e4ff 16%, #8fb0ff 42%, #7c6cff 72%, #5638d6 100%)",
              boxShadow:
                "inset -18px -22px 40px rgba(60,30,170,0.45), inset 10px 10px 30px rgba(255,255,255,0.7), 0 30px 60px rgba(99,102,241,0.45)",
            }}
          >
            <motion.div
              className="absolute -inset-[30%] opacity-50 mix-blend-soft-light"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.9), transparent 35%, rgba(244,114,182,0.7), transparent 70%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute left-[16%] top-[10%] h-[30%] w-[42%] -rotate-[28deg] rounded-full bg-white/70 blur-md" />
          </div>

          {/* main ring */}
          <div
            className="absolute -inset-[8%]"
            style={{ transform: "rotateX(72deg) rotateY(-14deg)", transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                ...RING_MASK,
                background:
                  "conic-gradient(from 0deg, rgba(255,255,255,0.15), rgba(167,139,250,0.95) 110deg, rgba(56,189,248,0.95) 210deg, rgba(255,255,255,0.15) 320deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -top-2 left-1/2 -ml-2 h-4 w-4 rounded-full bg-gradient-to-br from-white to-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.9)]" />
            </motion.div>
          </div>

          {/* second, thinner ring */}
          <div
            className="absolute -inset-[24%]"
            style={{ transform: "rotateX(72deg) rotateY(52deg)", transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                background:
                  "conic-gradient(from 90deg, rgba(255,255,255,0.1), rgba(244,114,182,0.9) 130deg, rgba(167,139,250,0.9) 230deg, rgba(255,255,255,0.1) 330deg)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -bottom-1.5 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-white to-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
            </motion.div>
          </div>

          {/* tiny twinkles around the orb */}
          <motion.span
            className="absolute -left-2 top-[18%] text-indigo-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkle4 className="h-3.5 w-3.5" />
          </motion.span>
          <motion.span
            className="absolute -right-3 bottom-[22%] text-sky-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: 1 }}
          >
            <Sparkle4 className="h-3 w-3" />
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/* Header                                                                  */
/* ====================================================================== */

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
        whileHover={{ rotate: 180 }}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white"
      >
        <Sparkle4 className="h-3 w-3" />
      </motion.span>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
        Real people. Real results.
      </span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function Header({ mx, my }) {
  return (
    <div className="relative">
      <Orb
        mx={mx}
        my={my}
        className="mx-auto mb-6 h-40 w-40 lg:absolute lg:-left-2 lg:top-0 lg:mb-0 lg:h-56 lg:w-56"
      />

      <div className="mx-auto max-w-3xl text-center" style={{ perspective: 1000 }}>
        <Badge />

        <Heading3D
          tokens={HEADING}
          className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#1b1b3a] md:text-5xl"
        />

        <motion.p
          initial={{ opacity: 0, y: 24, rotateX: -30, transformPerspective: 900 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg"
        >
          {SUBTEXT}
        </motion.p>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Stats and logo strip                                                    */
/* ====================================================================== */

const GLASS =
  "rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_40px_-12px_rgba(99,102,241,0.3)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_30px_70px_-15px_rgba(99,102,241,0.5)]";

function StatItem({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className={`group flex cursor-default items-center gap-3 px-5 py-2 ${
        index > 0 ? "sm:border-l sm:border-indigo-100" : ""
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-500 shadow-sm transition-all duration-700 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:[transform:perspective(300px)_rotateY(360deg)]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span
          className="block text-xl font-extrabold leading-none text-[#1b1b3a]"
          style={{ textShadow: "1px 1px 0 #c9cdf7, 2px 2px 0 #c9cdf7, 3px 3px 8px rgba(79,70,229,0.2)" }}
        >
          <CountUp to={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
        </span>
        <span className="mt-1 block text-xs text-gray-500">{stat.label}</span>
      </span>
    </motion.div>
  );
}

function ProofRow() {
  return (
    <div className="mt-14 flex flex-col items-stretch justify-center gap-5 lg:flex-row" style={{ perspective: 1400 }}>
      <Tilt max={3} lift={6} scale={1.01} glare cardClassName={`${GLASS} p-3`}>
        <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </Tilt>

      <Tilt
        max={3}
        lift={6}
        scale={1.01}
        glare
        outerProps={{
          ...DEFAULT_ENTER,
          transition: { duration: 0.7, delay: 0.12, ease: EASE },
        }}
        cardClassName={`${GLASS} flex flex-wrap items-center justify-center gap-x-2 gap-y-2 p-3`}
      >
        {STRIP.map((item, i) => (
          <motion.span
            key={item.brand}
            whileHover={{ y: -4, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className={`group flex cursor-default items-center gap-2 px-4 py-2 ${
              i > 0 ? "lg:border-l lg:border-indigo-100" : ""
            }`}
          >
            <BrandMark
              brand={item.brand}
              className="h-5 w-5 opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            />
            <span className="text-sm font-semibold text-gray-500 transition-colors duration-300 group-hover:text-gray-900">
              {item.label}
            </span>
          </motion.span>
        ))}
      </Tilt>
    </div>
  );
}

/* ====================================================================== */
/* Testimonial cards + carousel                                            */
/* ====================================================================== */

function initialsOf(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ item }) {
  const base =
    "h-14 w-14 shrink-0 rounded-full ring-2 ring-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110";
  if (item.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.photo} alt={item.name} className={`${base} object-cover`} />;
  }
  return (
    <span
      className={`${base} flex items-center justify-center bg-gradient-to-br text-lg font-bold text-white ${item.tone}`}
    >
      {initialsOf(item.name)}
    </span>
  );
}

function TestimonialCard({ item, index, dir }) {
  return (
    <Tilt
      max={10}
      lift={12}
      scale={1.03}
      glare
      className="h-full"
      outerProps={{
        initial: { opacity: 0, y: 50, rotateY: dir * -40, transformPerspective: 1000 },
        animate: { opacity: 1, y: 0, rotateY: 0 },
        transition: { duration: 0.7, delay: index * 0.09, ease: EASE },
      }}
      cardClassName="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/75 p-5 shadow-[0_10px_40px_-12px_rgba(99,102,241,0.3)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_35px_80px_-15px_rgba(99,102,241,0.55)]"
    >
      <Quote
        aria-hidden
        className="absolute -right-2 top-14 h-20 w-20 rotate-6 text-indigo-100 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-125 group-hover:text-indigo-200"
        style={{ transform: "translateZ(8px)" }}
      />

      <div className="flex items-center gap-3" style={{ transform: "translateZ(42px)" }}>
        <Avatar item={item} />
        <div className="flex gap-0.5" aria-label="5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star
              key={s}
              className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125 group-hover:rotate-[20deg]"
              style={{ transitionDelay: `${s * 50}ms` }}
            />
          ))}
        </div>
      </div>

      <p
        className="relative mt-5 flex-1 text-[15px] leading-relaxed text-gray-700"
        style={{ transform: "translateZ(24px)" }}
      >
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className="mt-6 flex items-end justify-between gap-3" style={{ transform: "translateZ(34px)" }}>
        <div>
          <p className="text-sm font-bold text-[#1b1b3a]">{item.name}</p>
          <p className="mt-0.5 text-xs text-gray-500">{item.role}</p>
        </div>
        {item.brand && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[360deg]">
            <BrandMark brand={item.brand} className="h-5 w-5" />
          </span>
        )}
      </div>
    </Tilt>
  );
}

// How many testimonial cards fit per page. Read straight from the window width.
function subscribeToResize(callback) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}
const getVisibleCount = () => (window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1);

function useVisibleCount() {
  return useSyncExternalStore(subscribeToResize, getVisibleCount, () => 4);
}

const PAGE_VARIANTS = {
  enter: (dir) => ({ opacity: 0, x: dir * 80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -80 }),
};

function ArrowButton({ direction, onClick }) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous testimonials" : "Next testimonials"}
      whileHover={{ scale: 1.15, y: -3, rotateY: direction === "prev" ? -20 : 20 }}
      whileTap={{ scale: 0.9 }}
      style={{ transformPerspective: 400 }}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-indigo-500 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.45)] backdrop-blur-md transition-colors hover:bg-indigo-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
    >
      <Icon
        className={`h-4 w-4 transition-transform duration-300 ${
          direction === "prev" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        }`}
      />
    </motion.button>
  );
}

function Carousel() {
  const visible = useVisibleCount();
  const pages = Math.max(1, Math.ceil(TESTIMONIALS.length / visible));
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const current = Math.min(page, pages - 1);

  // Back to the first page when the layout changes (e.g. the window is resized across a
  // breakpoint). Adjusting state while rendering is the React-approved alternative to an effect.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (prevVisible !== visible) {
    setPrevVisible(visible);
    setPage(0);
  }

  const goTo = useCallback(
    (next) => {
      const target = (next + pages) % pages;
      setDir(next > current || (next === 0 && current === pages - 1) ? 1 : -1);
      setPage(target);
    },
    [current, pages]
  );

  useEffect(() => {
    if (paused || pages < 2) return;
    const id = setInterval(() => {
      setDir(1);
      setPage((p) => (p + 1) % pages);
    }, 6500);
    return () => clearInterval(id);
  }, [paused, pages]);

  const items = TESTIMONIALS.slice(current * visible, current * visible + visible);

  return (
    <div
      className="mt-10"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={`${current}-${visible}`}
            custom={dir}
            variants={PAGE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
            className="grid gap-5"
            style={{ gridTemplateColumns: `repeat(${visible}, minmax(0, 1fr))` }}
          >
            {items.map((item, i) => (
              <TestimonialCard key={item.name} item={item} index={i} dir={dir} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <ArrowButton direction="prev" onClick={() => goTo(current - 1)} />
        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial pages">
          {Array.from({ length: pages }).map((_, i) => (
            <motion.button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Show testimonials page ${i + 1}`}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.3 }}
              animate={{ width: i === current ? 28 : 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`h-2 rounded-full ${
                i === current
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                  : "bg-indigo-200 hover:bg-indigo-300"
              }`}
            />
          ))}
        </div>
        <ArrowButton direction="next" onClick={() => goTo(current + 1)} />
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function Testimonials() {
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
        id="testimonials"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative overflow-hidden bg-gradient-to-br from-[#f3f0ff] via-[#eef5ff] to-[#fdf1fb] py-20 md:py-28"
      >
        <Background mx={mx} my={my} scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          <Header mx={mx} my={my} />
          <ProofRow />
          <Carousel />
        </div>
      </section>
    </MotionConfig>
  );
}