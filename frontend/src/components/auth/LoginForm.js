// frontend/src/components/auth/LoginForm.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthInput from "@/components/auth/AuthInput";
import SocialButtons, { OrDivider } from "@/components/auth/SocialButtons";

const EASE = [0.22, 1, 0.36, 1];
const REDIRECT_TO = "/chat"; // where to go after a successful login
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } };
const RISE = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function LoginForm() {
  const router = useRouter();
  const { login, googleLogin, isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
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
    if (formError) setFormError("");
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Please enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    setFormError("");
    try {
      await login({ email: form.email.trim(), password: form.password });
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
          text="signin_with"
          onCredential={onGoogle}
          onError={setFormError}
          disabled={submitting}
        />
      </motion.div>

      <motion.div variants={RISE}>
        <OrDivider label="or continue with email" />
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
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={submitting}
          />
        </motion.div>

        <motion.div variants={RISE} className="pt-1">
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
                <span className="relative">Logging in...</span>
              </>
            ) : (
              <>
                <span className="relative">Log in</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}