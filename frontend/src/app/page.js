//src/app/page.js

import AIAgentsAutomation from "@/components/AIAgentsAutomation";
import AIFinalCTA from "@/components/Aifinalcta";
import AIPricing from "@/components/AIPricing";
import AISuite from "@/components/AISuite";
import AIWorkspace from "@/components/AIWorkspace";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <AISuite />
      <AIWorkspace />
      <AIAgentsAutomation />
      <Testimonials />
      <AIPricing />
      <AIFinalCTA />
      <Footer />
    </main>
  );
}
