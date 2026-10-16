// frontend/src/app/newsletter/confirm/page.js

import { Suspense } from "react";
import PageShell from "@/components/shared/PageShell";
import NewsletterAction from "@/components/NewsletterAction";

export const metadata = {
  title: "Confirm subscription — NovaAI",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const HEADING = [{ text: "Confirm" }, { text: "your" }, { br: true }, { text: "email.", gradient: "from-blue-500 via-indigo-500 to-violet-500" }];

export default function Page() {
  return (
    <PageShell
      badge="Newsletter"
      heading={HEADING}
      subtext="Confirming keeps spam sign-ups out and makes sure the digest reaches the right inbox."
      cardTitle="Confirm subscription"
      cardText="NovaAI Friday digest"
    >
      {/* reads ?token= with useSearchParams, which needs a Suspense boundary */}
      <Suspense fallback={null}>
        <NewsletterAction action="confirm" />
      </Suspense>
    </PageShell>
  );
}
