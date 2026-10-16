// src/app/global-error.js
"use client";

// Last-resort boundary: replaces the whole page (including the root layout) when the layout
// itself crashes. It must render its own <html> and <body>, and the layout's imports don't
// apply here, so the stylesheet is imported again.

import "./globals.css";
import { useEffect } from "react";
import StatusCard, { StatusBackground, primaryButtonClass, secondaryButtonClass } from "@/components/StatusScreen";

export default function GlobalError({ error, reset, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry || reset;

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <StatusBackground>
          <StatusCard
            label="Oops"
            title="NovaAI hit a problem"
            message="Something went wrong on our side. Please try again in a moment."
            actions={
              <>
                <button type="button" onClick={() => retry()} className={primaryButtonClass}>
                  Try again
                </button>
                {/* A plain <a> on purpose: it does a full reload, which resets a broken app state */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/" className={secondaryButtonClass}>
                  Back to home
                </a>
              </>
            }
          />
        </StatusBackground>
      </body>
    </html>
  );
}
