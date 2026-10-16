// frontend/src/components/shared/GradientButton.js
"use client";

/**
 * The gradient primary button used on the newsletter confirm / unsubscribe pages.
 *   <GradientButton loading={submitting} loadingText="Saving...">Save changes</GradientButton>
 * Pass icon={null} to hide the arrow. className can add e.g. "sm:w-auto sm:px-8".
 */

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function GradientButton({
  children,
  loading = false,
  loadingText = "Please wait...",
  icon: Icon = ArrowRight,
  disabled = false,
  className = "",
  type = "submit",
  ...props
}) {
  const off = loading || disabled;
  return (
    <motion.button
      type={type}
      disabled={off}
      whileHover={off ? undefined : { scale: 1.03, y: -3 }}
      whileTap={off ? undefined : { scale: 0.97 }}
      className={`group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 text-[15px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(79,70,229,0.75)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-10px_rgba(79,70,229,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/35 to-transparent"
      />
      {loading ? (
        <>
          <Loader2 className="relative h-4 w-4 animate-spin" />
          <span className="relative">{loadingText}</span>
        </>
      ) : (
        <>
          <span className="relative">{children}</span>
          {Icon && (
            <Icon className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          )}
        </>
      )}
    </motion.button>
  );
}
