'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { site } from '@/data/site';
import { SearchTrigger } from './search-trigger';
import { useSiteSearch } from './site-search';
import { BrandWordmark } from './brand-wordmark';
import { ThemeToggle } from './theme-toggle';
import { ContactMenu } from './contact-menu';

const links = [
  { href: '/', label: '首页' },
  { href: '/projects/', label: '项目' },
  { href: '/blog/', label: '博客' },
  { href: '/the-world/', label: '拾光' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const highlightId = useId();
  const reduced = useReducedMotion();
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const search = useSiteSearch();

  useEffect(() => {
    let compact = false;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = window.scrollY > (compact ? 48 : 100);
      if (compact !== next) { compact = next; setFloating(next); }
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    return () => { window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', resize);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', resize);
    };
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); setHighlight(null); }, [pathname]);

  return <header ref={header} className={`site-header${menuOpen ? ' menu-open' : ''}${floating ? ' is-floating' : ''}`}>
    <div className="header-inner">
      <Link className="brand" href="/" aria-label={`${site.name} 首页`}><img src="/brand/favicon-32.png" alt="" width="24" height="24" /><BrandWordmark /></Link>
      <nav id="site-nav" aria-label="主导航" onPointerLeave={() => setHighlight(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHighlight(null); }} onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMenuOpen(false); }}>
        {links.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, ''));
          return <Link key={href} href={href} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHighlight(href); }} onFocus={() => setHighlight(href)}>
            {(highlight ? highlight === href : active) && <motion.span className="nav-highlight" aria-hidden="true" layoutId={highlightId} initial={false} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="nav-label">{label}</span>
          </Link>;
        })}
        <div className="mobile-contact"><ContactMenu inline /></div>
      </nav>
      <div className="header-actions">
        <SearchTrigger onClick={() => { setMenuOpen(false); search?.openSearch(); }} />
        <ThemeToggle />
        <div className="desktop-contact"><ContactMenu /></div>
        <button ref={toggle} type="button" className="mobile-menu-toggle" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen((value) => !value)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">{menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
        </button>
      </div>
    </div>
  </header>;
}
