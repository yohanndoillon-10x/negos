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

  // Aliases for common informal wikilinks that don't match exact slugs/names
  const aliases: Record<string, { type: string; slug: string }> = {
    "accusation audit": { type: "principles", slug: "voss-05-accusation-audit" },
    "batna": { type: "concepts", slug: "batna-and-alternatives" },
    "calibrated question": { type: "principles", slug: "voss-04-calibrated-questions" },
    "commitment and consistency": { type: "principles", slug: "cialdini-02-commitment-consistency" },
    "commitment": { type: "concepts", slug: "credible-commitment" },
    "containment": { type: "principles", slug: "kennan-01-patient-containment" },
    "contrast": { type: "authors", slug: "cialdini" },
    "firm but patient containment": { type: "principles", slug: "kennan-01-patient-containment" },
    "fisher & ury": { type: "authors", slug: "fisher-ury" },
    "formula-detail approach": { type: "principles", slug: "zartman-04-formula-detail" },
    "formula": { type: "principles", slug: "zartman-04-formula-detail" },
    "inventing options for mutual gain": { type: "principles", slug: "fisher-ury-03-invent-options" },
    "label": { type: "principles", slug: "voss-03-labeling" },
    "mirror": { type: "principles", slug: "voss-02-mirroring" },
    "power": { type: "concepts", slug: "power-asymmetry" },
    "pre-suasion": { type: "authors", slug: "cialdini" },
    "principled negotiation": { type: "authors", slug: "fisher-ury" },
    "reframing positions as interests": { type: "principles", slug: "fisher-ury-02-focus-on-interests" },
    "rimland theory": { type: "principles", slug: "spykman-01-rimland-positioning" },
    "ripeness": { type: "concepts", slug: "timing-and-ripeness" },
  };

  for (const [alias, target] of Object.entries(aliases)) {
    if (!map.has(alias)) {
      const route = `/${target.type}/${target.slug}`;
      const existing = [...map.values()].find((v) => v.route === route);
      map.set(alias, {
        route,
        displayName: existing?.displayName || target.slug,
      });
    }
  }

  return map;
}

export function resolveWikiLinks(
  content: string,
  linkMap: Map<string, LinkTarget>
): string {
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

async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);

  return String(result);
}

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

  const filename = path.basename(filePath, ".md");
  if (data.slug && data.slug !== filename) {
    throw new Error(
      `Slug mismatch in ${filePath}: frontmatter slug "${data.slug}" !== filename "${filename}"`
    );
  }

  return { data: data as T, content };
}

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

export async function extractAuthorSections(
  concepts: Concept[],
  authors: Author[]
): Promise<{ conceptSlug: string; authorSlug: string; htmlContent: string }[]> {
  const results: { conceptSlug: string; authorSlug: string; htmlContent: string }[] = [];

  for (const concept of concepts) {
    const sections = concept.content.split(/(?=^### )/m);

    for (const section of sections) {
      if (!section.startsWith("### ")) continue;

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
