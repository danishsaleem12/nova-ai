"use client";

/**
 * ChatVisual — the animated mockup shown on the /product/ai-chat page.
 * Self-contained (no shared lib file), matching the "Hello [name]" welcome
 * screen style you referenced, styled like the glossy 3D cards in
 * AISuit.js / Hero.js.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Compass,
  FolderOpen,
  Grid2x2,
  Image as ImageIcon,
  MessageCircle,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const NAV = [
  { icon: MessageCircle, label: "AI Chat", active: true },
  { icon: Grid2x2, label: "AI Tools" },
  { icon: Compass, label: "Agents" },
  { icon: FolderOpen, label: "Workspace" },
  { icon: BookOpen, label: "Resources" },
];

const SUGGESTIONS = [
  { icon: Sparkles, label: "Write a blog post about AI trends" },
  { icon: MessageCircle, label: "Create a marketing plan" },
  { icon: Code2, label: "Help me with code" },
  { icon: ImageIcon, label: "Generate an image" },
];

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } };
const POP = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

function LogoMark({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="cv-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#cv-logo)" />
    </svg>
  );
}

/** Cycles the greeting name so the mockup feels alive without user data. */
function useCyclingName(names, ms = 3200) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % names.length), ms);
    return () => clearInterval(id);
  }, [names.length, ms]);
  return names[i];
}

export default function ChatVisual() {
  const name = useCyclingName(["Danish", "Sarah", "Alex"]);

  return (
    <div className="mx-auto w-full max-w-4xl [transform:perspective(1400px)_rotateX(6deg)] transition-transform duration-700 hover:[transform:perspective(1400px)_rotateX(0deg)]">
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/75 shadow-[0_40px_90px_-24px_rgba(79,70,229,0.45)] backdrop-blur-xl"
      >
        {/* ambient glow + sheen, matches the other glossy cards */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />
          <span className="absolute inset-x-6 top-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent" />
        </div>

        <div className="relative grid grid-cols-[76px_1fr] sm:grid-cols-[200px_1fr]">
          {/* sidebar */}
          <motion.div variants={POP} className="border-r border-white/70 bg-white/60 p-3 sm:p-4">
            <div className="mb-5 hidden items-center gap-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <LogoMark className="h-5 w-5" />
              </span>
              <span className="text-sm font-extrabold text-[#0f1030]">
                Nova<span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">AI</span>
              </span>
            </div>

            <ul className="space-y-1">
              {NAV.map(({ icon: Icon, label, active }) => (
                <motion.li
                  key={label}
                  whileHover={{ x: 3 }}
                  className={`flex cursor-default items-center justify-center gap-2 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors sm:justify-start sm:px-3 sm:text-[12.5px] ${
                    active ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* main panel */}
          <div className="flex flex-col p-5 sm:p-8">
            {/* top bar */}
            <motion.div variants={POP} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f1030] shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Claude 3.5 Sonnet
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md">
                + New Chat
              </span>
            </motion.div>

            {/* greeting */}
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <motion.span
                variants={POP}
                animate={{ rotate: [0, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-3 text-indigo-500"
              >
                <Sparkles className="h-6 w-6" />
              </motion.span>
              <motion.h3 variants={POP} className="text-xl font-extrabold text-[#0f1030] sm:text-2xl">
                Hello {name} <span aria-hidden>👋</span>
              </motion.h3>
              <motion.p variants={POP} className="mt-2 max-w-xs text-[12.5px] text-gray-500 sm:text-sm">
                Ask me anything, get creative, or solve problems. I&apos;m here to help you.
              </motion.p>

              {/* suggestion pills */}
              <motion.div variants={STAGGER} className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, label }) => (
                  <motion.span
                    key={label}
                    variants={POP}
                    whileHover={{ y: -3, scale: 1.03 }}
                    className="inline-flex cursor-default items-center gap-2 rounded-full border border-white bg-white/90 px-4 py-2 text-[11.5px] font-medium text-indigo-600 shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* input bar */}
            <motion.div
              variants={POP}
              className="flex items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_14px_30px_-14px_rgba(79,70,229,0.4)]"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 text-[12.5px] text-gray-400">Type your message here...</span>
              <motion.span
                whileHover={{ scale: 1.15, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-indigo-400/50"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <Send className="relative h-3.5 w-3.5" />
              </motion.span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}