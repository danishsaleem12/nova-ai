"use client";

/**
 * CodeVisual — the animated mockup shown on the /product/ai-code page.
 * Self-contained (no shared lib file). A tabbed editor whose code types
 * itself out line by line, syntax-tinted with plain spans (no highlighter
 * dependency), plus an inline AI suggestion chip that pulses in.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Code2, Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const TABS = ["auth.ts", "server.ts", "utils.ts"];

// Each line is an array of { text, tone } spans so it reads like syntax
// highlighting without needing a real highlighter.
const CODE_LINES = [
  [{ t: "function ", c: "text-fuchsia-500" }, { t: "authenticate", c: "text-sky-500" }, { t: "(user: User) {", c: "text-gray-500" }],
  [{ t: "  if ", c: "text-fuchsia-500" }, { t: "(!user.token) {", c: "text-gray-500" }],
  [{ t: "    throw new ", c: "text-fuchsia-500" }, { t: "AuthError", c: "text-sky-500" }, { t: "();", c: "text-gray-500" }],
  [{ t: "  }", c: "text-gray-500" }],
  [{ t: "  return ", c: "text-fuchsia-500" }, { t: "verify", c: "text-sky-500" }, { t: "(user.token);", c: "text-gray-500" }],
  [{ t: "}", c: "text-gray-500" }],
];

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/** Reveals CODE_LINES one line at a time, then holds before looping. */
function useTypedLines(lines, msPerLine = 420, holdMs = 2600) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? lines.length : 0);

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let timer;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < lines.length) {
        timer = setTimeout(tick, msPerLine);
      } else {
        timer = setTimeout(() => {
          i = 0;
          setCount(0);
          timer = setTimeout(tick, msPerLine);
        }, holdMs);
      }
    };
    timer = setTimeout(tick, msPerLine);
    return () => clearTimeout(timer);
  }, [lines.length, msPerLine, holdMs, reduce]);

  return count;
}

export default function CodeVisual() {
  const visibleLines = useTypedLines(CODE_LINES);

  return (
    <div className="mx-auto w-full max-w-4xl [transform:perspective(1400px)_rotateX(6deg)] transition-transform duration-700 hover:[transform:perspective(1400px)_rotateX(0deg)]">
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/75 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.45)] backdrop-blur-xl"
      >
        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
          <span className="absolute inset-x-6 top-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <div className="relative p-5 sm:p-7">
          {/* tabs */}
          <motion.div variants={POP} className="flex items-center gap-1.5">
            {TABS.map((tab, i) => (
              <span
                key={tab}
                className={`inline-flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-[11px] font-medium ${
                  i === 0 ? "bg-white text-[#0f1030] shadow-sm" : "text-gray-400"
                }`}
              >
                <Code2 className="h-3 w-3" />
                {tab}
              </span>
            ))}
          </motion.div>

          {/* editor */}
          <motion.div
            variants={POP}
            className="rounded-b-2xl rounded-tr-2xl border border-white bg-[#0f1030] p-4 shadow-[0_20px_50px_-18px_rgba(15,16,48,0.6)] sm:p-5"
          >
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>

            <div className="font-mono text-[11.5px] leading-relaxed sm:text-[12.5px]">
              {CODE_LINES.map((line, li) => (
                <div key={li} className="flex gap-3">
                  <span className="w-4 shrink-0 select-none text-right text-gray-600">{li + 1}</span>
                  <span className="min-h-[1.4em]">
                    {li < visibleLines &&
                      line.map((span, si) => (
                        <span key={si} className={span.c}>
                          {span.t}
                        </span>
                      ))}
                    {li === visibleLines && (
                      <motion.span
                        aria-hidden
                        className="ml-0.5 inline-block h-3 w-[2px] translate-y-[1px] bg-emerald-400 align-middle"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* inline AI suggestion */}
            <motion.div
              variants={POP}
              animate={{ opacity: [0, 1], y: [6, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10.5px] font-medium text-emerald-300"
            >
              <Sparkles className="h-3 w-3" />
              Suggestion: add a null check for user.token
              <Check className="h-3 w-3" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}