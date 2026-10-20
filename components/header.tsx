'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import { SearchTrigger } from './search-trigger';
import { useSiteSearch } from './site-search';
import { WorldLink } from './world-transition';
import { BrandWordmark } from './brand-wordmark';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
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
  return <header className={`site-header${compact ? ' is-compact' : ''}${menuOpen ? ' menu-open' : ''}`}><div className="header-inner">
    <Link className="brand" href="/" aria-label={`${site.name} 首页`}><BrandWordmark /></Link>
    <div className="header-actions"><nav id="site-nav" aria-label="主导航" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMenuOpen(false); }}>{[
      { href: '/', label: '首页', en: 'README' },
      { href: '/projects/', label: '项目', en: 'PROJECTS' },
      { href: '/blog/', label: '博客', en: 'BLOG' },
    ].map((item) => {
      const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.replace(/\/$/, ''));
      return <Link key={item.href} href={item.href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>{item.label}<span>{item.en}</span></Link>;
    })}<WorldLink className={pathname.startsWith('/the-world') ? 'nav-link active' : 'nav-link'} current={pathname.startsWith('/the-world')}>拾光<span>COLLECTIONS</span></WorldLink></nav><span className="header-divider" /><SearchTrigger onClick={() => { setMenuOpen(false); search?.openSearch(); }} /><ThemeToggle /><button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <span aria-hidden="true">×</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}</button></div>
  </div></header>;
}
