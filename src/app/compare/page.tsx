import { getAllAuthors, getAllConcepts, extractAuthorSections } from "@/lib/vault";
import { CompareView } from "@/components/CompareView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Authors — Negos",
  description: "Compare negotiation frameworks across authors",
};

export default async function ComparePage() {
  const [authors, concepts] = await Promise.all([
    getAllAuthors(),
    getAllConcepts(),
  ]);

  const authorSections = await extractAuthorSections(concepts, authors);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Compare Authors
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        See how different thinkers approach the same negotiation concepts.
      </p>

      <CompareView authors={authors} concepts={concepts} authorSections={authorSections} />
    </div>
  );
}
