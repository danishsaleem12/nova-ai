// frontend/src/components/auth/AuthInput.js
"use client";

/**
 * Reusable input for the auth forms.
 *
 * Usage:
 *   <AuthInput
 *     label="Email"
 *     icon={Mail}
 *     type="email"
 *     name="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     error={errors.email}
 *     autoComplete="email"
 *   />
 *
 * Passing type="password" adds a show/hide toggle automatically.
 */

import { forwardRef, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const AuthInput = forwardRef(function AuthInput(
  { label, icon: Icon, type = "text", error, hint, className = "", ...props },
  ref
) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[#1b1b3a]">
          {label}
        </label>
      )}

      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`group relative flex items-center rounded-2xl border bg-white/80 shadow-sm transition-all duration-300 ${
          error
            ? "border-red-300 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]"
            : focused
            ? "border-indigo-300 shadow-[0_0_0_3px_rgba(129,140,248,0.25),0_12px_28px_-14px_rgba(79,70,229,0.5)]"
            : "border-white/90 hover:border-indigo-200 hover:shadow-md"
        }`}
      >
        {Icon && (
          <span
            className={`pointer-events-none absolute left-3.5 flex transition-colors duration-300 ${
              error ? "text-red-400" : focused ? "text-indigo-600" : "text-indigo-400"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
          className={`h-12 w-full rounded-2xl bg-transparent text-[15px] text-[#0f1030] outline-none placeholder:text-gray-400 ${
            Icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-12" : "pr-4"}`}
        />

        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={show ? "off" : "on"}
                initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12px] font-medium text-red-500"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" id={`${id}-hint`} className="mt-1.5 text-[12px] text-gray-500">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

export default AuthInput;