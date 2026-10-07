// frontend/src/components/auth/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="guard-logo-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="guard-logo-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill="url(#guard-logo-a)" />
      <path d="M12 14.6 L14.1 20 H9.9 Z" fill="url(#guard-logo-b)" />
    </svg>
  );
}

/** Full-screen themed loader shown while we check the session. */
function GuardLoader() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6f4ff] via-[#eef4ff] to-[#f9f2ff]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-sky-300/40 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-indigo-400/40"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-[0_12px_30px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white">
            <LogoMark />
          </span>
        </div>
        <p className="text-sm font-medium text-gray-500">Checking your session...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace(redirectTo);
  }, [loading, user, router, redirectTo]);

  // While checking, or while redirecting, never render the protected content
  if (loading || !user) return <GuardLoader />;

  return children;
}