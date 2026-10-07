import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductPage from "@/components/ProductPage";

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products[slug];
  if (!product) return {};
  return {
    title: `${product.name} — NovaAI`,
    description: product.subtext,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  if (!products[slug]) notFound();

  // pass only the slug: the product object contains icon components,
  // which can't be sent from a server component to a client component
  return <ProductPage slug={slug} />;
}