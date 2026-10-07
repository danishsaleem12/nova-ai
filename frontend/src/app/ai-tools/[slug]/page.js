import { notFound } from "next/navigation";
import AIToolPage from "@/components/AIToolPage";

// Slug -> tool name. The full content for each tool lives in AIToolPage.js
// (keyed by the same slugs). Add a new tool here and there.
const TOOLS = {
  "ai-writer": "AI Writer",
  "image-generator": "Image Generator",
  "data-analyzer": "Data Analyzer",
  "code-assistant": "Code Assistant",
  "ai-summarizer": "AI Summarizer",
};

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