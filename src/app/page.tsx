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
