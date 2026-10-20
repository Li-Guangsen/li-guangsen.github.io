'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import { SearchTrigger } from './search-trigger';
import { useSiteSearch } from './site-search';
import { WorldLink } from './world-transition';
import { BrandWordmark } from './brand-wordmark';

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const search = useSiteSearch();
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 32);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
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
  return <header className={`site-header${compact ? ' is-compact' : ''}${menuOpen ? ' menu-open' : ''}`}><div className="header-inner">
    <Link className="brand" href="/" aria-label={`${site.name} 首页`}><BrandWordmark /></Link>
    <div className="header-actions"><nav id="site-nav" aria-label="主导航" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMenuOpen(false); }}>{[
      { href: '/', label: '首页', en: 'README' },
      { href: '/projects/', label: '项目', en: 'PROJECTS' },
      { href: '/blog/', label: '博客', en: 'BLOG' },
    ].map((item) => {
      const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.replace(/\/$/, ''));
      return <Link key={item.href} href={item.href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>{item.label}<span>{item.en}</span></Link>;
    })}<WorldLink className={pathname.startsWith('/the-world') ? 'nav-link active' : 'nav-link'} current={pathname.startsWith('/the-world')}>拾光<span>COLLECTIONS</span></WorldLink></nav><span className="header-divider" /><SearchTrigger onClick={() => { setMenuOpen(false); search?.openSearch(); }} /><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? '切换浅色模式' : '切换深色模式'} title={dark ? '切换浅色模式' : '切换深色模式'}>
      {dark ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>}
    </button><button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <span aria-hidden="true">×</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}</button></div>
  </div></header>;
}
