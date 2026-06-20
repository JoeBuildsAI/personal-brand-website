export type ArticleStatus = "Coming Soon" | "Draft" | "Published";

export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  readTime: string;
  date: string | null;
}

export const articles: Article[] = [
  {
    title: "Why Internal Systems Fail",
    slug: "why-internal-systems-fail",
    excerpt:
      "Most internal systems do not fail because of bad software. They fail because of undefined ownership, undocumented assumptions, and processes that were never designed in the first place.",
    category: "Systems Thinking",
    status: "Coming Soon",
    readTime: "6 min read",
    date: null,
  },
  {
    title: "The Future of AI in Legal Operations",
    slug: "the-future-of-ai-in-legal-operations",
    excerpt:
      "AI will not replace legal operations teams, but it will reshape them. The winners will be those who design human-in-the-loop workflows instead of chasing automation for its own sake.",
    category: "Legal Technology",
    status: "Coming Soon",
    readTime: "8 min read",
    date: null,
  },
  {
    title: "Building Personal Operating Systems",
    slug: "building-personal-operating-systems",
    excerpt:
      "The same systems thinking that scales a business can bring clarity to a personal life. A look at treating your finances, goals, and routines as connected infrastructure.",
    category: "Personal Systems",
    status: "Coming Soon",
    readTime: "7 min read",
    date: null,
  },
  {
    title: "Automation Is Not the Same as Architecture",
    slug: "automation-is-not-the-same-as-architecture",
    excerpt:
      "Automating a broken process just makes the mess move faster. Real leverage comes from architecting the system first, then automating what deserves to be automated.",
    category: "Systems Thinking",
    status: "Coming Soon",
    readTime: "5 min read",
    date: null,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
