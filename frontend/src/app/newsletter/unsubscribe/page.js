// frontend/src/app/newsletter/unsubscribe/page.js

import { Suspense } from "react";
import PageShell from "@/components/shared/PageShell";
import NewsletterAction from "@/components/NewsletterAction";

export const metadata = {
  title: "Unsubscribe — NovaAI",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const HEADING = [{ text: "Leaving" }, { text: "so" }, { text: "soon?", gradient: "from-blue-500 via-indigo-500 to-violet-500" }];

export default function Page() {
  return (
    <PageShell
      badge="Newsletter"
      heading={HEADING}
      subtext="You can unsubscribe in one click. You can always sign up again later."
      cardTitle="Unsubscribe"
      cardText="NovaAI Friday digest"
    >
      {/* reads ?token= with useSearchParams, which needs a Suspense boundary */}
      <Suspense fallback={null}>
        <NewsletterAction action="unsubscribe" />
      </Suspense>
    </PageShell>
  );
}
