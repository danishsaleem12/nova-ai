// src/app/loading.js
//
// Shown instantly while a page is loading or navigating (Next.js wraps the page in a
// Suspense boundary with this as the fallback). Keep it light: it must render immediately.

import { LogoMark, StatusBackground } from "@/components/StatusScreen";

export default function Loading() {
  return (
    <StatusBackground>
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-indigo-400/40" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-[0_12px_30px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white">
            <LogoMark idPrefix="loading-logo" />
          </span>
        </div>
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    </StatusBackground>
  );
}
