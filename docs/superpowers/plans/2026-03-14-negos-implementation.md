# Negos Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a negotiation & strategic realism knowledge base as an Obsidian vault with a Next.js web frontend.

**Architecture:** Obsidian vault (`vault/`) is the content source of truth with markdown files + YAML frontmatter for 9 authors, ~70 principles, and 17 concept pages. Next.js App Router reads the vault at build time, generates static pages, and serves a polished UI with search and comparison features. Deployed on Vercel free tier.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, gray-matter, unified/remark/rehype, Fuse.js, Vercel

**Spec:** `docs/superpowers/specs/2026-03-14-negos-design.md`

---

## Chunk 1: Project Scaffolding & Vault Infrastructure

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/styles/globals.css`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js with TypeScript and Tailwind**

```bash
cd /Users/yohannd/Projects/Negos
npx create-next-app@latest negos-app --typescript --tailwind --eslint --app --src-dir --use-npm
# Then move everything from negos-app/ into the project root:
mv negos-app/* negos-app/.* . 2>/dev/null; rmdir negos-app
```

This scaffolds into a temp directory then moves files into the project root (which already has `docs/`). Verify `tsconfig.json` has the `@/*` path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
If not present, add it manually.

- [ ] **Step 2: Install content parsing dependencies**

```bash
cd /Users/yohannd/Projects/Negos
npm install gray-matter unified remark-parse remark-rehype rehype-stringify rehype-slug fuse.js
npm install -D @types/node
```

- [ ] **Step 3: Verify the app runs**

```bash
cd /Users/yohannd/Projects/Negos
npm run dev
```

Expected: App starts on localhost:3000 with the default Next.js page.

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: initialize Next.js project with dependencies"
```

---

### Task 2: Create Obsidian Vault Structure

**Files:**
- Create: `vault/.obsidian/app.json` (minimal Obsidian config)
- Create: `vault/index.md`
- Create: `vault/authors/` (empty directory with .gitkeep)
- Create: `vault/concepts/` (empty directory with .gitkeep)
- Create: `vault/principles/` (empty directory with .gitkeep)

- [ ] **Step 1: Create vault directory structure**

```bash
mkdir -p vault/.obsidian vault/authors vault/concepts vault/principles
```

- [ ] **Step 2: Create minimal Obsidian config**

Create `vault/.obsidian/app.json`:
```json
{
  "strictLineBreaks": false,
  "showUnsupportedFiles": false,
  "alwaysUpdateLinks": true
}
```

- [ ] **Step 3: Create the Map of Content (index.md)**

Create `vault/index.md`:
```markdown
---
slug: index
name: "Negos Knowledge Base"
description: "Negotiation & Strategic Realism — Map of Content"
---

# Negos Knowledge Base

A comprehensive reference bridging realist statecraft with negotiation craft.

## Realist Strategists

- [[Morgenthau]] — The father of modern political realism
- [[Kennan]] — Architect of containment
- [[Spykman]] — Geographer of power
- [[Schelling]] — Game theorist of conflict
- [[Kissinger]] — Diplomat of realpolitik

## Negotiation Practitioners

- [[Fisher & Ury]] — Principled negotiation
- [[Voss]] — Tactical empathy and hostage negotiation
- [[Cialdini]] — Psychology of persuasion
- [[Zartman]] — Ripeness and multilateral negotiation

## Cross-Cutting Concepts

- [[Power Asymmetry]]
- [[Leverage]]
- [[Credible Commitment]]
- [[Strategic Patience]]
- [[Information Control]]
- [[Anchoring]]
- [[Coalition Building]]
- [[Face-Saving]]
- [[Escalation Dynamics]]
- [[BATNA & Alternatives]]
- [[Trust & Reciprocity]]
- [[Framing]]
- [[Cultural Context]]
- [[Timing & Ripeness]]
- [[Concession Strategy]]
- [[Balance of Power]]
- [[Deterrence]]
```

- [ ] **Step 4: Commit**

```bash
git add vault/
git commit -m "chore: create Obsidian vault structure with MOC"
```

---

### Task 3: TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Define all content types**

Create `src/lib/types.ts`:
```typescript
export type School = "realist" | "practitioner";

export type Relationship = "agrees" | "extends" | "contradicts" | "complements";

export interface CrossReference {
  author: string;
  relationship: Relationship;
  description: string;
}

export interface SourceWork {
  title: string;
  year: number;
  significance: string;
}

export interface AuthorFrontmatter {
  slug: string;
  name: string;
  era: string;
  oneLiner: string;
  school: School;
  coreFrameworkTitle: string;
  principles: string[];
  crossReferences: CrossReference[];
  sourceWorks: SourceWork[];
}

export interface Author extends AuthorFrontmatter {
  content: string;
  htmlContent: string;
}

export interface PrincipleFrontmatter {
  slug: string;
  author: string;
  number: number;
  title: string;
  relatedConcepts: string[];
}

export interface Principle extends PrincipleFrontmatter {
  content: string;
  htmlContent: string;
}

export interface ConceptFrontmatter {
  slug: string;
  name: string;
  description: string;
  authors: string[];
  tags: string[];
}

export interface Concept extends ConceptFrontmatter {
  content: string;
  htmlContent: string;
}

export interface SearchItem {
  type: "author" | "principle" | "concept";
  slug: string;
  name: string;
  description: string;
  tags?: string[];
  bodyPreview: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript types for vault content"
```

---

### Task 4: Vault Parser Library

**Files:**
- Create: `src/lib/vault.ts`

- [ ] **Step 1: Write tests for vault parser**

Create `src/lib/__tests__/vault.test.ts`:
```typescript
import { describe, it, expect, beforeAll } from "vitest";

// We'll test with actual vault files once they exist.
// For now, test the parsing utilities.
import {
  parseMarkdownFile,
  buildLinkMap,
  resolveWikiLinks,
} from "../vault";

describe("parseMarkdownFile", () => {
  it("extracts frontmatter and content from markdown string", () => {
    const raw = `---
slug: test
name: "Test Author"
era: "1900-2000"
---

## Bio

Some content here.`;

    const result = parseMarkdownFile(raw);
    expect(result.data.slug).toBe("test");
    expect(result.data.name).toBe("Test Author");
    expect(result.content).toContain("## Bio");
    expect(result.content).toContain("Some content here.");
  });
});

describe("resolveWikiLinks", () => {
  it("converts [[Name]] to markdown link", () => {
    const linkMap = new Map([
      ["morgenthau", { route: "/authors/morgenthau", displayName: "Morgenthau" }],
      ["leverage", { route: "/concepts/leverage", displayName: "Leverage" }],
    ]);

    const input = "See [[Morgenthau]] on [[Leverage]].";
    const result = resolveWikiLinks(input, linkMap);
    expect(result).toBe(
      "See [Morgenthau](/authors/morgenthau) on [Leverage](/concepts/leverage)."
    );
  });

  it("handles display text syntax [[slug|Display Text]]", () => {
    const linkMap = new Map([
      ["morgenthau", { route: "/authors/morgenthau", displayName: "Morgenthau" }],
    ]);

    const input = "See [[Morgenthau|Hans Morgenthau]].";
    const result = resolveWikiLinks(input, linkMap);
    expect(result).toBe("See [Hans Morgenthau](/authors/morgenthau).");
  });

  it("renders broken links as plain text", () => {
    const linkMap = new Map<string, { route: string; displayName: string }>();
    const input = "See [[NonExistent]].";
    const result = resolveWikiLinks(input, linkMap);
    expect(result).toBe("See NonExistent.");
  });
});
```

- [ ] **Step 2: Install vitest and run test to verify it fails**

```bash
cd /Users/yohannd/Projects/Negos
npm install -D vitest
npx vitest run src/lib/__tests__/vault.test.ts
```

Expected: FAIL — module `../vault` not found.

- [ ] **Step 3: Implement vault parser**

Create `src/lib/vault.ts`:
```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import type {
  Author,
  AuthorFrontmatter,
  Principle,
  PrincipleFrontmatter,
  Concept,
  ConceptFrontmatter,
  SearchItem,
} from "./types";

const VAULT_DIR = path.join(process.cwd(), "vault");

// --- Parsing Utilities ---

export function parseMarkdownFile(raw: string) {
  const { data, content } = matter(raw);
  return { data, content };
}

interface LinkTarget {
  route: string;
  displayName: string;
}

export function buildLinkMap(
  authors: AuthorFrontmatter[],
  concepts: ConceptFrontmatter[],
  principles: PrincipleFrontmatter[]
): Map<string, LinkTarget> {
  const map = new Map<string, LinkTarget>();

  for (const a of authors) {
    map.set(a.slug.toLowerCase(), {
      route: `/authors/${a.slug}`,
      displayName: a.name,
    });
    map.set(a.name.toLowerCase(), {
      route: `/authors/${a.slug}`,
      displayName: a.name,
    });
  }

  for (const c of concepts) {
    map.set(c.slug.toLowerCase(), {
      route: `/concepts/${c.slug}`,
      displayName: c.name,
    });
    map.set(c.name.toLowerCase(), {
      route: `/concepts/${c.slug}`,
      displayName: c.name,
    });
  }

  for (const p of principles) {
    map.set(p.slug.toLowerCase(), {
      route: `/principles/${p.slug}`,
      displayName: p.title,
    });
    map.set(p.title.toLowerCase(), {
      route: `/principles/${p.slug}`,
      displayName: p.title,
    });
  }

  return map;
}

export function resolveWikiLinks(
  content: string,
  linkMap: Map<string, LinkTarget>
): string {
  // Match [[target]] and [[target|display]]
  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target: string, display?: string) => {
      const key = target.trim().toLowerCase();
      const match = linkMap.get(key);

      if (!match) {
        console.warn(`[vault] Broken wiki-link: [[${target}]]`);
        return display?.trim() || target.trim();
      }

      const text = display?.trim() || match.displayName;
      return `[${text}](${match.route})`;
    }
  );
}

// --- Markdown to HTML ---

async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);

  return String(result);
}

// --- File Readers ---

function readDir(subdir: string): string[] {
  const dir = path.join(VAULT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));
}

function readAndParse<T>(filePath: string): { data: T; content: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Validate slug matches filename
  const filename = path.basename(filePath, ".md");
  if (data.slug && data.slug !== filename) {
    throw new Error(
      `Slug mismatch in ${filePath}: frontmatter slug "${data.slug}" !== filename "${filename}"`
    );
  }

  return { data: data as T, content };
}

// --- Public API ---

export async function getAllAuthors(): Promise<Author[]> {
  const files = readDir("authors");
  const allFrontmatter = {
    authors: files.map((f) => readAndParse<AuthorFrontmatter>(f).data),
    concepts: readDir("concepts").map(
      (f) => readAndParse<ConceptFrontmatter>(f).data
    ),
    principles: readDir("principles").map(
      (f) => readAndParse<PrincipleFrontmatter>(f).data
    ),
  };
  const linkMap = buildLinkMap(
    allFrontmatter.authors,
    allFrontmatter.concepts,
    allFrontmatter.principles
  );

  const authors: Author[] = [];
  for (const filePath of files) {
    const { data, content } = readAndParse<AuthorFrontmatter>(filePath);
    const resolved = resolveWikiLinks(content, linkMap);
    const htmlContent = await markdownToHtml(resolved);
    authors.push({ ...data, content, htmlContent });
  }
  return authors;
}

export async function getAuthorBySlug(
  slug: string
): Promise<Author | undefined> {
  const authors = await getAllAuthors();
  return authors.find((a) => a.slug === slug);
}

export async function getAllPrinciples(): Promise<Principle[]> {
  const files = readDir("principles");
  const allFrontmatter = {
    authors: readDir("authors").map(
      (f) => readAndParse<AuthorFrontmatter>(f).data
    ),
    concepts: readDir("concepts").map(
      (f) => readAndParse<ConceptFrontmatter>(f).data
    ),
    principles: files.map((f) => readAndParse<PrincipleFrontmatter>(f).data),
  };
  const linkMap = buildLinkMap(
    allFrontmatter.authors,
    allFrontmatter.concepts,
    allFrontmatter.principles
  );

  const principles: Principle[] = [];
  for (const filePath of files) {
    const { data, content } = readAndParse<PrincipleFrontmatter>(filePath);
    const resolved = resolveWikiLinks(content, linkMap);
    const htmlContent = await markdownToHtml(resolved);
    principles.push({ ...data, content, htmlContent });
  }
  return principles;
}

export async function getPrincipleBySlug(
  slug: string
): Promise<Principle | undefined> {
  const principles = await getAllPrinciples();
  return principles.find((p) => p.slug === slug);
}

export async function getAllConcepts(): Promise<Concept[]> {
  const files = readDir("concepts");
  const allFrontmatter = {
    authors: readDir("authors").map(
      (f) => readAndParse<AuthorFrontmatter>(f).data
    ),
    concepts: files.map((f) => readAndParse<ConceptFrontmatter>(f).data),
    principles: readDir("principles").map(
      (f) => readAndParse<PrincipleFrontmatter>(f).data
    ),
  };
  const linkMap = buildLinkMap(
    allFrontmatter.authors,
    allFrontmatter.concepts,
    allFrontmatter.principles
  );

  const concepts: Concept[] = [];
  for (const filePath of files) {
    const { data, content } = readAndParse<ConceptFrontmatter>(filePath);
    const resolved = resolveWikiLinks(content, linkMap);
    const htmlContent = await markdownToHtml(resolved);
    concepts.push({ ...data, content, htmlContent });
  }
  return concepts;
}

export async function getConceptBySlug(
  slug: string
): Promise<Concept | undefined> {
  const concepts = await getAllConcepts();
  return concepts.find((c) => c.slug === slug);
}

export function buildSearchIndex(
  authors: Author[],
  principles: Principle[],
  concepts: Concept[]
): SearchItem[] {
  const items: SearchItem[] = [];

  for (const a of authors) {
    items.push({
      type: "author",
      slug: a.slug,
      name: a.name,
      description: a.oneLiner,
      bodyPreview: a.content.slice(0, 500),
    });
  }

  for (const p of principles) {
    items.push({
      type: "principle",
      slug: p.slug,
      name: p.title,
      description: `${p.author} — Principle ${p.number}`,
      tags: p.relatedConcepts,
      bodyPreview: p.content.slice(0, 500),
    });
  }

  for (const c of concepts) {
    items.push({
      type: "concept",
      slug: c.slug,
      name: c.name,
      description: c.description,
      tags: c.tags,
      bodyPreview: c.content.slice(0, 500),
    });
  }

  return items;
}

// --- Compare Page Helpers ---

/**
 * Extracts per-author sections from concept markdown content.
 * Concept files use "### [[AuthorName]] — Section Title" headings under "## By Author".
 * This function splits those into separate HTML fragments keyed by (conceptSlug, authorSlug).
 */
export async function extractAuthorSections(
  concepts: Concept[],
  authors: Author[]
): Promise<{ conceptSlug: string; authorSlug: string; htmlContent: string }[]> {
  const results: { conceptSlug: string; authorSlug: string; htmlContent: string }[] = [];

  for (const concept of concepts) {
    // Split raw markdown content by h3 headings (### ...)
    const sections = concept.content.split(/(?=^### )/m);

    for (const section of sections) {
      if (!section.startsWith("### ")) continue;

      // Find which author this section belongs to
      const headingLine = section.split("\n")[0];
      const matchedAuthor = authors.find(
        (a) =>
          headingLine.toLowerCase().includes(a.name.toLowerCase()) ||
          headingLine.toLowerCase().includes(a.slug.toLowerCase())
      );

      if (matchedAuthor) {
        const sectionContent = section.replace(/^### .*\n/, "").trim();
        const htmlContent = await markdownToHtml(sectionContent);
        results.push({
          conceptSlug: concept.slug,
          authorSlug: matchedAuthor.slug,
          htmlContent,
        });
      }
    }
  }

  return results;
}
```

- [ ] **Step 4: Add vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/vault.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ vitest.config.ts
git commit -m "feat: add vault parser with wiki-link resolution and search index builder"
```

---

### Task 5: Search Library

**Files:**
- Create: `src/lib/search.ts`

- [ ] **Step 1: Create search module**

Create `src/lib/search.ts`:
```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/search.ts
git commit -m "feat: add Fuse.js search with grouped results"
```

---

## Chunk 2: Web App Pages & Components

### Task 6: Global Layout & Styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Set up global layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Negos — Negotiation & Strategic Realism",
  description:
    "A knowledge base bridging realist statecraft with negotiation craft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <header className="border-b border-gray-200">
          <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold tracking-tight">
              Negos
            </a>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/" className="hover:text-gray-900">
                Home
              </a>
              <a href="/compare" className="hover:text-gray-900">
                Compare
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Set up global styles**

Replace `src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply leading-relaxed;
  }

  /* Prose-like styling for rendered markdown */
  .prose h2 {
    @apply text-2xl font-semibold mt-10 mb-4 text-gray-900;
  }

  .prose h3 {
    @apply text-xl font-semibold mt-8 mb-3 text-gray-800;
  }

  .prose h4 {
    @apply text-lg font-medium mt-6 mb-2 text-gray-800;
  }

  .prose p {
    @apply mb-4 text-gray-700 text-lg leading-relaxed;
  }

  .prose ul {
    @apply list-disc pl-6 mb-4 space-y-1;
  }

  .prose ol {
    @apply list-decimal pl-6 mb-4 space-y-1;
  }

  .prose li {
    @apply text-gray-700 text-lg;
  }

  .prose a {
    @apply text-blue-700 underline decoration-blue-300 hover:decoration-blue-700 transition-colors;
  }

  .prose strong {
    @apply font-semibold text-gray-900;
  }

  .prose em {
    @apply italic;
  }

  .prose blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4;
  }
}
```

- [ ] **Step 3: Verify the app runs with new layout**

```bash
npm run dev
```

Expected: App shows "Negos" header with Home/Compare nav.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/styles/globals.css
git commit -m "feat: add global layout with nav and prose styles"
```

---

### Task 7: Author Card Component

**Files:**
- Create: `src/components/AuthorCard.tsx`

- [ ] **Step 1: Create AuthorCard component**

Create `src/components/AuthorCard.tsx`:
```tsx
import type { AuthorFrontmatter } from "@/lib/types";

interface AuthorCardProps {
  author: AuthorFrontmatter;
}

const schoolColors = {
  realist: "border-l-amber-500",
  practitioner: "border-l-blue-500",
};

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <a
      href={`/authors/${author.slug}`}
      className={`block border border-gray-200 border-l-4 ${schoolColors[author.school]} rounded-lg p-5 hover:shadow-md transition-shadow`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{author.era}</p>
      <p className="text-gray-600 mt-2">{author.oneLiner}</p>
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuthorCard.tsx
git commit -m "feat: add AuthorCard component"
```

---

### Task 8: Search Bar Component

**Files:**
- Create: `src/components/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar component**

Create `src/components/SearchBar.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SearchBar.tsx
git commit -m "feat: add SearchBar component with fuzzy search"
```

---

### Task 9: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar component**

Create `src/components/Sidebar.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";

export interface SidebarSection {
  id: string;
  label: string;
}

interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                  activeId === s.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile dropdown */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeId}
          onChange={(e) => {
            const el = document.getElementById(e.target.value);
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add Sidebar component with scroll tracking"
```

---

### Task 10: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the landing page**

Replace `src/app/page.tsx`:
```tsx
import { getAllAuthors, getAllPrinciples, getAllConcepts, buildSearchIndex } from "@/lib/vault";
import { AuthorCard } from "@/components/AuthorCard";
import { SearchBar } from "@/components/SearchBar";

export default async function HomePage() {
  const [authors, principles, concepts] = await Promise.all([
    getAllAuthors(),
    getAllPrinciples(),
    getAllConcepts(),
  ]);

  const searchItems = buildSearchIndex(authors, principles, concepts);

  const realists = authors.filter((a) => a.school === "realist");
  const practitioners = authors.filter((a) => a.school === "practitioner");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Negos
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Negotiation & Strategic Realism Knowledge Base
        </p>
        <SearchBar items={searchItems} />
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          Realist Strategists
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {realists.map((author) => (
            <AuthorCard key={author.slug} author={author} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          Negotiation Practitioners
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {practitioners.map((author) => (
            <AuthorCard key={author.slug} author={author} />
          ))}
        </div>
      </section>

      {concepts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Cross-Cutting Concepts
          </h2>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c) => (
              <a
                key={c.slug}
                href={`/concepts/${c.slug}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {c.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with author grid and search"
```

---

### Task 11: Author Page

**Files:**
- Create: `src/app/authors/[slug]/page.tsx`

- [ ] **Step 1: Create author page**

Create `src/app/authors/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getAllAuthors, getAllPrinciples } from "@/lib/vault";
import { Sidebar } from "@/components/Sidebar";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const authors = await getAllAuthors();
  const author = authors.find((a) => a.slug === slug);
  if (!author) return { title: "Not Found" };
  return {
    title: `${author.name} — Negos`,
    description: author.oneLiner,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const [allAuthors, allPrinciples] = await Promise.all([
    getAllAuthors(),
    getAllPrinciples(),
  ]);
  const author = allAuthors.find((a) => a.slug === slug);
  if (!author) notFound();
  const authors = allAuthors;

  const authorPrinciples = allPrinciples.filter((p) => p.author === slug);

  const schoolColor =
    author.school === "realist" ? "bg-amber-500" : "bg-blue-500";

  const sidebarSections = [
    { id: "overview", label: "Overview" },
    { id: "core-framework", label: "Core Framework" },
    { id: "key-principles", label: "Key Principles" },
    { id: "cross-references", label: "Cross-References" },
    { id: "source-works", label: "Source Works" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 flex gap-8">
      <Sidebar sections={sidebarSections} />

      <article className="min-w-0 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-3 h-3 rounded-full ${schoolColor}`} />
            <span className="text-sm text-gray-500 uppercase tracking-wider">
              {author.school === "realist"
                ? "Realist Strategist"
                : "Negotiation Practitioner"}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{author.name}</h1>
          <p className="text-lg text-gray-500 mt-1">{author.era}</p>
          <p className="text-xl text-gray-600 mt-3">{author.oneLiner}</p>
        </div>

        <div
          id="overview"
          className="prose"
          dangerouslySetInnerHTML={{ __html: author.htmlContent }}
        />

        {authorPrinciples.length > 0 && (
          <section id="key-principles" className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Key Principles
            </h2>
            <div className="space-y-6">
              {authorPrinciples.map((p) => (
                <a
                  key={p.slug}
                  href={`/principles/${p.slug}`}
                  className="block border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-mono text-gray-400">
                      {String(p.number).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {p.title}
                    </h3>
                  </div>
                  {p.relatedConcepts.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {p.relatedConcepts.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {c.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {author.crossReferences.length > 0 && (
          <section id="cross-references" className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Cross-References
            </h2>
            <div className="space-y-4">
              {author.crossReferences.map((ref) => (
                <div key={ref.author} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/authors/${ref.author}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {authors.find((a) => a.slug === ref.author)?.name || ref.author}
                    </a>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ref.relationship === "contradicts"
                          ? "bg-red-100 text-red-700"
                          : ref.relationship === "complements"
                            ? "bg-green-100 text-green-700"
                            : ref.relationship === "extends"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ref.relationship}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{ref.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {author.sourceWorks.length > 0 && (
          <section id="source-works" className="mt-12 mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Source Works
            </h2>
            <div className="space-y-4">
              {author.sourceWorks.map((work) => (
                <div key={work.title} className="flex gap-4">
                  <span className="text-sm font-mono text-gray-400 mt-1 shrink-0">
                    {work.year}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 italic">
                      {work.title}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {work.significance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/authors/
git commit -m "feat: add author detail page with sidebar and principles"
```

---

### Task 12: Concept Page

**Files:**
- Create: `src/app/concepts/[slug]/page.tsx`

- [ ] **Step 1: Create concept page**

Create `src/app/concepts/[slug]/page.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/concepts/
git commit -m "feat: add concept detail page"
```

---

### Task 13: Principle Page

**Files:**
- Create: `src/app/principles/[slug]/page.tsx`

- [ ] **Step 1: Create principle page**

Create `src/app/principles/[slug]/page.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/principles/
git commit -m "feat: add principle detail page"
```

---

### Task 14: Compare Page

**Files:**
- Create: `src/components/CompareView.tsx`
- Create: `src/app/compare/page.tsx`

- [ ] **Step 1: Create CompareView component**

Create `src/components/CompareView.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { AuthorFrontmatter, Concept } from "@/lib/types";

// Pre-processed author sections extracted from concept markdown at build time
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
          Select 2-3 authors to compare (
          {selected.length}/3 selected)
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
```

- [ ] **Step 2: Create compare page**

Create `src/app/compare/page.tsx`:
```tsx
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

  // Extract per-author sections from each concept's markdown content at build time.
  // Concept markdown uses "### [[AuthorName]] — Section Title" headings under "## By Author".
  // extractAuthorSections splits these into separate HTML fragments for each author.
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CompareView.tsx src/app/compare/
git commit -m "feat: add compare page with author selection and concept grid"
```

---

### Task 15: Build Verification

- [ ] **Step 1: Run the build with empty vault**

```bash
cd /Users/yohannd/Projects/Negos
npm run build
```

Expected: Build succeeds with no authors/concepts/principles (all pages render with empty states). This verifies the build pipeline handles empty vault directories gracefully.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: verify build pipeline works with empty vault"
```

---

## Chunk 3: Content — Realist Strategists

> **Note for implementing agent:** Each author file must be deeply written with intellectual rigour. Target: 1000-2000 words per author, 300-600 words per principle. Research each author's actual frameworks and ideas. Do not produce superficial summaries. Cross-references and principle slugs will be filled in as content is created. Use web search to verify facts, dates, and framework details.

### Task 16: Hans Morgenthau

**Files:**
- Create: `vault/authors/morgenthau.md`
- Create: `vault/principles/morgenthau-01-interest-as-power.md`
- Create: `vault/principles/morgenthau-02-autonomy-of-politics.md`
- Create: `vault/principles/morgenthau-03-universal-interest.md`
- Create: `vault/principles/morgenthau-04-tension-of-morality.md`
- Create: `vault/principles/morgenthau-05-no-nations-moral-laws.md`
- Create: `vault/principles/morgenthau-06-subordination-of-standards.md`
- Create: `vault/principles/morgenthau-07-balance-of-power-imperative.md`
- Create: `vault/principles/morgenthau-08-prudence-as-virtue.md`

- [ ] **Step 1: Research and write the full Morgenthau author page**

Write `vault/authors/morgenthau.md` following the Author Note Format in the spec. Cover:
- Biographical context: German-Jewish emigre, fled Nazi Germany, University of Chicago, reaction to Wilsonian idealism
- Core Framework: The Six Principles of Political Realism from *Politics Among Nations*
- Key Concepts with negotiation applications: interest defined as power, autonomy of the political sphere, universal concept of interest, tension between moral command and political requirements, no identification of moral aspirations with moral laws of the universe, subordination of political standards
- Cross-references to other authors
- Source works

- [ ] **Step 2: Write all Morgenthau principle files**

Create each principle file following the Principle Note Format. Each principle should have 300-600 words explaining the principle and its negotiation application.

- [ ] **Step 3: Commit**

```bash
git add vault/authors/morgenthau.md vault/principles/morgenthau-*
git commit -m "content: add Hans Morgenthau — political realism framework"
```

---

### Task 17: George Kennan

**Files:**
- Create: `vault/authors/kennan.md`
- Create: `vault/principles/kennan-01-patient-containment.md`
- Create: `vault/principles/kennan-02-diplomatic-over-military.md`
- Create: `vault/principles/kennan-03-strategic-patience.md`
- Create: `vault/principles/kennan-04-know-your-adversary.md`
- Create: `vault/principles/kennan-05-limited-objectives.md`
- Create: `vault/principles/kennan-06-strength-through-restraint.md`
- Create: `vault/principles/kennan-07-long-term-perspective.md`

- [ ] **Step 1: Research and write the full Kennan author page**

Cover: The Long Telegram, X Article, containment doctrine, distinction between vital and peripheral interests, diplomatic vs. military instruments, policy of firmness and patience. Cross-references to Morgenthau, Kissinger, Schelling.

- [ ] **Step 2: Write all Kennan principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/kennan.md vault/principles/kennan-*
git commit -m "content: add George Kennan — containment and strategic patience"
```

---

### Task 18: Nicholas Spykman

**Files:**
- Create: `vault/authors/spykman.md`
- Create: `vault/principles/spykman-01-rimland-positioning.md`
- Create: `vault/principles/spykman-02-geography-as-leverage.md`
- Create: `vault/principles/spykman-03-power-is-relative.md`
- Create: `vault/principles/spykman-04-buffer-zone-strategy.md`
- Create: `vault/principles/spykman-05-positional-advantage.md`
- Create: `vault/principles/spykman-06-control-the-periphery.md`

- [ ] **Step 1: Research and write the full Spykman author page**

Cover: Rimland theory vs. Mackinder's Heartland, *America's Strategy in World Politics*, geography as power determinant, positional strategy, control of margins. Cross-references to Morgenthau, Kennan, Kissinger.

- [ ] **Step 2: Write all Spykman principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/spykman.md vault/principles/spykman-*
git commit -m "content: add Nicholas Spykman — rimland theory and positional strategy"
```

---

### Task 19: Thomas Schelling

**Files:**
- Create: `vault/authors/schelling.md`
- Create: `vault/principles/schelling-01-credible-commitment.md`
- Create: `vault/principles/schelling-02-focal-points.md`
- Create: `vault/principles/schelling-03-brinkmanship.md`
- Create: `vault/principles/schelling-04-strategic-moves.md`
- Create: `vault/principles/schelling-05-tacit-bargaining.md`
- Create: `vault/principles/schelling-06-decomposition.md`
- Create: `vault/principles/schelling-07-threat-credibility.md`
- Create: `vault/principles/schelling-08-binding-oneself.md`
- Create: `vault/principles/schelling-09-interdependent-decisions.md`

- [ ] **Step 1: Research and write the full Schelling author page**

Cover: *The Strategy of Conflict*, focal points (Schelling points), credible commitments, brinkmanship, game theory applied to real conflict, Nobel Prize work, tactical vs. strategic moves. Cross-references to Morgenthau, Voss, Fisher & Ury, Kissinger.

- [ ] **Step 2: Write all Schelling principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/schelling.md vault/principles/schelling-*
git commit -m "content: add Thomas Schelling — game theory and strategic conflict"
```

---

### Task 20: Henry Kissinger

**Files:**
- Create: `vault/authors/kissinger.md`
- Create: `vault/principles/kissinger-01-realpolitik.md`
- Create: `vault/principles/kissinger-02-linkage-diplomacy.md`
- Create: `vault/principles/kissinger-03-triangular-diplomacy.md`
- Create: `vault/principles/kissinger-04-legitimacy-and-order.md`
- Create: `vault/principles/kissinger-05-constructive-ambiguity.md`
- Create: `vault/principles/kissinger-06-shuttle-diplomacy.md`
- Create: `vault/principles/kissinger-07-balance-of-power.md`
- Create: `vault/principles/kissinger-08-personal-relationships.md`
- Create: `vault/principles/kissinger-09-strategic-patience.md`

- [ ] **Step 1: Research and write the full Kissinger author page**

Cover: *Diplomacy*, *World Order*, *A World Restored*, realpolitik, linkage strategy, triangular diplomacy (US-China-USSR), constructive ambiguity, shuttle diplomacy in Middle East, Westphalian order. Cross-references to all other authors — Kissinger bridges both schools.

- [ ] **Step 2: Write all Kissinger principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/kissinger.md vault/principles/kissinger-*
git commit -m "content: add Henry Kissinger — realpolitik and diplomatic strategy"
```

---

## Chunk 4: Content — Negotiation Practitioners

### Task 21: Roger Fisher & William Ury

**Files:**
- Create: `vault/authors/fisher-ury.md`
- Create: `vault/principles/fisher-ury-01-separate-people-from-problems.md`
- Create: `vault/principles/fisher-ury-02-focus-on-interests.md`
- Create: `vault/principles/fisher-ury-03-invent-options.md`
- Create: `vault/principles/fisher-ury-04-objective-criteria.md`
- Create: `vault/principles/fisher-ury-05-batna.md`
- Create: `vault/principles/fisher-ury-06-negotiation-jujitsu.md`
- Create: `vault/principles/fisher-ury-07-one-text-procedure.md`

- [ ] **Step 1: Research and write the full Fisher & Ury author page**

Cover: Harvard Negotiation Project, *Getting to Yes*, principled negotiation vs. positional bargaining, the four pillars, BATNA concept, negotiation jujitsu, one-text procedure. Cross-references to Morgenthau (contradicts), Voss (extends), Schelling (complements).

- [ ] **Step 2: Write all Fisher & Ury principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/fisher-ury.md vault/principles/fisher-ury-*
git commit -m "content: add Fisher & Ury — principled negotiation"
```

---

### Task 22: Chris Voss

**Files:**
- Create: `vault/authors/voss.md`
- Create: `vault/principles/voss-01-tactical-empathy.md`
- Create: `vault/principles/voss-02-mirroring.md`
- Create: `vault/principles/voss-03-labeling.md`
- Create: `vault/principles/voss-04-calibrated-questions.md`
- Create: `vault/principles/voss-05-accusation-audit.md`
- Create: `vault/principles/voss-06-no-deal-is-better.md`
- Create: `vault/principles/voss-07-thats-right.md`
- Create: `vault/principles/voss-08-black-swans.md`
- Create: `vault/principles/voss-09-ackerman-model.md`

- [ ] **Step 1: Research and write the full Voss author page**

Cover: FBI hostage negotiation background, *Never Split the Difference*, tactical empathy, mirroring, labeling, calibrated questions ("how" and "what"), accusation audit, "That's right" vs. "You're right", Black Swan theory, Ackerman model. Cross-references to Fisher & Ury (challenges), Cialdini (complements), Schelling (extends).

- [ ] **Step 2: Write all Voss principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/voss.md vault/principles/voss-*
git commit -m "content: add Chris Voss — tactical empathy and hostage negotiation"
```

---

### Task 23: Robert Cialdini

**Files:**
- Create: `vault/authors/cialdini.md`
- Create: `vault/principles/cialdini-01-reciprocity.md`
- Create: `vault/principles/cialdini-02-commitment-consistency.md`
- Create: `vault/principles/cialdini-03-social-proof.md`
- Create: `vault/principles/cialdini-04-authority.md`
- Create: `vault/principles/cialdini-05-liking.md`
- Create: `vault/principles/cialdini-06-scarcity.md`
- Create: `vault/principles/cialdini-07-unity.md`

- [ ] **Step 1: Research and write the full Cialdini author page**

Cover: *Influence*, *Pre-Suasion*, the six (later seven with unity) principles of persuasion, experimental psychology foundation, ethical vs. manipulative use, pre-suasion and attention framing. Cross-references to Voss (complements), Schelling (complements on commitment), Fisher & Ury (extends).

- [ ] **Step 2: Write all Cialdini principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/cialdini.md vault/principles/cialdini-*
git commit -m "content: add Robert Cialdini — persuasion psychology"
```

---

### Task 24: I. William Zartman

**Files:**
- Create: `vault/authors/zartman.md`
- Create: `vault/principles/zartman-01-ripeness-theory.md`
- Create: `vault/principles/zartman-02-mutually-hurting-stalemate.md`
- Create: `vault/principles/zartman-03-formula-detail.md`
- Create: `vault/principles/zartman-04-way-out.md`
- Create: `vault/principles/zartman-05-multilateral-complexity.md`
- Create: `vault/principles/zartman-06-pre-negotiation.md`

- [ ] **Step 1: Research and write the full Zartman author page**

Cover: SAIS/Johns Hopkins, ripeness theory, mutually hurting stalemate, enticing opportunity, formula-detail approach, pre-negotiation phase, multilateral negotiation complexity. Cross-references to Kennan (complements on timing), Schelling (extends), Kissinger (complements on diplomatic timing).

- [ ] **Step 2: Write all Zartman principle files**

- [ ] **Step 3: Commit**

```bash
git add vault/authors/zartman.md vault/principles/zartman-*
git commit -m "content: add I. William Zartman — ripeness theory and multilateral negotiation"
```

---

## Chunk 5: Content — Cross-Cutting Concepts

### Task 25: Write All 17 Concept Pages

**Files:**
- Create: `vault/concepts/power-asymmetry.md`
- Create: `vault/concepts/leverage.md`
- Create: `vault/concepts/credible-commitment.md`
- Create: `vault/concepts/strategic-patience.md`
- Create: `vault/concepts/information-control.md`
- Create: `vault/concepts/anchoring.md`
- Create: `vault/concepts/coalition-building.md`
- Create: `vault/concepts/face-saving.md`
- Create: `vault/concepts/escalation-dynamics.md`
- Create: `vault/concepts/batna-and-alternatives.md`
- Create: `vault/concepts/trust-and-reciprocity.md`
- Create: `vault/concepts/framing.md`
- Create: `vault/concepts/cultural-context.md`
- Create: `vault/concepts/timing-and-ripeness.md`
- Create: `vault/concepts/concession-strategy.md`
- Create: `vault/concepts/balance-of-power.md`
- Create: `vault/concepts/deterrence.md`

- [ ] **Step 1: Write concept pages in batches of 4-5**

Follow the Concept Note Format from the spec. For each concept:
- Overview: what this concept means across the literature
- By Author: each relevant author's perspective (200-400 words each)
- Tensions & Convergences: where authors agree, disagree, or extend each other

Batch 1: power-asymmetry, leverage, credible-commitment, strategic-patience
Batch 2: information-control, anchoring, coalition-building, face-saving
Batch 3: escalation-dynamics, batna-and-alternatives, trust-and-reciprocity, framing
Batch 4: cultural-context, timing-and-ripeness, concession-strategy, balance-of-power, deterrence

- [ ] **Step 2: Commit after each batch**

```bash
git add vault/concepts/
git commit -m "content: add cross-cutting concept pages (batch N/4)"
```

- [ ] **Step 3: Verify all internal links resolve**

```bash
npm run build
```

Expected: Build succeeds with no broken wiki-link warnings.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "content: complete all 17 cross-cutting concept pages"
```

---

## Chunk 6: Final Integration & Polish

### Task 26: Update MOC Index

**Files:**
- Modify: `vault/index.md`

- [ ] **Step 1: Update the Map of Content with all actual links**

Verify `vault/index.md` has correct wiki-links for all authors and concepts that now exist.

- [ ] **Step 2: Commit**

```bash
git add vault/index.md
git commit -m "chore: update MOC with all author and concept links"
```

---

### Task 27: Full Build & Smoke Test

- [ ] **Step 1: Run full build**

```bash
cd /Users/yohannd/Projects/Negos
npm run build
```

Expected: Build succeeds, all static pages generated.

- [ ] **Step 2: Run dev server and verify pages**

```bash
npm run dev
```

Verify:
- Landing page shows all 9 authors with cards, search works
- Each author page loads with sidebar, principles, cross-references, source works
- Concept pages load with author sections
- Principle pages load with related concepts
- Compare page lets you select authors and shows shared concepts
- Search returns results grouped by type
- Mobile responsive (resize browser)

- [ ] **Step 3: Fix any build or rendering issues**

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build and rendering issues"
```

---

### Task 28: Deploy to Vercel

- [ ] **Step 1: Confirm user wants to deploy**

Ask: "Ready to deploy to Vercel? This will make the app publicly accessible on a `.vercel.app` domain."

- [ ] **Step 2: Deploy**

```bash
cd /Users/yohannd/Projects/Negos
npx vercel --yes
```

- [ ] **Step 3: Verify deployment**

Open the provided URL and verify the app works.

- [ ] **Step 4: Commit Vercel config if generated**

```bash
git add -A
git commit -m "chore: add Vercel deployment config"
```
