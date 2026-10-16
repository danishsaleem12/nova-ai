// frontend/src/components/NewsletterAction.js
"use client";

/**
 * Landing page for the links in newsletter emails.
 *   <NewsletterAction action="confirm" />      -> /newsletter/confirm?token=...
 *   <NewsletterAction action="unsubscribe" />  -> /newsletter/unsubscribe?token=...
 * The change only happens when the person clicks the button (a click, not just opening
 * the link), so email scanners that pre-open links can't confirm or unsubscribe anyone.
 */

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailX } from "lucide-react";
import { newsletterApi } from "@/lib/api";
import GradientButton from "@/components/shared/GradientButton";
import { Notice } from "@/components/shared/Notice";

const TOKEN_RE = /^[a-f0-9]{48}$/i;

const COPY = {
  confirm: {
    title: "Confirm your subscription",
    text: "One click and the Friday digest is yours.",
    button: "Confirm subscription",
    loading: "Confirming...",
    run: newsletterApi.confirm,
  },
  unsubscribe: {
    title: "Unsubscribe from the digest",
    text: "We're sorry to see you go. You won't get any more emails from us.",
    button: "Unsubscribe me",
    loading: "Unsubscribing...",
    run: newsletterApi.unsubscribe,
  },
};

export default function NewsletterAction({ action }) {
  const copy = COPY[action];
  const token = useSearchParams().get("token") || "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await copy.run(token);
      setDoneMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!TOKEN_RE.test(token)) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <MailX className="h-7 w-7" />
        </span>
        <p className="mt-4 text-sm text-gray-600">This link isn&apos;t valid. Use the link from the latest email.</p>
      </div>
    );
  }

  if (doneMessage) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="mt-4 text-sm font-medium text-[#0f1030]">{doneMessage}</p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:underline">
          Back to NovaAI
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Notice type="error" message={error} />
      <GradientButton type="button" onClick={onClick} loading={busy} loadingText={copy.loading}>
        {copy.button}
      </GradientButton>
    </div>
  );
}
