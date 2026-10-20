import type { MetadataRoute } from 'next';
import { site, projects } from '@/data/site';
import { getPosts } from '@/lib/posts';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/projects/', '/blog/', '/the-world/', ...projects.map(({ slug }) => `/projects/${slug}/`), ...getPosts().map(({ slug }) => `/blog/${slug}/`)].map((route) => ({ url: `${site.url}${route}` }));
}
