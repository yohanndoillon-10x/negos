import { describe, it, expect } from "vitest";
import { parseMarkdownFile, resolveWikiLinks } from "../vault";

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
