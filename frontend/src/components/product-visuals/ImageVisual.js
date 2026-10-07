"use client";

/**
 * ImageVisual — the animated mockup shown on the /product/ai-image page.
 * Self-contained (no shared lib file). Reuses the "prompt bar + generated
 * tile grid with shimmer sweep" idea from AISuit.js's ImageCard, but as
 * its own standalone hero mockup with a prompt input above the grid.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const PROMPTS = [
  "a lotus blooming over a midnight lake",
  "a neon city skyline in the rain",
  "an aurora over snowy mountains",
];

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};
const TILE = {
  hidden: { opacity: 0, scale: 0.7, filter: "blur(14px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

/* ---- inline-SVG generated art tiles (no image files needed) ---- */

function ArtMountains() {
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="iv-m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d5ae0" />
          <stop offset="0.55" stopColor="#e6a6e8" />
          <stop offset="1" stopColor="#ffd9c9" />
        </linearGradient>
        <radialGradient id="iv-m-moon" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdb8ff" />
        </radialGradient>
      </defs>
      <rect width="160" height="120" fill="url(#iv-m-sky)" />
      <circle cx="104" cy="36" r="17" fill="url(#iv-m-moon)" />
      <path d="M0 96 L26 60 L44 78 L72 40 L104 86 L130 62 L160 94 L160 120 L0 120Z" fill="#7a63e0" opacity="0.9" />
      <path d="M0 106 L34 80 L60 98 L92 72 L130 102 L160 86 L160 120 L0 120Z" fill="#4c3fb5" />
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
        <linearGradient id="iv-c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b8cf0" />
          <stop offset="1" stopColor="#d5c4ff" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#iv-c-sky)" />
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

function ArtAurora() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="iv-a-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1d4a" />
          <stop offset="1" stopColor="#28356f" />
        </linearGradient>
        <linearGradient id="iv-a-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#34d399" stopOpacity="0.85" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#iv-a-sky)" />
      {[24, 36, 48].map((y, i) => (
        <path
          key={i}
          d={`M0 ${y} C 25 ${y - 16} 50 ${y + 14} 75 ${y - 8} C 90 ${y - 2} 100 ${y} 100 ${y}`}
          fill="none"
          stroke="url(#iv-a-glow)"
          strokeWidth={5 - i}
          opacity={0.9 - i * 0.2}
        />
      ))}
      <path d="M0 100 L20 78 L44 96 L68 80 L100 98 L100 100Z" fill="#0b1230" />
    </svg>
  );
}

function ArtCrystal() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="iv-x-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c8ff" />
          <stop offset="1" stopColor="#7d68e8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#iv-x-bg)" />
      <path d="M18 100 L36 30 L54 100Z" fill="#a78bfa" />
      <path d="M36 30 L54 100 L42 100 Z" fill="#ede4ff" opacity="0.9" />
      <path d="M46 100 L68 44 L90 100Z" fill="#8b6cf0" />
      <path d="M68 44 L90 100 L76 100 Z" fill="#f3ecff" opacity="0.85" />
    </svg>
  );
}

function Tile({ children }) {
  return (
    <motion.div
      variants={TILE}
      whileHover={{ scale: 1.06, y: -3, rotateZ: 1, zIndex: 10, transition: { type: "spring", stiffness: 300, damping: 18 } }}
      className="relative overflow-hidden rounded-xl border border-white/80 shadow-md"
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

/** Cycles the prompt text in the input bar so the mockup feels alive. */
function useCyclingPrompt(list, ms = 3600) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % list.length), ms);
    return () => clearInterval(id);
  }, [list.length, ms]);
  return list[i];
}

export default function ImageVisual() {
  const prompt = useCyclingPrompt(PROMPTS);

  return (
    <div className="mx-auto w-full max-w-4xl [transform:perspective(1400px)_rotateX(6deg)] transition-transform duration-700 hover:[transform:perspective(1400px)_rotateX(0deg)]">
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/75 p-5 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.45)] backdrop-blur-xl sm:p-8"
      >
        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
          <span className="absolute inset-x-6 top-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        {/* prompt bar */}
        <motion.div
          variants={POP}
          className="relative flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_14px_30px_-14px_rgba(79,70,229,0.4)]"
        >
          <Wand2 className="h-4 w-4 shrink-0 text-indigo-500" />
          <span className="flex-1 truncate text-[12.5px] text-gray-500 sm:text-sm">{prompt}</span>
          <motion.span
            whileHover={{ scale: 1.08 }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </motion.span>
        </motion.div>

        {/* gallery grid */}
        <motion.div
          variants={STAGGER}
          className="relative mt-5 grid h-52 grid-cols-[1.4fr_1fr_1fr] grid-rows-2 gap-2.5 sm:h-64"
        >
          <div className="row-span-2">
            <Tile>
              <ArtMountains />
            </Tile>
          </div>
          <Tile>
            <ArtCity />
          </Tile>
          <Tile>
            <ArtAurora />
          </Tile>
          <div className="col-span-2">
            <Tile>
              <ArtCrystal />
            </Tile>
          </div>

          <motion.span
            variants={POP}
            whileHover={{ scale: 1.06, y: -2 }}
            className="absolute bottom-2 left-2 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3" />
            4 images generated
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}