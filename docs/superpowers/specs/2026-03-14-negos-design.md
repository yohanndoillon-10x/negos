# Negos — Negotiation & Strategic Realism Knowledge Base

## Overview

A comprehensive, intellectually rigorous knowledge base that bridges **realist statecraft** (Morgenthau, Kennan, Spykman, Schelling, Kissinger) with **negotiation craft** (Fisher & Ury, Voss, Cialdini, Zartman). Content lives in Obsidian as a second-brain vault; a Next.js web app renders it as a polished, searchable reference with a comparison tool and future AI-powered scenario analysis.

**One source of truth (Obsidian), two interfaces (Obsidian + web app).**

---

## Goals

1. Deep, non-superficial coverage of each author's intellectual system — not summaries, but frameworks you can reason with. Target: 1000-2000 words per author page, 300-600 words per principle, 200-400 words per author section in concept pages.
2. Translation of realist geopolitical theory into actionable negotiation principles
3. Cross-cutting concept pages that show how different thinkers address the same theme
4. A browsable, searchable, fast web experience optimized for reading
5. An Obsidian vault that integrates into the user's second brain with full linking and graph navigation
6. Architecture that supports future AI features (scenario analysis, conversational Q&A per author)

---

## Author Roster

### Realist Strategists

| Author | Core Framework | Est. Principles |
|--------|---------------|-----------------|
| **Hans Morgenthau** | Six Principles of Political Realism, national interest defined as power, balance of power | 8-10 |
| **George Kennan** | Containment doctrine, long-term strategic patience, diplomatic vs. military leverage | 6-8 |
| **Nicholas Spykman** | Rimland theory, geographic determinism in power, positional strategy | 5-7 |
| **Thomas Schelling** | Strategy of Conflict, focal points, credible commitments, brinkmanship, game theory | 8-10 |
| **Henry Kissinger** | Realpolitik, linkage diplomacy, triangular diplomacy, world order frameworks | 8-10 |

### Negotiation Practitioners

| Author | Core Framework | Est. Principles |
|--------|---------------|-----------------|
| **Roger Fisher & William Ury** | Principled negotiation, BATNA, separate people from problems, invent options | 7-8 |
| **Chris Voss** | Tactical empathy, calibrated questions, mirroring, labeling, accusation audit | 8-10 |
| **Robert Cialdini** | Six principles of persuasion (reciprocity, scarcity, authority, consistency, liking, consensus) | 6-7 |
| **I. William Zartman** | Ripeness theory, mutually hurting stalemate, formula-detail approach | 5-6 |

**Total**: 9 authors, ~65-80 principles, ~15-20 cross-cutting concept pages.

---

## Architecture

### Tech Stack

- **Content**: Markdown files with YAML frontmatter in an Obsidian vault
- **Web framework**: Next.js 14+ (App Router), static site generation (SSG)
- **Styling**: Tailwind CSS
- **Content parsing**: `gray-matter` (frontmatter) + `unified`/`remark`/`rehype` pipeline (markdown rendering, wiki-link resolution)
- **Search**: Client-side fuzzy search (e.g., Fuse.js) across all content
- **Hosting**: Vercel free tier
- **Future AI**: Next.js API route (`/api/analyze`) calling Claude API with vault content as context

### How It Works

1. Content is authored and linked in Obsidian (the canonical source)
2. The vault lives inside the same git repo (`vault/` directory). Edits in Obsidian are committed and pushed to trigger rebuilds.
3. At build time, Next.js reads the vault's markdown files, parses frontmatter and content
4. Pages are statically generated — zero runtime cost, instant loads
5. Obsidian wiki-links are resolved to web app routes during build via a custom remark plugin:
   - `[[Morgenthau]]` → `/authors/morgenthau`
   - `[[Morgenthau|Hans Morgenthau]]` → `/authors/morgenthau` with display text "Hans Morgenthau"
   - `[[Leverage]]` → `/concepts/leverage`
   - Resolution builds a lookup map at build time from all files: maps both the `name` field (e.g., "Power Asymmetry", "Fisher & Ury") and the `slug` field (e.g., "power-asymmetry", "fisher-ury") to the correct route. Wiki-link text is matched against this map (case-insensitive). Broken links (no match) render as plain text with a console warning at build time.
6. Search index is built at compile time from all frontmatter + content
7. Deployed to Vercel; rebuilds on push

**Canonical identifiers:** The **filename** (minus `.md`) is the canonical slug used for routing. The `slug` field in frontmatter must match the filename. If they diverge, the build fails with an error.

---

## Content Layer: Obsidian Vault Structure

```
Negos/
  vault/
    index.md                              -> MOC (Map of Content)
    authors/
      morgenthau.md
      kennan.md
      spykman.md
      schelling.md
      kissinger.md
      fisher-ury.md
      voss.md
      cialdini.md
      zartman.md
    concepts/
      power-asymmetry.md
      leverage.md
      credible-commitment.md
      strategic-patience.md
      information-control.md
      anchoring.md
      coalition-building.md
      face-saving.md
      escalation-dynamics.md
      batna-and-alternatives.md
      trust-and-reciprocity.md
      framing.md
      cultural-context.md
      timing-and-ripeness.md
      concession-strategy.md
      balance-of-power.md
      deterrence.md
    principles/
      morgenthau-01-interest-as-power.md
      morgenthau-02-autonomy-of-politics.md
      kennan-01-patient-containment.md
      voss-01-tactical-empathy.md
      ...
```

### Author Note Format

```markdown
---
slug: morgenthau
name: "Hans Morgenthau"
era: "1904-1980"
oneLiner: "The father of modern political realism"
school: realist
coreFrameworkTitle: "Six Principles of Political Realism"
principles:
  - morgenthau-01-interest-as-power
  - morgenthau-02-autonomy-of-politics
  - ...
crossReferences:
  - author: kennan
    relationship: complements
    description: "Both ground foreign policy in national interest, but Kennan emphasizes diplomatic restraint where Morgenthau accepts the role of power projection"
  - author: fisher-ury
    relationship: contradicts
    description: "Fisher & Ury assume mutual gains are usually possible; Morgenthau sees politics as an inherently zero-sum struggle for power"
sourceWorks:
  - title: "Politics Among Nations"
    year: 1948
    significance: "The foundational text of classical realism in international relations"
  - title: "Scientific Man vs. Power Politics"
    year: 1946
    significance: "Critique of rationalist approaches to politics; argues for understanding power as it is, not as we wish it to be"
---

## Biographical Context

[2-3 paragraphs on what shaped Morgenthau's thinking — fleeing Nazi Germany, the failure of idealism, his academic career at Chicago...]

## Core Framework

### Six Principles of Political Realism

[Deep explanation of the central thesis — several paragraphs. Not a summary. An explanation you can reason with.]

### Key Concepts

#### Interest Defined as Power
[Deep explanation]

**Negotiation Application:** [How this concept translates to negotiation settings]

#### Autonomy of the Political Sphere
[Deep explanation]

**Negotiation Application:** [...]

[...more concepts...]

## Source Works

- *Politics Among Nations* (1948) — [significance]
- [...]
```

### Principle Note Format

```markdown
---
slug: morgenthau-01-interest-as-power
author: morgenthau
number: 1
title: "Interest Defined as Power"
relatedConcepts:
  - power-asymmetry
  - leverage
  - balance-of-power
---

## The Principle

[Full explanation of the principle — what Morgenthau meant, the intellectual context, why it matters]

## Negotiation Application

[How to apply this principle in negotiation — concrete, actionable, but grounded in the theory]

## Related Concepts

- [[Power Asymmetry]]
- [[Leverage]]
- [[Balance of Power]]
```

### Concept Note Format

```markdown
---
slug: leverage
name: "Leverage"
description: "The ability to influence outcomes through the control of something the other party values"
authors:
  - morgenthau
  - schelling
  - voss
  - fisher-ury
tags:
  - power
  - influence
  - asymmetry
---

## Overview

[What this concept means across the literature — 1-2 paragraphs]

## By Author

### [[Morgenthau]] — Power as the Currency of Politics
[What Morgenthau says about leverage through his realist lens]

### [[Schelling]] — Commitment and Credible Threats
[What Schelling says — game-theoretic perspective]

### [[Voss]] — Tactical Leverage Through Empathy
[What Voss says — practitioner perspective]

### [[Fisher & Ury]] — BATNA as Leverage
[What Fisher & Ury say — principled negotiation perspective]

## Tensions & Convergences

[Where these authors agree, disagree, or extend each other's thinking on this concept]
```

---

## Web App: Information Architecture

### Routes

```
/                         -> Landing page: search bar + author grid
/authors/[slug]           -> Deep-dive author page
/concepts/[slug]          -> Cross-cutting concept page
/compare                  -> Side-by-side author comparison tool
/principles/[slug]        -> Individual principle page (also embedded in author pages)
```

### Landing Page

- Global search bar, prominent and centered
- Two sections: "Realist Strategists" and "Negotiation Practitioners"
- Author cards: name, one-liner, era
- Quick-access concept tags below the grid

### Author Page (`/authors/morgenthau`)

- Sticky sidebar tracking scroll position:
  - Overview
  - Core Framework
  - Key Principles (numbered, expandable)
  - Cross-References
  - Source Works
- Long-form, scrollable content
- Sidebar collapses to dropdown on mobile

### Concept Page (`/concepts/leverage`)

- Overview paragraph
- Tabbed or sectioned by author
- "Tensions & Convergences" section at bottom

### Compare Page (`/compare`)

- Select 2-3 authors from dropdowns
- Comparison is organized by **cross-cutting concepts** (from the concepts list). For each concept, the view shows each selected author's position — pulled from their `relatedConcepts` in principle frontmatter and the concept page's "By Author" sections
- Only concepts where at least 2 of the selected authors have content are shown
- Scrollable, responsive (tabs on mobile)

### Search

- Client-side fuzzy search (Fuse.js, threshold: 0.3)
- **Searchable fields**: name/title (weight 2.0), oneLiner/description (weight 1.5), tags (weight 1.0), body text first 500 chars (weight 0.5)
- Instant results grouped by: Authors, Principles, Concepts — max 5 per group, expandable
- Search index built at compile time from frontmatter + truncated content

---

## UI & Visual Design

- **Typography**: Inter or system font stack. Body text ~18px. Clear hierarchy via weight and size.
- **Color palette**: Light background, near-black text. Deep blue/slate accent. Warm subtle tone for realist authors, cool for practitioners.
- **Layout**: Content column max ~720px (reading), ~1100px with sidebar. Generous whitespace.
- **Cards**: Minimal borders, subtle shadows.
- **Sidebar**: Sticky on desktop, dropdown on mobile. Tracks scroll position.
- **Compare view**: 2-3 columns on desktop, tabbed on mobile.
- **Responsive**: Fully mobile-friendly.
- **No dark mode in v1.**

---

## Cross-Cutting Concepts (Initial List)

1. Power Asymmetry
2. Leverage
3. Credible Commitment
4. Strategic Patience
5. Information Control
6. Anchoring
7. Coalition Building
8. Face-Saving
9. Escalation Dynamics
10. BATNA & Alternatives
11. Trust & Reciprocity
12. Framing
13. Cultural Context
14. Timing & Ripeness
15. Concession Strategy
16. Balance of Power
17. Deterrence

---

## Future: AI Features (v2)

- **Scenario Analysis**: User describes a negotiation situation; the app sends it to Claude API with relevant author principles as context, returns analysis drawing from multiple frameworks
- **Conversational Q&A**: Ask follow-up questions about any author's concepts, grounded in their corpus
- **Implementation**: Next.js API route (`/api/analyze`), Claude API call. At build time, generate a compressed knowledge base summary (~30k tokens covering all principles and key concepts) to use as system context. For author-specific queries, load only that author's content. Total vault will be well within Claude's 200k context window.
- **Cost**: Negligible per-query cost on Claude API for text analysis

---

## Project Structure

```
Negos/
  vault/                    -> Obsidian vault (content source of truth)
    .obsidian/              -> Obsidian config
    index.md
    authors/
    concepts/
    principles/
  src/
    app/
      page.tsx              -> Landing page
      authors/[slug]/
        page.tsx            -> Author page
      concepts/[slug]/
        page.tsx            -> Concept page
      compare/
        page.tsx            -> Compare page
      principles/[slug]/
        page.tsx            -> Principle page
      layout.tsx            -> Root layout
    components/
      AuthorCard.tsx
      SearchBar.tsx
      Sidebar.tsx
      PrincipleCard.tsx
      CompareView.tsx
      ConceptSection.tsx
    lib/
      vault.ts              -> Reads and parses vault markdown files
      search.ts             -> Builds and queries search index
      types.ts              -> TypeScript types
    styles/
      globals.css
  public/
  next.config.js
  tailwind.config.ts
  package.json
  tsconfig.json
```

---

## Success Criteria

1. All 9 authors have complete, deeply written entries with principles, cross-references, and source works
2. All ~17 concept pages aggregate perspectives from relevant authors
3. Obsidian vault is fully interlinked — graph view shows meaningful connections
4. Web app loads instantly (SSG), search returns results in <100ms
5. Mobile-responsive, clean reading experience
6. Content can be edited in Obsidian and reflected in the web app on rebuild
7. Architecture supports adding AI scenario analysis without structural changes
