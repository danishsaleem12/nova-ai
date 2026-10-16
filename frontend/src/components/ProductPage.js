//src/components/ProductPage.js

"use client";

/**
 * ProductPage — the ONE template every /product/[slug] route renders.
 *
 * Same visual language as your Hero.js and AISuit.js: 3D tilt-on-hover
 * cards with glare, extruded 3D headings that flip up word by word, a
 * drifting aurora/particle/wave background, and glossy glass spheres.
 * Those helpers are duplicated here on purpose (no shared lib file, per
 * your call) — same pattern your other two files already follow.
 *
 * Usage (already wired in app/product/[slug]/page.js):
 *   <ProductPage product={products["ai-chat"]} />
 *
 * `product` shape comes from src/data/products.js:
 *   { slug, name, tagline, icon, badge, gradient, glow, heading, subtext, visual, features[] }
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
import { ArrowRight, ChevronDown } from "lucide-react";
import { products } from "@/data/products";
import ProductVisual from "./product-visuals/ProductVisual";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* 3D + motion helpers (same as Hero.js / AISuit.js)                       */
/* ====================================================================== */

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

/** Card that tilts toward the mouse, lifts, and shows a moving glare. */
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
    </h1>
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
/* Background: aurora, 3D waves, bubbles, particles (same as other pages)  */
/* ====================================================================== */

const WAVES = [
  {
    from: "M0,190 C200,90 420,300 720,210 C1020,120 1240,260 1440,170 L1440,400 L0,400 Z",
    to: "M0,240 C220,150 440,260 720,170 C1000,100 1220,300 1440,210 L1440,400 L0,400 Z",
    fill: "url(#pp-wave-a)",
    duration: 12,
  },
  {
    from: "M0,270 C260,210 520,330 800,270 C1080,210 1260,320 1440,260 L1440,400 L0,400 Z",
    to: "M0,240 C280,320 540,240 800,300 C1060,360 1260,230 1440,300 L1440,400 L0,400 Z",
    fill: "url(#pp-wave-b)",
    duration: 10,
  },
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 47 + 11) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.9) % 9,
  duration: 10 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my }) {
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

      {/* 3D waves */}
      <motion.div style={{ x: wavesX }} className="absolute -inset-x-10 bottom-0 h-[26%]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="pp-wave-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="pp-wave-b" x1="1" y1="0" x2="0" y2="1">
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
        <Bubble size={90} tone="cyan" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={38} className="absolute right-[6%] top-[42%] hidden md:block">
        <Bubble size={30} tone="pink" delay={0.8} bob={7} />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[22%] top-[6%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[26%] top-[22%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "left-[4%] top-[34%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[4%] top-[82%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
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
/* Glossy icon orb (hero visual anchor, product-colored)                   */
/* ====================================================================== */

function HeroIcon({ Icon, gradient, mx, my }) {
  const rotateY = useTransform(mx, [-1, 1], [-16, 16]);
  const rotateX = useTransform(my, [-1, 1], [12, -12]);

  return (
    <div style={{ perspective: 900 }} aria-hidden>
      <motion.div
        className="relative mx-auto h-28 w-28 md:h-32 md:w-32"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`absolute -inset-[35%] rounded-full bg-gradient-to-br ${gradient} opacity-40 blur-2xl`} />
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border border-white/80"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 24%, #b7c6ff 56%, #8b7cf6 84%, #6d5ae0 100%)",
              boxShadow:
                "inset -12px -16px 28px rgba(60,40,180,0.4), inset 8px 8px 20px rgba(255,255,255,0.85), 0 20px 46px rgba(99,102,241,0.45)",
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
            <Icon className="relative h-11 w-11 text-white drop-shadow-md md:h-12 md:w-12" strokeWidth={1.8} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/* Badge + CTA button                                                      */
/* ====================================================================== */

function Badge({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
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
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">{text}</span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent"
        animate={{ x: ["-150%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function CTAButton({ gradient, href = "#", label = "Try it now" }) {
  return (
    <Magnetic>
      <motion.a
        href={href}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r ${gradient} px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-10px_rgba(59,91,255,0.7)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-10px_rgba(59,91,255,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2`}
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ["-150%", "450%"] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        />
        <span className="relative">{label}</span>
        <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
      </motion.a>
    </Magnetic>
  );
}

// Shown instead of the CTA for products that aren't built yet (product.soon).
function ComingSoon({ note }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-8 py-4 text-base font-semibold text-indigo-400 shadow-sm"
      >
        Coming soon
      </span>
      {note && <p className="max-w-md text-xs leading-relaxed text-gray-500">{note}</p>}
      <a
        href="/chat"
        className="text-sm font-semibold text-indigo-600 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        Try AI Chat in the meantime
      </a>
    </div>
  );
}

/* ====================================================================== */
/* Feature bento card (same shell as AISuit.js's BentoCard)                */
/* ====================================================================== */

function FeatureCard({ icon: Icon, title, text, delay, glow }) {
  return (
    <Tilt
      max={6}
      lift={10}
      scale={1.02}
      glare
      outerProps={enter(delay)}
      cardClassName="group flex h-full flex-col p-6 md:p-7"
    >
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/55 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_40px_90px_-24px_rgba(99,102,241,0.55)]"
      >
        <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${glow}`} />
      </div>

      <div className="relative flex items-center gap-3" style={{ transform: "translateZ(40px)" }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 shadow-sm transition-all duration-700 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:[transform:perspective(300px)_rotateY(360deg)]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-bold text-[#0f1030] md:text-xl">{title}</h3>
      </div>

      <p className="relative mt-3 text-sm leading-relaxed text-gray-500" style={{ transform: "translateZ(24px)" }}>
        {text}
      </p>
    </Tilt>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function ProductPage({ slug }) {
  const product = products[slug];
  const Icon = product.icon;
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
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-20 md:py-28"
      >
        <Background mx={mx} my={my} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          {/* --- hero --- */}
          <div className="mx-auto max-w-3xl text-center" style={{ perspective: 1000 }}>
            <HeroIcon Icon={Icon} gradient={product.gradient} mx={mx} my={my} />

            <div className="mt-6">
              <Badge text={product.badge} />
            </div>

            <Heading3D
              tokens={product.heading}
              className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0f1030] md:text-5xl lg:text-6xl"
            />

            <Reveal3D as="p" delay={0.6} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
              {product.subtext}
            </Reveal3D>

            <Reveal3D delay={0.75} className="mt-8 flex justify-center">
              {product.soon ? (
                <ComingSoon note={product.soonNote} />
              ) : (
                <CTAButton gradient={product.gradient} href={product.ctaHref} label={product.ctaLabel} />
              )}
            </Reveal3D>
          </div>

          {/* --- animated mockup --- */}
          <Reveal3D delay={0.4} className="mt-16">
            <ProductVisual kind={product.visual} />
          </Reveal3D>

          {/* --- feature bento --- */}
          <div className="mt-20 grid gap-5 md:grid-cols-3" style={{ perspective: 1600 }}>
            {product.features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} text={f.text} delay={i * 0.1} glow={product.glow} />
            ))}
          </div>

          <Reveal3D delay={0.2} className="mt-16 flex flex-col items-center gap-2 text-sm text-gray-500">
            <span>Built with the {product.name} engine.</span>
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