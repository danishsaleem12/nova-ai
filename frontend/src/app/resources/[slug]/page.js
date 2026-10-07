import { notFound } from "next/navigation";
import ResourcesPage from "@/components/ResourcesPage";
import { RESOURCE_SLUGS, RESOURCES } from "@/data/resources";

/**
 * /resources/[slug]
 *
 * Sibling route to app/agents/[slug]/page.js. Every resource in
 * RESOURCES (data/resources.js) gets a page automatically — add a new
 * entry there and its route appears here with no extra wiring.
 *
 * Two things matter here, both from hard-won errors:
 *  - RESOURCE_SLUGS/RESOURCES are imported from data/resources.js (a
 *    plain module, no "use client"), never from ResourcesPage.js. That
 *    component is a client component, and pulling plain data back out
 *    of a "use client" file into server code (generateStaticParams,
 *    generateMetadata) hands you an opaque client reference instead of
 *    the real array/object — which is what caused
 *    "RESOURCE_SLUGS.map is not a function".
 *  - `params` is async in Next.js 15+/16 — it must be awaited before
 *    reading `slug` off it, or `slug` comes back `undefined` and every
 *    route falls through to notFound().
 */

export function generateStaticParams() {
  return RESOURCE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resource = RESOURCES[slug];
  if (!resource) return {};
  return {
    title: `${resource.name} · NovaAI`,
    description: resource.lede,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const resource = RESOURCES[slug];
  if (!resource) notFound();
  return <ResourcesPage slug={slug} />;
}