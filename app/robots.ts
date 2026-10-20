import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  return site.preview ? { rules: { userAgent: '*', disallow: '/' } } : { rules: { userAgent: '*', allow: '/' }, sitemap: `${site.url}/sitemap.xml` };
}
