import { notFound } from "next/navigation";
import { getAllConcepts, getConceptBySlug } from "@/lib/vault";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const concepts = await getAllConcepts();
  return concepts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) return { title: "Not Found" };
  return {
    title: `${concept.name} — Negos`,
    description: concept.description,
  };
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
          Concept
        </p>
        <h1 className="text-4xl font-bold text-gray-900">{concept.name}</h1>
        <p className="text-lg text-gray-600 mt-3">{concept.description}</p>
        {concept.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {concept.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: concept.htmlContent }}
      />

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Authors covering this concept:{" "}
          {concept.authors.map((a, i) => (
            <span key={a}>
              {i > 0 && ", "}
              <a
                href={`/authors/${a}`}
                className="text-blue-700 hover:underline"
              >
                {a.replace(/-/g, " ")}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
