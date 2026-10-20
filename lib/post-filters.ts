import type { PostSummary } from './posts';

export const POSTS_PER_PAGE = 10;
export type BlogFilters = { query: string; category: string; page: number; tag?: string };
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().trim();

export function matchesPost(post: PostSummary, query: string, category = '', tag = '') {
  const categories = post.categories?.length ? post.categories : [post.category];
  if (category && !categories.some((item) => normalize(item) === normalize(category))) return false;
  if (tag && !post.tags.some((item) => normalize(item) === normalize(tag))) return false;
  const text = normalize([post.title, post.description, ...post.tags, ...categories].join(' '));
  return normalize(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}

export function readBlogFilters(search: string): BlogFilters {
  const params = new URLSearchParams(search);
  const rawPage = Number(params.get('page'));
  return { query: params.get('q') || '', category: params.get('category') || '', tag: params.get('tag') || '', page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1 };
}

export function blogFilterHref(filters: BlogFilters) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.page > 1) params.set('page', String(filters.page));
  return `/blog/${params.size ? `?${params}` : ''}`;
}

export function paginatePosts<T>(posts: T[], page: number, perPage = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isSafeInteger(page) ? page : 1));
  return { page: currentPage, totalPages, posts: posts.slice((currentPage - 1) * perPage, currentPage * perPage) };
}
