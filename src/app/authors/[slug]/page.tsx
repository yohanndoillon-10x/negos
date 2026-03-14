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
