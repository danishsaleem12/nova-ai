// frontend/src/components/auth/SocialButtons.js
"use client";

/**
 * Google sign-in button + "or" divider.
 *
 * Usage:
 *   <SocialButtons
 *     text="signin_with"            // or "signup_with" / "continue_with"
 *     onCredential={(credential) => googleLogin(credential)}
 *     onError={(message) => setFormError(message)}
 *     disabled={submitting}
 *   />
 *   <OrDivider label="or continue with email" />
 *
 * Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env.local
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

// Load Google's script once, no matter how many times the component mounts
let gsiPromise = null;
function loadGsi() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      gsiPromise = null;
      reject(new Error("Failed to load Google script"));
    });
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return gsiPromise;
}

function GoogleLogo({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function SocialButtons({
  text = "continue_with",
  onCredential,
  onError,
  disabled = false,
}) {
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // keep the latest callbacks without re-initializing Google
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !btnRef.current || !wrapRef.current) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response?.credential) onCredentialRef.current?.(response.credential);
            else onErrorRef.current?.("Google sign-in was cancelled.");
          },
        });

        // Google's button accepts a pixel width between 200 and 400
        const width = Math.min(400, Math.max(200, Math.floor(wrapRef.current.clientWidth)));
        btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width,
        });
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [text]);

  const missingConfig = !CLIENT_ID;

  return (
    <div ref={wrapRef} className="w-full">
      {missingConfig || failed ? (
        // Fallback so the layout still looks right if Google isn't set up yet
        <motion.button
          type="button"
          onClick={() =>
            onError?.(
              missingConfig
                ? "Google login isn't configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID."
                : "Couldn't load Google. Check your connection and refresh."
            )
          }
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white bg-white/90 text-[14px] font-semibold text-[#1b1b3a] shadow-[0_12px_30px_-10px_rgba(79,70,229,0.35)] transition-shadow hover:shadow-[0_22px_44px_-12px_rgba(79,70,229,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <GoogleLogo />
          Continue with Google
        </motion.button>
      ) : (
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`relative flex min-h-[48px] items-center justify-center overflow-hidden rounded-full border border-white bg-white/90 shadow-[0_12px_30px_-10px_rgba(79,70,229,0.35)] transition-shadow duration-300 hover:shadow-[0_22px_44px_-12px_rgba(79,70,229,0.5)] ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {/* skeleton while Google's script loads */}
          {!ready && (
            <span className="absolute inset-0 flex items-center justify-center gap-3 text-[14px] font-semibold text-gray-400">
              <GoogleLogo className="h-5 w-5 opacity-60" />
              Loading Google...
            </span>
          )}
          <div ref={btnRef} className={ready ? "opacity-100" : "opacity-0"} />
        </motion.div>
      )}
    </div>
  );
}

/** Horizontal divider with a centered label, e.g. "or continue with email". */
export function OrDivider({ label = "or continue with email" }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-indigo-200/60" />
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-400">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-indigo-200 to-indigo-200/60" />
    </div>
  );
}