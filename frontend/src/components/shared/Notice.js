// frontend/src/components/shared/Notice.js
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/** Animated error / success message. Renders nothing when message is empty. */
export function Notice({ type = "error", message }) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key={message}
          role={isError ? "alert" : "status"}
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <div
            className={`flex items-start gap-2 rounded-2xl border px-3.5 py-3 text-[13px] font-medium shadow-sm ${
              isError
                ? "border-red-200 bg-red-50/90 text-red-600"
                : "border-emerald-200 bg-emerald-50/90 text-emerald-700"
            }`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
