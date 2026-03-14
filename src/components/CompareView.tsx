"use client";

import { useState } from "react";
import type { AuthorFrontmatter, Concept } from "@/lib/types";

interface ConceptAuthorSection {
  conceptSlug: string;
  authorSlug: string;
  htmlContent: string;
}

interface CompareViewProps {
  authors: AuthorFrontmatter[];
  concepts: Concept[];
  authorSections: ConceptAuthorSection[];
}

export function CompareView({ authors, concepts, authorSections }: CompareViewProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleAuthor = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 3
          ? [...prev, slug]
          : prev
    );
  };

  const relevantConcepts = concepts.filter((c) => {
    const overlap = c.authors.filter((a) => selected.includes(a));
    return overlap.length >= 2;
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-3">
          Select 2-3 authors to compare ({selected.length}/3 selected)
        </p>
        <div className="flex flex-wrap gap-2">
          {authors.map((a) => (
            <button
              key={a.slug}
              onClick={() => toggleAuthor(a.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected.includes(a.slug)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {selected.length >= 2 && (
        <div className="space-y-8">
          {relevantConcepts.length === 0 && (
            <p className="text-gray-500">
              No shared concepts found for these authors.
            </p>
          )}

          {relevantConcepts.map((concept) => (
            <div
              key={concept.slug}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <a
                  href={`/concepts/${concept.slug}`}
                  className="font-semibold text-gray-900 hover:text-blue-700"
                >
                  {concept.name}
                </a>
                <p className="text-sm text-gray-500 mt-1">
                  {concept.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-x divide-gray-200">
                {selected
                  .filter((s) => concept.authors.includes(s))
                  .map((authorSlug) => {
                    const author = authors.find((a) => a.slug === authorSlug);
                    const section = authorSections.find(
                      (s) => s.conceptSlug === concept.slug && s.authorSlug === authorSlug
                    );
                    return (
                      <div key={authorSlug} className="p-5">
                        <a
                          href={`/authors/${authorSlug}`}
                          className="text-sm font-medium text-blue-700 hover:underline"
                        >
                          {author?.name || authorSlug}
                        </a>
                        {section ? (
                          <div
                            className="prose prose-sm mt-2"
                            dangerouslySetInnerHTML={{ __html: section.htmlContent }}
                          />
                        ) : (
                          <p className="text-gray-400 text-sm mt-2 italic">
                            No section available.
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
