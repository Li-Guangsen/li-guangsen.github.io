'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/data/site';

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let theme = document.documentElement.dataset.theme;
    try { theme = localStorage.getItem('sethli-theme') || theme; } catch { /* Storage can be unavailable in private browsing. */ }
    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    setDark(theme === 'dark');
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem('sethli-theme', next ? 'dark' : 'light'); } catch { /* Browsing without storage is supported. */ }
  }
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label={`${site.name} 首页`}><span className="brand-mark">{site.initials}<span>.</span></span><span>{site.name}</span></Link>
    <div className="header-actions"><nav aria-label="主导航">{[
      { href: '/', label: '首页', en: 'README' },
      { href: '/projects/', label: '项目', en: 'PROJECTS' },
      { href: '/blog/', label: '博客', en: 'BLOG' },
    ].map((item) => {
      const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.replace(/\/$/, ''));
      return <Link key={item.href} href={item.href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>{item.label}<span>{item.en}</span></Link>;
    })}</nav><span className="header-divider" /><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? '切换浅色模式' : '切换深色模式'} title={dark ? '切换浅色模式' : '切换深色模式'}>
      {dark ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>}
    </button></div>
  </div></header>;
}
