"use client";

/**
 * AIFinalCTA section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import AIFinalCTA from "./components/AIFinalCTA";
 *   <AIFinalCTA />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * This is a SHORT closing banner (well under half a page tall) meant to
 * sit near the bottom of the page, after your other sections. All copy
 * lives in the DATA block below. The atom graphic and floating chips are
 * built from code — no image files needed.
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
import { ArrowRight, Hammer, Sparkles, Wand2, Zap } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BADGE = "Your AI Journey Starts Here";
const HEADING = [
  { text: "Ready to" },
  { text: "build with AI?", gradient: "from-sky-500 via-indigo-500 to-violet-500" },
];
const SUBTEXT = "Turn your ideas into reality with one intelligent platform.";

const CTA_LABEL = "Get Started Free";
const CTA_HREF = "/signup";

const TRUST_LINE = ["No credit card required", "Free forever plan", "Cancel anytime"];

/* Small floating chips on the right, connected with dotted lines. Their
 * `pos` places them within the chip cluster; `depth` sets mouse parallax. */
const FLOAT_CHIPS = [
  { icon: Hammer, label: "Build faster", pos: "left-[0%] top-[0%]", depth: 20, delay: 0 },
  { icon: Zap, label: "Work smarter", pos: "left-[32%] top-[30%]", depth: -24, delay: 1 },
  { icon: Wand2, label: "Create anything", pos: "left-[0%] top-[58%]", depth: 22, delay: 2 },
  { icon: Sparkles, label: "Achieve more", pos: "left-[34%] top-[84%]", depth: -18, delay: 3 },
];

/* ====================================================================== */
/* 3D + motion helpers                                                     */
/* ====================================================================== */

// Stacked text-shadow layers make text look extruded. Both states use the
// same number of layers so Framer Motion can animate between them.
const extrude = (d, color = "#cfd6f8") =>
  [1, 2, 3, 4, 5].map((k) => `${k * d}px ${k * d}px 0 ${color}`).join(",") +
  `,${6 * d + 4}px ${6 * d + 4}px 16px rgba(59,91,255,0.2)`;

const TEXT_3D = extrude(0.6);
const TEXT_3D_LIFT = extrude(1.3);

const TILT_SPRING = { stiffness: 220, damping: 18 };

/**
 * Card that tilts toward the mouse, lifts, and shows a moving glare.
 * Children can use style={{ transform: "translateZ(30px)" }} to float
 * above the card surface.
 */
function Tilt({ children, className = "", cardClassName = "", max = 8, lift = 6, scale = 1.03, glare = false, outerProps }) {
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
    <motion.div className={className} {...outerProps}>
      <motion.div
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        whileHover={{ y: -lift, scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
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
          ? { filter: "drop-shadow(0 10px 12px rgba(79,70,229,0.45))" }
          : { textShadow: TEXT_3D_LIFT };

        return (
          <span key={i} aria-hidden className="mr-[0.28em] inline-block last:mr-0">
            <motion.span
              className={`inline-block cursor-default ${
                tok.gradient ? `bg-gradient-to-r ${tok.gradient} bg-clip-text text-transparent` : ""
              }`}
              initial={{ opacity: 0, rotateX: -80, y: 26 }}
              whileInView={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                transition: { duration: 0.75, delay: 0.15 + idx * 0.09, ease: EASE },
              }}
              whileHover={{
                y: -5,
                rotateX: 10,
                rotateY: -8,
                ...hoverShadow,
                transition: { type: "spring", stiffness: 300, damping: 14 },
              }}
              viewport={{ once: true, amount: 0.6 }}
              style={{
                transformPerspective: 600,
                transformOrigin: "50% 100%",
                ...(tok.gradient
                  ? { filter: "drop-shadow(0 5px 7px rgba(79,70,229,0.3))" }
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
function Magnetic({ children, strength = 0.25, className = "" }) {
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

const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

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
      animate={{ y: [0, -16, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: bob, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

const RING_MASK = (thickness) =>
  `radial-gradient(farthest-side, transparent calc(100% - ${thickness + 1}px), #000 calc(100% - ${thickness}px))`;

/** A tilted, glowing orbit ring with a small glass satellite riding on it. */
function OrbitRing({ inset, tilt, direction = 1, duration = 14, gradient, thickness = 2.4, satellite }) {
  const spinTo = direction * 360;
  const mask = RING_MASK(thickness);

  return (
    <div
      className="absolute"
      style={{ inset, transform: `rotateX(70deg) rotateZ(${tilt}deg)`, transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full opacity-80"
        style={{ background: gradient, WebkitMask: mask, mask, filter: "blur(2px)" }}
        animate={{ rotate: spinTo }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      {satellite && (
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotate: spinTo }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {(() => {
            const a = (satellite.angle * Math.PI) / 180;
            return (
              <motion.span
                className="absolute rounded-full"
                style={{
                  left: `${50 + 50 * Math.cos(a)}%`,
                  top: `${50 + 50 * Math.sin(a)}%`,
                  width: satellite.size,
                  height: satellite.size,
                  marginLeft: -satellite.size / 2,
                  marginTop: -satellite.size / 2,
                  rotateX: -70,
                  background: BUBBLE_TONES[satellite.tone],
                  boxShadow: `0 0 ${satellite.size}px rgba(99,102,241,0.6)`,
                }}
                initial={{ rotate: -tilt }}
                animate={{ rotate: -tilt - spinTo }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
              />
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

/* ====================================================================== */
/* Background (kept light — this is a short closing banner, not a hero)    */
/* ====================================================================== */

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  left: (i * 61 + 6) % 100,
  size: 3 + (i % 3) * 2,
  delay: (i * 1.1) % 7,
  duration: 9 + (i % 4) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my }) {
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sx}% ${sy}%, rgba(129,140,248,0.16), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      <ParallaxLayer mx={mx} my={my} depth={18} className="absolute -left-16 top-[-20%]">
        <motion.div
          className="h-[20rem] w-[20rem] rounded-full bg-sky-300/30 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-26} className="absolute -right-20 bottom-[-30%]">
        <motion.div
          className="h-[22rem] w-[22rem] rounded-full bg-violet-300/35 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={16} className="absolute left-1/2 bottom-[-40%]">
        <motion.div
          className="h-[16rem] w-[16rem] rounded-full bg-pink-300/25 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-6 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] ${p.tint}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -260], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {[
        { pos: "left-[30%] top-[12%]", size: "h-3 w-3", color: "text-indigo-300", delay: 0 },
        { pos: "right-[34%] top-[70%]", size: "h-3 w-3", color: "text-sky-300", delay: 0.9 },
        { pos: "left-[54%] bottom-[10%]", size: "h-2.5 w-2.5", color: "text-pink-300", delay: 1.6 },
      ].map((s) => (
        <motion.span
          key={s.pos}
          className={`absolute ${s.pos} ${s.color}`}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.2, 0.7], rotate: [0, 90, 180] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          <Sparkle4 className={s.size} />
        </motion.span>
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Left: the little orbiting "atom" graphic                                */
/* ====================================================================== */

function AtomGraphic({ mx, my }) {
  const rotateY = useTransform(mx, [-1, 1], [-16, 16]);
  const rotateX = useTransform(my, [-1, 1], [10, -10]);

  return (
    <div className="relative hidden h-40 w-40 shrink-0 sm:block md:h-48 md:w-48" style={{ perspective: 800 }} aria-hidden>
      <motion.div className="relative h-full w-full" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -inset-[26%] rounded-full bg-violet-400/25 blur-3xl" />

          {/* the core sphere */}
          <div
            className="absolute inset-[28%] overflow-hidden rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 22%, #93b4ff 52%, #8b7cf6 82%, #6d5ae0 100%)",
              boxShadow:
                "inset -10px -14px 24px rgba(60,40,180,0.4), inset 8px 8px 18px rgba(255,255,255,0.8), 0 18px 36px rgba(99,102,241,0.4)",
            }}
          >
            <motion.div
              className="absolute -inset-[25%] opacity-60 mix-blend-soft-light"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.95), transparent 35%, rgba(244,114,182,0.7), transparent 70%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute left-[14%] top-[10%] h-[26%] w-[38%] -rotate-[28deg] rounded-full bg-white/70 blur-sm" />
          </div>

          {/* three orbit rings at different tilts, each with one satellite */}
          <OrbitRing
            inset="4%"
            tilt={0}
            direction={1}
            duration={9}
            thickness={2.2}
            gradient="conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(147,197,253,0.95) 100deg, rgba(167,139,250,0.95) 210deg, rgba(255,255,255,0.1) 320deg)"
            satellite={{ angle: 20, size: 9, tone: "blue" }}
          />
          <OrbitRing
            inset="4%"
            tilt={62}
            direction={-1}
            duration={12}
            thickness={2.2}
            gradient="conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(196,181,253,0.9) 120deg, rgba(56,189,248,0.9) 240deg, rgba(255,255,255,0.1) 340deg)"
            satellite={{ angle: 140, size: 7, tone: "pink" }}
          />
          <OrbitRing
            inset="4%"
            tilt={-58}
            direction={1}
            duration={15}
            thickness={2.2}
            gradient="conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(103,232,249,0.9) 100deg, rgba(129,140,248,0.9) 260deg, rgba(255,255,255,0.1) 340deg)"
            satellite={{ angle: 260, size: 8, tone: "cyan" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/* Middle: badge, heading, subtext, CTA, trust line                        */
/* ====================================================================== */

function Badge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: EASE }}
      whileHover={{ y: -2, scale: 1.05 }}
      className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 shadow-[0_8px_24px_-10px_rgba(99,102,241,0.4)] backdrop-blur-md"
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="text-blue-600"
      >
        <Sparkle4 className="h-3 w-3" />
      </motion.span>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{BADGE}</span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function TrustLine() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11.5px] font-medium text-gray-500 lg:justify-start"
    >
      {TRUST_LINE.map((t, i) => (
        <span key={t} className="inline-flex items-center gap-2">
          {t}
          {i < TRUST_LINE.length - 1 && <span className="h-1 w-1 rounded-full bg-gray-300" />}
        </span>
      ))}
    </motion.p>
  );
}

function MiddleContent() {
  return (
    <div className="mx-auto max-w-lg text-center lg:mx-0 lg:text-left" style={{ perspective: 900 }}>
      <div className="flex justify-center lg:justify-start">
        <Badge />
      </div>

      <Heading3D
        tokens={HEADING}
        className="mt-3.5 text-2xl font-extrabold leading-[1.15] tracking-tight text-[#0f1030] sm:text-3xl md:text-[2.15rem]"
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
        className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-gray-600 lg:mx-0"
      >
        {SUBTEXT}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.45, duration: 0.55, ease: EASE }}
        className="mt-5 flex justify-center lg:justify-start"
      >
        <Magnetic>
          <motion.a
            href={CTA_HREF}
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 px-6 py-3 text-[13.5px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(99,91,255,0.7)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-10px_rgba(99,91,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ["-150%", "450%"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
            />
            <span className="relative">{CTA_LABEL}</span>
            <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </motion.a>
        </Magnetic>
      </motion.div>

      <TrustLine />
    </div>
  );
}

/* ====================================================================== */
/* Right: small floating chips connected with dotted lines                 */
/* ====================================================================== */

function ChipConnector({ box, from, to }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const midX = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  return (
    <svg viewBox={`0 0 ${box} ${box}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="#c7d2fe"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

function FloatChip({ chip, mx, my }) {
  const Icon = chip.icon;
  return (
    <ParallaxLayer mx={mx} my={my} depth={chip.depth} className={`absolute z-10 ${chip.pos}`}>
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: chip.delay * 0.35 }}
      >
        <Tilt
          max={8}
          lift={5}
          scale={1.06}
          glare
          outerProps={{
            initial: { opacity: 0, scale: 0.8, y: 16 },
            whileInView: { opacity: 1, scale: 1, y: 0 },
            viewport: { once: true, amount: 0.3 },
            transition: { duration: 0.6, delay: 0.4 + chip.delay * 0.1, ease: EASE },
          }}
          cardClassName="group flex items-center gap-2 whitespace-nowrap rounded-full border border-white/90 bg-white/90 px-3.5 py-2 shadow-[0_12px_28px_-12px_rgba(79,70,229,0.4)] backdrop-blur-md"
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white transition-transform duration-700 group-hover:[transform:perspective(300px)_rotateY(360deg)]"
            style={{ transform: "translateZ(20px)" }}
          >
            <Icon className="h-3 w-3" />
          </span>
          <span className="text-[11px] font-semibold text-[#0f1030]" style={{ transform: "translateZ(14px)" }}>
            {chip.label}
          </span>
        </Tilt>
      </motion.div>
    </ParallaxLayer>
  );
}

const CHIP_BOX = 100;

function ChipCluster({ mx, my }) {
  return (
    <div className="relative hidden h-64 w-72 shrink-0 lg:block xl:h-72 xl:w-80">
      <svg viewBox={`0 0 ${CHIP_BOX} ${CHIP_BOX}`} className="absolute inset-0 h-full w-full opacity-0" aria-hidden />
      <ChipConnector box={CHIP_BOX} from={[32, 40]} to={[16, 8]} />
      <ChipConnector box={CHIP_BOX} from={[32, 40]} to={[54, 36]} />
      <ChipConnector box={CHIP_BOX} from={[32, 40]} to={[18, 64]} />
      <ChipConnector box={CHIP_BOX} from={[32, 40]} to={[56, 88]} />

      {FLOAT_CHIPS.map((chip) => (
        <FloatChip key={chip.label} chip={chip} mx={mx} my={my} />
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function AIFinalCTA() {
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
      <section
        id="cta"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-10 md:py-14"
      >
        <Background mx={mx} my={my} />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-14">
          <AtomGraphic mx={mx} my={my} />
          <MiddleContent />
          <ChipCluster mx={mx} my={my} />
        </div>
      </section>
    </MotionConfig>
  );
}