import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { site } from '@/data/site';
import { getPostSummaries } from '@/lib/posts';
import { SiteSearchProvider } from '@/components/site-search';
import { WorldTransition } from '@/components/world-transition';
import { brandFont, codeFont } from './fonts';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.title}`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { title: `${site.name} — ${site.title}`, description: site.description, url: site.url, siteName: site.name, locale: 'zh_CN', type: 'website', images: [{ url: '/brand/social-card.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `${site.name} — ${site.title}`, description: site.description, images: ['/brand/social-card.png'] },
  robots: site.preview ? { index: false, follow: false } : { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/favicon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/brand/apple-icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('sethli-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark'}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className={`${brandFont.variable} ${codeFont.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><SiteSearchProvider posts={getPostSummaries()}><a className="skip-link" href="#main">跳到主要内容</a><Header /><main id="main" className="site-main">{children}</main><Footer /><WorldTransition /></SiteSearchProvider></body></html>;
}
