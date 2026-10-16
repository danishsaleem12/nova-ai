"use client";

/**
 * VoiceVisual — the animated mockup shown on the /product/ai-voice page.
 * Self-contained (no shared lib file). A glossy mic orb with pulsing
 * rings, a live-looking waveform, and a typewriter transcript line.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { AudioLines, Mic } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const TRANSCRIPT =
  "Hey, can you summarize today's standup and send it to the team?";

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

// Fixed bar heights so the waveform looks natural but stays deterministic
// (no random values that would mismatch between server and client render).
const BAR_HEIGHTS = [
  14, 22, 34, 18, 40, 26, 46, 20, 32, 44, 16, 28, 38, 24, 42, 18, 30, 20, 36, 14,
  26, 44, 20, 32, 16, 40, 24, 34, 18, 28,
];

function Waveform() {
  return (
    <div className="flex h-20 items-center justify-center gap-[3px] sm:h-24">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-sky-400 to-indigo-500 sm:w-1"
          style={{ height: h }}
          animate={{ scaleY: [0.4, 1, 0.5, 0.9, 0.4] }}
          transition={{
            duration: 1.6 + (i % 5) * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 7) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

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
        timer = setTimeout(tick, 38);
      } else {
        timer = setTimeout(() => {
          i = 0;
          tick();
        }, 2600);
      }
    };
    timer = setTimeout(tick, 0); // first step on the next tick, not synchronously in the effect
    return () => clearTimeout(timer);
  }, [inView, reduce, text]);

  const shown = reduce ? text : text.slice(0, count);

  return (
    <p ref={ref} className="relative text-center text-[13px] leading-relaxed text-gray-600 sm:text-sm">
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

export default function VoiceVisual() {
  return (
    <div className="mx-auto w-full max-w-4xl [transform:perspective(1400px)_rotateX(6deg)] transition-transform duration-700 hover:[transform:perspective(1400px)_rotateX(0deg)]">
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/75 p-6 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.45)] backdrop-blur-xl sm:p-10"
      >
        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl" />
          <span className="absolute inset-x-6 top-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <div className="relative flex flex-col items-center">
          {/* glossy mic orb with pulsing rings */}
          <motion.div variants={POP} className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full border-2 border-sky-400/60"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.6], opacity: [0.7, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
              />
            ))}
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/80 sm:h-20 sm:w-20"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, #ffffff 0%, #dbe7ff 24%, #93b4ff 56%, #6d5ae0 100%)",
                boxShadow:
                  "inset -10px -14px 24px rgba(60,40,180,0.4), inset 8px 8px 18px rgba(255,255,255,0.85), 0 18px 40px rgba(56,130,255,0.5)",
              }}
            >
              <Mic className="h-7 w-7 text-white drop-shadow-md sm:h-8 sm:w-8" strokeWidth={1.8} />
            </div>
          </motion.div>

          {/* status pill */}
          <motion.span
            variants={POP}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            Listening
          </motion.span>

          {/* waveform */}
          <motion.div variants={POP} className="mt-4 w-full max-w-md">
            <Waveform />
          </motion.div>

          {/* live transcript */}
          <motion.div
            variants={POP}
            className="mt-4 flex w-full max-w-md items-start gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm"
          >
            <AudioLines className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <Typewriter text={TRANSCRIPT} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}