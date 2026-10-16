// src/data/agents.js
//
// Slug -> name for every /agents/[slug] page. The full content for each agent lives in
// components/AgentsPage.js (keyed by the same slugs). Add a new agent here and there.
// Plain module (no "use client") so server code, the sitemap and OG images can import it.

export const AGENTS = {
  "research-agent": "Research Agent",
  "coding-agent": "Coding Agent",
  "marketing-agent": "Marketing Agent",
  "automation-agent": "Automation Agent",
  "custom-agent": "Custom Agents",
};
