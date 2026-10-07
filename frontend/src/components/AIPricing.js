"use client";

/**
 * AIPricing section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import AIPricing from "./components/AIPricing";
 *   <AIPricing />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * This is a SECTION, not a full page — drop it in alongside your other
 * sections (AISuit, AIWorkspace, AIAgentsAutomation). All copy and
 * pricing numbers live in the DATA block below; edit them to match your
 * product. Nothing here needs image files — the icons and background are
 * all drawn from code, same as the other sections.
 */

import { useMemo, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  Crown,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BADGE = "Simple & Transparent";
const HEADING = [
  { text: "Choose" },
  { text: "the" },
  { text: "plan" },
  { text: "that" },
  { text: "fits" },
  { text: "your goals.", gradient: "from-sky-500 via-indigo-500 to-violet-500" },
];
const SUBTEXT = "Start for free, upgrade when you're ready. No hidden fees, cancel anytime.";

const YEARLY_DISCOUNT_LABEL = "Save 20%";
const YEARLY_DISCOUNT_RATE = 0.2; // used to compute the yearly price from the monthly one

/**
 * Each plan's `monthly` is the displayed monthly price. When `monthly` is
 * a number, the yearly price is computed automatically as
 * monthly * (1 - YEARLY_DISCOUNT_RATE), rounded to the nearest dollar.
 * Set `monthly: null` for a plan with no fixed number (e.g. "Custom").
 */
const PLANS = [
  {
    id: "free",
    icon: Sparkles,
    name: "Free",
    tagline: "Perfect for getting started.",
    monthly: 0,
    cta: "Get Started Free",
    ctaHref: "/signup",
    popular: false,
    tone: "from-sky-400 to-blue-500",
    features: [
      "Up to 10 chat messages/day",
      "Access to basic AI tools",
      "1 GB storage",
      "Community support",
    ],
  },
  {
    id: "pro",
    icon: Crown,
    name: "Pro",
    tagline: "For individuals and creators.",
    monthly: 19,
    cta: "Start Pro Plan",
    ctaHref: "/signup?plan=pro",
    popular: true,
    tone: "from-blue-500 via-indigo-500 to-violet-500",
    features: [
      "Unlimited chat messages",
      "All AI tools & features",
      "100 GB storage",
      "Priority support",
      "Custom templates",
    ],
  },
  {
    id: "team",
    icon: Users,
    name: "Team",
    tagline: "For growing teams.",
    monthly: 49,
    cta: "Start Team Plan",
    ctaHref: "/signup?plan=team",
    popular: false,
    tone: "from-violet-500 to-fuchsia-500",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "1 TB storage",
      "Admin controls",
      "Collaboration features",
    ],
  },
  {
    id: "enterprise",
    icon: ShieldCheck,
    name: "Enterprise",
    tagline: "For large organizations.",
    monthly: null,
    customLabel: "Custom",
    cta: "Contact Sales",
    ctaHref: "#contact-sales",
    popular: false,
    tone: "from-indigo-500 to-blue-600",
    features: [
      "Everything in Team",
      "Unlimited members",
      "Dedicated infrastructure",
      "SSO & advanced security",
      "24/7 premium support",
    ],
  },
];

const TRUST_LINE = [
  "No credit card required",
  "Cancel anytime",
  "14-day money-back guarantee",
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

const STAGGER_FAST = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const POP = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
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
                transition: { duration: 0.85, delay: 0.2 + idx * 0.08, ease: EASE },
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

/* ====================================================================== */
/* Background                                                              */
/* ====================================================================== */

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 0.8) % 8,
  duration: 10 + (i % 5) * 2,
  tint: i % 3 === 0 ? "bg-sky-300" : i % 3 === 1 ? "bg-violet-300" : "bg-white",
}));

function Background({ mx, my, scrollYProgress }) {
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -70]);
  const sx = useTransform(mx, [-1, 1], [0, 100]);
  const sy = useTransform(my, [-1, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(129,140,248,0.18), transparent 62%)`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      {/* slow aurora sweep */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-[130vmax] w-[130vmax] flex-none opacity-30 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(196,181,253,0.7), rgba(125,211,252,0.6), rgba(249,168,212,0.5), rgba(196,181,253,0.7))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* drifting blobs at different mouse depths */}
      <ParallaxLayer mx={mx} my={my} depth={26} className="absolute -left-28 top-6">
        <motion.div
          className="h-[24rem] w-[24rem] rounded-full bg-sky-300/35 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-40} className="absolute -right-32 top-[26%]">
        <motion.div
          className="h-[30rem] w-[30rem] rounded-full bg-violet-300/40 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={22} className="absolute bottom-0 left-1/3">
        <motion.div
          className="h-[20rem] w-[20rem] rounded-full bg-pink-300/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </ParallaxLayer>

      {/* faint grid that drifts as you scroll */}
      <motion.div
        style={{
          y: gridY,
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.06) 1px, transparent 1px)",
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
          animate={{ y: [0, -820], opacity: [0, 0.85, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}

      {/* floating glass shapes at the edges (matches the reference image) */}
      <ParallaxLayer mx={mx} my={my} depth={-46} className="absolute -left-10 top-16 hidden md:block">
        <Bubble size={130} tone="cyan" bob={9} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={40} className="absolute right-[2%] top-[4%] hidden md:block">
        <CubeGlass size={72} duration={26} tone="sky" />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={-32} className="absolute left-[3%] bottom-[8%] hidden lg:block">
        <Bubble size={30} tone="pink" delay={0.4} bob={7} />
      </ParallaxLayer>
      <ParallaxLayer mx={mx} my={my} depth={36} className="absolute right-[6%] bottom-[4%] hidden lg:block">
        <CubeGlass size={40} duration={20} tone="pink" />
      </ParallaxLayer>

      {/* twinkling sparkles */}
      {[
        { pos: "left-[22%] top-[8%]", size: "h-4 w-4", color: "text-indigo-400", delay: 0 },
        { pos: "right-[24%] top-[18%]", size: "h-3 w-3", color: "text-sky-400", delay: 0.8 },
        { pos: "left-[6%] top-[46%]", size: "h-3.5 w-3.5", color: "text-violet-400", delay: 1.4 },
        { pos: "right-[8%] top-[68%]", size: "h-4 w-4", color: "text-pink-400", delay: 0.4 },
        { pos: "left-[44%] bottom-[6%]", size: "h-3 w-3", color: "text-indigo-300", delay: 1.9 },
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
      <div className="mb-6 flex justify-center">
        <PillBadge icon={Sparkles}>{BADGE}</PillBadge>
      </div>
      <Heading3D
        tokens={HEADING}
        className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0f1030] md:text-5xl lg:text-[3.4rem]"
      />
      <Reveal3D as="p" delay={0.6} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
        {SUBTEXT}
      </Reveal3D>
    </div>
  );
}

/* ====================================================================== */
/* Billing toggle (Monthly / Yearly)                                       */
/* ====================================================================== */

function BillingToggle({ yearly, onChange }) {
  return (
    <Reveal3D delay={0.75} className="mt-9 flex justify-center">
      <div className="relative inline-grid grid-cols-2 items-stretch gap-1 rounded-full border border-white/90 bg-white/80 p-1.5 shadow-[0_16px_40px_-16px_rgba(79,70,229,0.5)] backdrop-blur-md">
        <motion.span
          aria-hidden
          className="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md"
          animate={{ x: yearly ? "calc(100% + 0.375rem)" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`relative z-10 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 ${
            yearly ? "text-gray-500" : "text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 ${
            yearly ? "text-white" : "text-gray-500"
          }`}
        >
          Yearly
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-300 ${
              yearly ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {YEARLY_DISCOUNT_LABEL}
          </span>
        </button>
      </div>
    </Reveal3D>
  );
}

/* ====================================================================== */
/* Pricing card                                                            */
/* ====================================================================== */

function computeYearly(monthly) {
  if (monthly == null) return null;
  if (monthly === 0) return 0;
  return Math.round(monthly * (1 - YEARLY_DISCOUNT_RATE));
}

function PriceTag({ plan, yearly }) {
  if (plan.monthly == null) {
    return (
      <div className="mt-4">
        <span className="text-4xl font-extrabold text-[#0f1030]">{plan.customLabel}</span>
      </div>
    );
  }

  const displayed = yearly ? computeYearly(plan.monthly) : plan.monthly;

  return (
    <div className="mt-4 flex items-end gap-1.5">
      <span className="text-4xl font-extrabold text-[#0f1030]">${displayed}</span>
      <span className="pb-1 text-sm font-medium text-gray-400">/month</span>
      {yearly && plan.monthly > 0 && (
        <span className="pb-1.5 text-xs font-semibold text-gray-400 line-through">${plan.monthly}</span>
      )}
    </div>
  );
}

function FeatureRow({ label, index }) {
  return (
    <motion.li variants={POP} className="flex items-start gap-2">
      <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
      <span className="text-[13px] leading-snug text-gray-600">{label}</span>
    </motion.li>
  );
}

function PlanIcon({ icon: Icon, tone, popular }) {
  return (
    <motion.span
      whileHover={{ rotate: popular ? [0, -8, 8, 0] : 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${tone}`}
    >
      <Icon className="h-5 w-5" />
    </motion.span>
  );
}

function PricingCard({ plan, yearly, index }) {
  const isPopular = plan.popular;

  return (
    <Tilt
      className={`relative ${isPopular ? "lg:-mt-4" : ""}`}
      as="div"
      max={isPopular ? 5 : 7}
      lift={isPopular ? 10 : 8}
      scale={isPopular ? 1.02 : 1.03}
      glare
      outerProps={enter(index * 0.08)}
      cardClassName={`group flex h-full flex-col rounded-[26px] p-6 ${
        isPopular
          ? "border-2 border-indigo-300/80 bg-white/90 shadow-[0_34px_80px_-20px_rgba(79,70,229,0.55)]"
          : "border border-white/85 bg-white/70 shadow-[0_20px_54px_-20px_rgba(79,70,229,0.32)]"
      } backdrop-blur-xl`}
    >
      {isPopular && (
        <motion.span
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
          className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)]"
        >
          <Sparkles className="h-3 w-3" />
          Most Popular
        </motion.span>
      )}

      {/* soft glow blobs behind the content, like the other sections' cards */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
        <div
          className={`absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${
            isPopular ? "bg-indigo-300/35" : "bg-violet-200/25"
          }`}
        />
      </div>

      <div className="relative flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
        <PlanIcon icon={plan.icon} tone={plan.tone} popular={isPopular} />
      </div>

      <h3 className="relative mt-4 text-lg font-bold text-[#0f1030]" style={{ transform: "translateZ(26px)" }}>
        {plan.name}
      </h3>
      <p className="relative mt-1 text-[12.5px] text-gray-500" style={{ transform: "translateZ(22px)" }}>
        {plan.tagline}
      </p>

      <div className="relative" style={{ transform: "translateZ(24px)" }}>
        <PriceTag plan={plan} yearly={yearly} />
      </div>

      <div className="relative mt-5" style={{ transform: "translateZ(18px)" }}>
        <Magnetic strength={0.15} className="block w-full">
          <motion.a
            href={plan.ctaHref}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={`group/btn relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-md transition-shadow duration-300 ${
              isPopular
                ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white hover:shadow-[0_20px_44px_-12px_rgba(99,91,255,0.85)]"
                : "border border-indigo-100 bg-white text-indigo-600 hover:border-indigo-200 hover:shadow-lg"
            }`}
          >
            {isPopular && (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ["-150%", "450%"] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
              />
            )}
            <span className="relative">{plan.cta}</span>
            <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </motion.a>
        </Magnetic>
      </div>

      <motion.ul
        variants={STAGGER_FAST}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="relative mt-6 flex-1 space-y-2.5"
        style={{ transform: "translateZ(14px)" }}
      >
        {plan.features.map((f, i) => (
          <FeatureRow key={f} label={f} index={i} />
        ))}
      </motion.ul>
    </Tilt>
  );
}

/* ====================================================================== */
/* Pricing grid                                                            */
/* ====================================================================== */

function PricingGrid({ yearly, plans }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1600 }}>
      {plans.map((plan, i) => (
        <PricingCard key={plan.id} plan={plan} yearly={yearly} index={i} />
      ))}
    </div>
  );
}

/* ====================================================================== */
/* Trust line + contact strip                                              */
/* ====================================================================== */

function TrustLine() {
  return (
    <Reveal3D delay={0.2} className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {TRUST_LINE.map((t) => (
        <span key={t} className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500">
          <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
          {t}
        </span>
      ))}
    </Reveal3D>
  );
}

function ContactStrip() {
  return (
    <Tilt
      max={4}
      lift={5}
      scale={1.01}
      outerProps={enter(0.1)}
      cardClassName="mt-14 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/85 bg-white/70 px-6 py-6 text-center shadow-[0_20px_54px_-24px_rgba(79,70,229,0.4)] backdrop-blur-xl sm:flex-row sm:text-left"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-sm">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0f1030]">Need something more custom?</p>
          <p className="mt-0.5 text-[12.5px] text-gray-500">
            Talk to our team about volume pricing, custom contracts, and dedicated support.
          </p>
        </div>
      </div>
      <Magnetic strength={0.15}>
        <motion.a
          href="#contact-sales"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-5 py-2.5 text-[13px] font-semibold text-indigo-600 shadow-sm transition-shadow hover:shadow-md"
        >
          <Phone className="h-3.5 w-3.5" />
          Talk to Sales
        </motion.a>
      </Magnetic>
    </Tilt>
  );
}

/* ====================================================================== */
/* FAQ accordion (common pricing questions)                                */
/* ====================================================================== */

const FAQS = [
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade, downgrade, or cancel anytime from your account settings. Changes apply at the start of your next billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, and Enterprise plans can also be billed via invoice.",
  },
  {
    q: "Is there a free trial on paid plans?",
    a: "The Free plan gives you full access to core features with no time limit, so you can try things out before upgrading.",
  },
  {
    q: "Do unused messages roll over?",
    a: "Usage limits reset at the start of each billing period and don't carry over to the next one.",
  },
];

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-white/85 bg-white/70 shadow-sm backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[13.5px] font-semibold text-[#0f1030]">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500"
        >
          <span className="text-base leading-none">+</span>
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-[12.5px] leading-relaxed text-gray-500">{item.a}</p>
      </motion.div>
    </motion.div>
  );
}

function FaqSection() {
  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <Reveal3D as="p" className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
        Common Questions
      </Reveal3D>
      <div className="mt-5 space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem key={item.q} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function AIPricing() {
  const sectionRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const [yearly, setYearly] = useState(false);

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

  // Memoized so a re-render from the toggle doesn't recompute this list.
  const plans = useMemo(() => PLANS, []);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="pricing"
        ref={sectionRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#f4f2ff] via-[#eef4ff] to-[#f7f1ff] py-20 md:py-28"
      >
        <Background mx={mx} my={my} scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
          <Header />

          <BillingToggle yearly={yearly} onChange={setYearly} />

          <PricingGrid yearly={yearly} plans={plans} />

          <TrustLine />

          <ContactStrip />

          <FaqSection />
        </div>
      </section>
    </MotionConfig>
  );
}