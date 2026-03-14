"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import type { SearchItem } from "@/lib/types";
import { searchAndGroup, createSearchIndex } from "@/lib/search";

interface SearchBarProps {
  items: SearchItem[];
}

const typeLabels = {
  author: "Authors",
  principle: "Principles",
  concept: "Concepts",
};

const typeRoutes = {
  author: "/authors",
  principle: "/principles",
  concept: "/concepts",
};

export function SearchBar({ items }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const fuse = useMemo(() => createSearchIndex(items), [items]);

  const results = query.length >= 2 ? searchAndGroup(fuse, query) : null;
  const hasResults =
    results &&
    (results.authors.length > 0 ||
      results.principles.length > 0 ||
      results.concepts.length > 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search authors, principles, concepts..."
        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {!hasResults && (
            <p className="px-4 py-3 text-gray-500">No results found.</p>
          )}

          {results &&
            (["authors", "principles", "concepts"] as const).map((group) => {
              const groupItems = results[group];
              if (groupItems.length === 0) return null;

              return (
                <div key={group} className="border-b border-gray-100 last:border-b-0">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                    {typeLabels[groupItems[0].type]}
                  </p>
                  {groupItems.map((item) => (
                    <a
                      key={item.slug}
                      href={`${typeRoutes[item.type]}/${item.slug}`}
                      className="block px-4 py-2 hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.description}
                      </span>
                    </a>
                  ))}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
