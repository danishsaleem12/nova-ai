// src/app/error.js
"use client";

// Error boundary for every route below the root layout: if a page crashes while rendering,
// the visitor sees this instead of a blank screen, and can retry without reloading the site.
// (Errors thrown inside the root layout itself are handled by global-error.js.)

import { useEffect } from "react";
import Link from "next/link";
import StatusCard, { StatusBackground, primaryButtonClass, secondaryButtonClass } from "@/components/StatusScreen";

export default function Error({ error, reset, unstable_retry }) {
  useEffect(() => {
    // Send this to your error tracker (Sentry, etc.) if you add one.
    console.error(error);
  }, [error]);

  // Newer Next.js versions pass `unstable_retry`; older ones only pass `reset`.
  const retry = unstable_retry || reset;

  return (
    <main>
      <StatusBackground>
        <StatusCard
          label="Oops"
          title="Something went wrong"
          message="An unexpected error occurred while loading this page. You can try again, or head back home."
          actions={
            <>
              <button type="button" onClick={() => retry()} className={primaryButtonClass}>
                Try again
              </button>
              <Link href="/" className={secondaryButtonClass}>
                Back to home
              </Link>
            </>
          }
        >
          {error?.digest ? (
            <p className="mt-5 text-xs text-gray-400">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </StatusCard>
      </StatusBackground>
    </main>
  );
}
