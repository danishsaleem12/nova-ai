//src/app/page.js

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Hero is the first thing every visitor sees, so it loads normally. The sections below the fold
// are split into their own JS files: they are still rendered on the server (good for SEO, no
// layout jump), but the browser downloads and starts them after the hero instead of in one big
// bundle, so the first screen becomes interactive sooner on slow phone connections.
const AISuite = dynamic(() => import("@/components/AISuite"));
const AIWorkspace = dynamic(() => import("@/components/AIWorkspace"));
const AIAgentsAutomation = dynamic(() => import("@/components/AIAgentsAutomation"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const AIFinalCTA = dynamic(() => import("@/components/Aifinalcta"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <main>
      <Hero />
      <AISuite />
      <AIWorkspace />
      <AIAgentsAutomation />
      <Testimonials />
      <AIFinalCTA />
      <Footer />
    </main>
  );
}
