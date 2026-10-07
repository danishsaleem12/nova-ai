"use client";

/**
 * DocsVisual — the animated mockup shown on the /product/ai-documents page.
 * Self-contained (no shared lib file). A file list on the left, a query
 * bar + AI summary with citation chips on the right.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const FILES = [
  { name: "Q3-financial-report.pdf", pages: "42 pages", active: true },
  { name: "product-roadmap.docx", pages: "18 pages" },
  { name: "customer-interviews.pdf", pages: "63 pages" },
];

const SUMMARY_LINES = [
  "Revenue grew 24% quarter over quarter, led by the enterprise segment.",
  "Operating margin improved to 18%, up from 14% last quarter.",
  "Customer churn dropped to 3.2%, the lowest in six quarters.",
];

const CITATIONS = ["p. 4", "p. 11", "p. 27"];

const QUERIES = [
  "What changed in revenue this quarter?",
  "Summarize the key risks section",
  "Compare this to last quarter's numbers",
];

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/** Cycles the query text in the search bar so the mockup feels alive. */
function useCyclingText(list, ms = 3400) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % list.length), ms);
    return () => clearInterval(id);
  }, [list.length, ms]);
  return list[i];
}

export default function DocsVisual() {
  const query = useCyclingText(QUERIES);

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
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
          <span className="absolute inset-x-6 top-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-[210px_1fr]">
          {/* file list */}
          <motion.div variants={POP} className="border-b border-white/70 bg-white/60 p-4 sm:border-b-0 sm:border-r">
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-500">
              Your files
            </span>
            <ul className="space-y-1.5">
              {FILES.map((f) => (
                <motion.li
                  key={f.name}
                  whileHover={{ x: 3 }}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
                    f.active ? "bg-indigo-100/80 shadow-sm" : "hover:bg-indigo-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      f.active ? "bg-indigo-500 text-white" : "bg-white text-indigo-500 shadow-sm"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] font-semibold text-[#0f1030]">{f.name}</span>
                    <span className="block text-[10.5px] text-gray-500">{f.pages}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* query + summary panel */}
          <div className="p-5 sm:p-7">
            {/* query bar */}
            <motion.div
              variants={POP}
              className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_14px_30px_-14px_rgba(79,70,229,0.4)]"
            >
              <Search className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="flex-1 truncate text-[12.5px] text-gray-500 sm:text-sm">{query}</span>
              <motion.span
                whileHover={{ scale: 1.15, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
            </motion.div>

            {/* AI summary */}
            <motion.div
              variants={POP}
              className="mt-4 rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-500">
                <Sparkles className="h-3 w-3" />
                Summary
              </div>
              <motion.ul variants={STAGGER} className="space-y-2">
                {SUMMARY_LINES.map((line, i) => (
                  <motion.li key={line} variants={POP} className="flex items-start gap-2 text-[12px] leading-relaxed text-gray-600 sm:text-[13px]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                    <span className="flex-1">
                      {line}{" "}
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-500 align-middle">
                        {CITATIONS[i]}
                      </span>
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}