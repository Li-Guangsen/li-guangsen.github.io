import posts from '@/.velite/posts.json';
import summaries from '@/.velite/post-summaries.json';

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categories: string[];
  tags: string[];
  sample: boolean;
  published: boolean;
  pinned: boolean;
  toc: boolean;
  minutes: number;
  /** Trusted local MDX compiled by Velite, not HTML or visitor input. */
  content: string;
};

export type PostSummary = Omit<Post, 'content'>;

export function getPosts(): Post[] {
  return posts;
}

export function getPostSummaries(): PostSummary[] {
  return summaries;
}

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function formatDate(value: string) {
  return value.replaceAll('-', '.');
}
