// frontend/src/components/auth/SignupForm.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthInput from "@/components/auth/AuthInput";
import SocialButtons, { OrDivider } from "@/components/auth/SocialButtons";

const EASE = [0.22, 1, 0.36, 1];
const REDIRECT_TO = "/chat"; // where to go after a successful signup
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } };
const RISE = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* ---------------------------- password strength ---------------------------- */

const STRENGTH_LEVELS = [
  { label: "Too short", bar: "bg-gray-300", text: "text-gray-400" },
  { label: "Weak", bar: "bg-red-400", text: "text-red-500" },
  { label: "Fair", bar: "bg-amber-400", text: "text-amber-500" },
  { label: "Good", bar: "bg-sky-500", text: "text-sky-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

function getStrength(pw) {
  if (!pw) return { score: 0, checks: [] };
  const checks = [
    { label: "8+ characters", ok: pw.length >= 8 },
    { label: "Upper & lower case", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  // Under 8 characters is always "Too short", since the backend rejects it
  if (pw.length < 8) return { score: 0, checks };
  const passed = checks.filter((c) => c.ok).length; // 1..4
  return { score: passed, checks };
}

function StrengthMeter({ password }) {
  const { score, checks } = useMemo(() => getStrength(password), [password]);
  const level = STRENGTH_LEVELS[score];

  return (
    <AnimatePresence initial={false}>
      {password && (
        <motion.div
          key="meter"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="pt-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((seg) => (
                <span key={seg} className="h-1.5 flex-1 overflow-hidden rounded-full bg-indigo-100">
                  <motion.span
                    className={`block h-full origin-left rounded-full ${level.bar}`}
                    initial={false}
                    animate={{ scaleX: score >= seg ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                </span>
              ))}
              <span className={`ml-1 w-16 text-right text-[11px] font-bold ${level.text}`}>{level.label}</span>
            </div>

            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 text-[11.5px] transition-colors duration-300 ${
                    c.ok ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors duration-300 ${
                      c.ok ? "bg-emerald-100" : "bg-gray-100"
                    }`}
                  >
                    {c.ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------- form ---------------------------------- */

export default function SignupForm() {
  const router = useRouter();
  const { signup, googleLogin, isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Skip the form.
  useEffect(() => {
    if (!loading && isAuthenticated) router.replace(REDIRECT_TO);
  }, [loading, isAuthenticated, router]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (name === "password" && errors.confirm) setErrors((er) => ({ ...er, confirm: undefined }));
    if (formError) setFormError("");
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();

    if (!name) next.name = "Name is required";
    else if (name.length < 2) next.name = "Name must be at least 2 characters";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Please enter a valid email";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";

    if (!form.confirm) next.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) next.confirm = "Passwords don't match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    setFormError("");
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      router.replace(REDIRECT_TO);
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  const onGoogle = async (credential) => {
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      await googleLogin(credential);
      router.replace(REDIRECT_TO);
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show">
      <motion.div variants={RISE}>
        <SocialButtons
          text="signup_with"
          onCredential={onGoogle}
          onError={setFormError}
          disabled={submitting}
        />
      </motion.div>

      <motion.div variants={RISE}>
        <OrDivider label="or sign up with email" />
      </motion.div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <AnimatePresence initial={false}>
          {formError && (
            <motion.div
              key="form-error"
              role="alert"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/90 px-3.5 py-3 text-[13px] font-medium text-red-600 shadow-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={RISE}>
          <AuthInput
            label="Full name"
            icon={User}
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
            placeholder="Your name"
            autoComplete="name"
            disabled={submitting}
          />
        </motion.div>

        <motion.div variants={RISE}>
          <AuthInput
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={submitting}
          />
        </motion.div>

        <motion.div variants={RISE}>
          <AuthInput
            label="Password"
            icon={Lock}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={submitting}
          />
          <StrengthMeter password={form.password} />
        </motion.div>

        <motion.div variants={RISE}>
          <AuthInput
            label="Confirm password"
            icon={Lock}
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={onChange}
            error={errors.confirm}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            disabled={submitting}
          />
        </motion.div>

        <motion.p variants={RISE} className="text-center text-[12px] leading-relaxed text-gray-500">
          By creating an account you agree to our{" "}
          <a href="#terms" className="font-semibold text-indigo-600 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#privacy" className="font-semibold text-indigo-600 hover:underline">
            Privacy Policy
          </a>
          .
        </motion.p>

        <motion.div variants={RISE}>
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? undefined : { scale: 1.03, y: -3 }}
            whileTap={submitting ? undefined : { scale: 0.97 }}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 text-[15px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(79,70,229,0.75)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-10px_rgba(79,70,229,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/35 to-transparent"
            />
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              animate={{ x: ["-150%", "450%"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
            />
            {submitting ? (
              <>
                <Loader2 className="relative h-4 w-4 animate-spin" />
                <span className="relative">Creating account...</span>
              </>
            ) : (
              <>
                <span className="relative">Create account</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}