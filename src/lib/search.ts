import Fuse from "fuse.js";
import type { SearchItem } from "./types";

const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
  threshold: 0.3,
  keys: [
    { name: "name", weight: 2.0 },
    { name: "description", weight: 1.5 },
    { name: "tags", weight: 1.0 },
    { name: "bodyPreview", weight: 0.5 },
  ],
};

export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  return new Fuse(items, fuseOptions);
}

export interface GroupedResults {
  authors: SearchItem[];
  principles: SearchItem[];
  concepts: SearchItem[];
}

export function searchAndGroup(
  fuse: Fuse<SearchItem>,
  query: string,
  limit: number = 5
): GroupedResults {
  const results = fuse.search(query);
  const items = results.map((r) => r.item);

  return {
    authors: items.filter((i) => i.type === "author").slice(0, limit),
    principles: items.filter((i) => i.type === "principle").slice(0, limit),
    concepts: items.filter((i) => i.type === "concept").slice(0, limit),
  };
}
