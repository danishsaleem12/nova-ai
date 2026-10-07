import { notFound } from "next/navigation";
import AgentsPage from "@/components/AgentsPage";

// Slug -> agent name. The full content for each agent lives in AgentsPage.js
// (keyed by the same slugs). Add a new agent here and there.
const AGENTS = {
  "research-agent": "Research Agent",
  "coding-agent": "Coding Agent",
  "marketing-agent": "Marketing Agent",
  "automation-agent": "Automation Agent",
  "custom-agent": "Custom Agents",
};

export function generateStaticParams() {
  return Object.keys(AGENTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const name = AGENTS[slug];
  if (!name) return { title: "Agent not found" };
  return {
    title: `${name} | NovaAI`,
    description: `Explore ${name}, one of the autonomous agents in the NovaAI platform.`,
  };
}

export default async function AgentRoute({ params }) {
  const { slug } = await params;
  if (!AGENTS[slug]) notFound();
  return <AgentsPage slug={slug} />;
}