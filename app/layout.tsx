import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { site } from '@/data/site';
import { getPostSummaries } from '@/lib/posts';
import { SiteSearchProvider } from '@/components/site-search';
import { WorldTransition } from '@/components/world-transition';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.title}`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { title: `${site.name} — ${site.title}`, description: site.description, url: site.url, siteName: site.name, locale: 'zh_CN', type: 'website', images: [{ url: '/social-card.svg', width: 1200, height: 630 }] },
  robots: site.preview ? { index: false, follow: false } : { index: true, follow: true },
  icons: { icon: '/icon.svg' },
};

const themeScript = `(function(){try{var t=localStorage.getItem('sethli-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark'}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><SiteSearchProvider posts={getPostSummaries()}><a className="skip-link" href="#main">跳到主要内容</a><Header /><main id="main" className="site-main">{children}</main><Footer /><WorldTransition /></SiteSearchProvider></body></html>;
}
