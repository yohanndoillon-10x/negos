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
