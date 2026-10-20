import type { Metadata } from 'next';
import { site } from '@/data/site';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${site.url}${path}`;
  return {
    title, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: site.name, locale: 'zh_CN', images: [{ url: '/brand/social-card.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/brand/social-card.png'] },
  };
}
