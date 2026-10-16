import { notFound } from "next/navigation";
import AIToolPage from "@/components/AIToolPage";
import { TOOLS } from "@/data/tools";

export function generateStaticParams() {
  return Object.keys(TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const name = TOOLS[slug];
  if (!name) return { title: "Tool not found" };
  return {
    title: `${name} | NovaAI`,
    description: `Explore ${name}, one of the AI tools in the NovaAI platform.`,
  };
}

export default async function AIToolRoute({ params }) {
  const { slug } = await params;
  if (!TOOLS[slug]) notFound();
  return <AIToolPage slug={slug} />;
}