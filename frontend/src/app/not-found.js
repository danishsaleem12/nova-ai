// src/app/not-found.js
//
// Shown for any URL that matches no route, and whenever a page calls notFound()
// (e.g. /product/does-not-exist). Rendered inside the root layout, so the navbar stays.

import Link from "next/link";
import Footer from "@/components/Footer";
import StatusCard, { StatusBackground, primaryButtonClass, secondaryButtonClass } from "@/components/StatusScreen";

export const metadata = {
  title: "Page not found | NovaAI",
  description: "The page you're looking for doesn't exist or has moved.",
};

export default function NotFound() {
  return (
    <>
      <main>
        <StatusBackground>
          <StatusCard
            label="404"
            title="Page not found"
            message="The page you're looking for doesn't exist, was moved, or the link is out of date."
            actions={
              <>
                <Link href="/" className={primaryButtonClass}>
                  Back to home
                </Link>
                <Link href="/chat" className={secondaryButtonClass}>
                  Open AI Chat
                </Link>
              </>
            }
          />
        </StatusBackground>
      </main>
      <Footer />
    </>
  );
}
