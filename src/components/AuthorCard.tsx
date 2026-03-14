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
