// src/components/StatusScreen.js
//
// The shared look for not-found, error and loading screens: soft gradient background, blurred
// colour blobs and the NovaAI logo mark (same style as the session-check loader in
// auth/ProtectedRoute.js). No hooks or browser APIs, so it works in server and client components.

export function LogoMark({ className = "h-8 w-8", idPrefix = "status-logo" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${idPrefix}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <path d="M12 3 L21 20 H16.5 L12 11.5 L7.5 20 H3 Z" fill={`url(#${idPrefix}-a)`} />
      <path d="M12 14.6 L14.1 20 H9.9 Z" fill={`url(#${idPrefix}-b)`} />
    </svg>
  );
}

/** Full-width section with the gradient background; children are centred. */
export function StatusBackground({ children, className = "min-h-screen" }) {
  return (
    <div
      className={`relative isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6f4ff] via-[#eef4ff] to-[#f9f2ff] px-6 py-28 ${className}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-sky-300/40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-xl">{children}</div>
    </div>
  );
}

const BUTTON_BASE =
  "inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2";

export const primaryButtonClass = `${BUTTON_BASE} bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 text-white shadow-[0_16px_36px_-10px_rgba(79,70,229,0.75)] hover:shadow-[0_24px_50px_-10px_rgba(79,70,229,0.95)]`;
export const secondaryButtonClass = `${BUTTON_BASE} border border-indigo-100 bg-white/90 text-[#1b1b3a] shadow-[0_10px_24px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_18px_36px_-10px_rgba(79,70,229,0.55)]`;

/**
 * A centred glass card: big gradient label (e.g. "404"), title, message and action buttons.
 *   <StatusCard label="404" title="Page not found" message="..." actions={<>...</>} />
 */
export default function StatusCard({ label, title, message, actions, children }) {
  return (
    <div className="rounded-3xl border border-white/90 bg-white/75 p-8 text-center shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)] backdrop-blur-md sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-[0_12px_30px_-8px_rgba(99,102,241,0.6)] ring-1 ring-white">
        <LogoMark className="h-8 w-8" />
      </span>
      {label ? (
        <p className="mt-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          {label}
        </p>
      ) : null}
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0f1030] sm:text-3xl">{title}</h1>
      {message ? <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-gray-600">{message}</p> : null}
      {children}
      {actions ? <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{actions}</div> : null}
    </div>
  );
}
