// frontend/src/components/auth/AuthShell.js
"use client";

/**
 * Shared layout for the Login and Signup pages.
 *
 * Usage:
 *   <AuthShell
 *     badge="Welcome back"
 *     heading={[{ text: "Log" }, { text: "in" }, { text: "to", }, { br: true }, { text: "NovaAI.", gradient: "from-blue-500 to-violet-600" }]}
 *     subtext="..."
 *     cardTitle="Log in"
 *     cardText="Enter your details to continue."
 *     footer={<p>...</p>}
 *   >
 *     <LoginForm />
 *   </AuthShell>
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 */

import { useRef } from "react";
import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Bot, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const FEATURES = [
  { icon: Sparkles, label: "Chat, create and analyze with one AI", tone: "bg-blue-100 text-blue-600" },
  { icon: Bot, label: "Agents that handle the busywork", tone: "bg-violet-100 text-violet-600" },
  { icon: ShieldCheck, label: "Private and secure by default", tone: "bg-indigo-100 text-indigo-600" },
  { icon: Zap, label: "Ready in under a minute", tone: "bg-sky-100 text-sky-600" },
];

/* ====================================================================== */
/* 3D + motion helpers                                                     */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded.
const extrude = (d, color = "#cfd6f8") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(59,91,255,0.2)`;

const TEXT_3D = extrude(0.7);
const TEXT_3D_LIFT = extrude(1.6);
const TILT_SPRING = { stiffness: 220, damping: 18 };

export const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

export function Sparkle4({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LogoMark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="auth-logo-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="auth-logo-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#auth-logo-a)" />
      <path d="M12 14.6 L14.1 20 H9.9 Z" fill="url(#auth-logo-b)" />
    </svg>
  );
}

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

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

// Each pair has the same path commands, so Framer Motion can morph between them.
const WAVES = [
  {
    from: "M0,190 C200,90 420,300 720,210 C1020,120 1240,260 1440,170 L1440,400 L0,400 Z",
    to: "M0,240 C220,150 440,260 720,170 C1000,100 1220,300 1440,210 L1440,400 L0,400 Z",
    fill: "url(#auth-wave-a)",
    duration: 11,
  },
  {
    from: "M0,270 C260,210 520,330 800,270 C1080,210 1260,320 1440,260 L1440,400 L0,400 Z",
    to: "M0,240 C280,320 540,240 800,300 C1060,360 1260,230 1440,300 L1440,400 L0,400 Z",
    fill: "url(#auth-wave-b)",
    duration: 13,
  },
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 47 + 11) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.9) % 9,
  duration: 10 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

const SPARKLES = [
  { pos: "left-[6%] top-[16%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
  { pos: "left-[44%] top-[12%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
  { pos: "right-[8%] top-[10%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
  { pos: "right-[6%] bottom-[24%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
  { pos: "left-[30%] bottom-[18%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
];

function Background({ mx, my }) {
  const wavesX = useTransform(mx, [-1, 1], [-30, 30]);
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
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute bottom-10 left-1/3">
        <motion.div
          className="h-[22rem] w-[22rem] rounded-full bg-pink-300/35 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {/* faint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* 3D waves */}
      <motion.div style={{ x: wavesX }} className="absolute -inset-x-10 bottom-0 h-[34%]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="auth-wave-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="auth-wave-b" x1="1" y1="0" x2="0" y2="1">
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
          animate={{ y: [0, -800], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {/* big glossy bubbles */}
      <ParallaxLayer mx={mx} my={my} depth={-50} className="absolute -right-10 top-28 hidden md:block">
        <Bubble size={120} tone="blue" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-30} className="absolute right-[4%] top-[58%] hidden md:block">
        <Bubble size={44} tone="pink" delay={1.2} bob={8} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={44} className="absolute -left-6 bottom-[22%] hidden md:block">
        <Bubble size={64} tone="cyan" delay={0.6} bob={8} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={36} className="absolute left-[46%] top-[8%] hidden lg:block">
        <Bubble size={22} tone="pink" delay={0.3} bob={6} />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {SPARKLES.map((s) => (
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
/* Glass orb (left column, desktop only)                                   */
/* ====================================================================== */

const RING_MASK = (thickness) =>
  `radial-gradient(farthest-side, transparent calc(100% - ${thickness + 1}px), #000 calc(100% - ${thickness}px))`;

/** A tilted orbit ring with glossy satellites riding on it. */
function OrbitRing({ inset, tilt, direction = 1, duration = 14, gradient, thickness = 5, satellites = [] }) {
  const spinTo = direction * 360;
  const mask = RING_MASK(thickness);

  return (
    <div
      className="absolute"
      style={{ inset, transform: `rotateX(72deg) rotateZ(${tilt}deg)`, transformStyle: "preserve-3d" }}
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

function GlassOrb({ mx, my, className = "" }) {
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

/* ====================================================================== */
/* Glass card with gentle mouse tilt + glare                               */
/* ====================================================================== */

function TiltCard({ children, className = "" }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);
  const max = 3; // keep it subtle so the form stays easy to use
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), TILT_SPRING);
  const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glareOpacity = useSpring(hover, { stiffness: 150, damping: 20 });
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.7), rgba(255,255,255,0) 55%)`;

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onEnter = (e) => e.pointerType === "mouse" && hover.set(1);
  const onLeave = () => {
    px.set(0);
    py.set(0);
    hover.set(0);
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50, rotateX: -24, scale: 0.96, transformPerspective: 1000 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
    >
      <motion.div
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
        className="group relative"
      >
        {/* frosted glass layer (separate so the content keeps its depth) */}
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/65 shadow-[0_30px_80px_-24px_rgba(99,102,241,0.45)] backdrop-blur-xl"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
          <span className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8">{children}</div>

        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{ background: glareBg, opacity: glareOpacity, mixBlendMode: "soft-light" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ====================================================================== */
/* Shell                                                                   */
/* ====================================================================== */

export default function AuthShell({
  badge,
  heading,
  subtext,
  cardTitle,
  cardText,
  children,
  footer,
}) {
  const sectionRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

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
      <main
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#f6f4ff] via-[#eef4ff] to-[#f9f2ff]"
      >
        <Background mx={mx} my={my} />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pb-16 pt-32 md:px-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-20 lg:pt-36">
          {/* left: brand message */}
          <div className="text-center lg:text-left" style={{ perspective: 1000 }}>
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              whileHover={{ y: -3, scale: 1.05 }}
              className="relative mb-6 inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-white/80 bg-blue-100/70 px-4 py-2 shadow-[0_8px_30px_-8px_rgba(59,91,255,0.4)] backdrop-blur-md"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-blue-600"
              >
                <Sparkle4 className="h-4 w-4" />
              </motion.span>
              <span className="text-sm font-semibold text-blue-600">{badge}</span>
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                animate={{ x: ["-150%", "450%"] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
              />
            </motion.div>

            <Heading3D
              tokens={heading}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0f1030] sm:text-5xl lg:text-6xl"
            />

            <Reveal3D
              as="p"
              delay={0.7}
              className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-gray-600 md:text-lg lg:mx-0"
            >
              {subtext}
            </Reveal3D>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
              className="mx-auto mt-8 hidden max-w-md space-y-3 text-left sm:block lg:mx-0"
            >
              {FEATURES.map(({ icon: Icon, label, tone }) => (
                <motion.li
                  key={label}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                  whileHover={{ x: 6 }}
                  className="group flex items-center gap-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)] ${tone}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-medium text-[#2b2e4a]">{label}</span>
                </motion.li>
              ))}
            </motion.ul>

            <GlassOrb mx={mx} my={my} className="ml-6 mt-10 hidden h-44 w-44 lg:block" />
          </div>

          {/* right: form card */}
          <TiltCard className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-[0_8px_20px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)]">
                <LogoMark className="h-6 w-6" />
              </span>
              <div>
                <h2
                  className="text-2xl font-extrabold leading-tight text-[#0f1030]"
                  style={{ textShadow: "1px 1px 0 #cfd6f8, 2px 2px 6px rgba(59,91,255,0.2)" }}
                >
                  {cardTitle}
                </h2>
                <p className="text-sm text-gray-500">{cardText}</p>
              </div>
            </div>

            {children}

            {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
          </TiltCard>
        </div>
      </main>
    </MotionConfig>
  );
}