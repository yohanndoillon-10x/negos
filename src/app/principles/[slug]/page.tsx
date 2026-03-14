import { notFound } from "next/navigation";
import { getAllPrinciples, getPrincipleBySlug } from "@/lib/vault";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const principles = await getAllPrinciples();
  return principles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const principle = await getPrincipleBySlug(slug);
  if (!principle) return { title: "Not Found" };
  return {
    title: `${principle.title} — Negos`,
    description: `${principle.author} — Principle ${principle.number}`,
  };
}

export default async function PrinciplePage({ params }: Props) {
  const { slug } = await params;
  const principle = await getPrincipleBySlug(slug);
  if (!principle) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <a
          href={`/authors/${principle.author}`}
          className="text-sm text-blue-700 hover:underline uppercase tracking-wider"
        >
          {principle.author.replace(/-/g, " ")}
        </a>
        <h1 className="text-4xl font-bold text-gray-900 mt-2">
          <span className="text-gray-400 font-mono mr-3">
            {String(principle.number).padStart(2, "0")}
          </span>
          {principle.title}
        </h1>
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: principle.htmlContent }}
      />

      {principle.relatedConcepts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Related Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {principle.relatedConcepts.map((c) => (
              <a
                key={c}
                href={`/concepts/${c}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {c.replace(/-/g, " ")}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
