'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './theme-toggle.module.css';

const storageKey = 'sethli-theme';

function savedTheme() {
  try {
    const theme = localStorage.getItem(storageKey);
    return theme === 'dark' || theme === 'light' ? theme : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const revision = useRef(0);
  const targetTheme = useRef<'light' | 'dark' | null>(null);
  const activeTransition = useRef<ViewTransition | null>(null);
  const activeReveal = useRef<Animation | null>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      revision.current += 1;
      activeReveal.current?.cancel();
      activeTransition.current?.skipTransition();
      document.documentElement.classList.remove(styles.transitionRoot);
      const theme = savedTheme() ?? (preference.matches ? 'dark' : 'light');
      targetTheme.current = theme;
      document.documentElement.dataset.theme = theme;
      setDark(theme === 'dark');
    };
    const followSystem = () => { if (!savedTheme()) sync(); };
    const followStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) sync(); };
    sync();
    preference.addEventListener('change', followSystem);
    window.addEventListener('storage', followStorage);
    return () => {
      preference.removeEventListener('change', followSystem);
      window.removeEventListener('storage', followStorage);
      revision.current += 1;
      activeReveal.current?.cancel();
      activeTransition.current?.skipTransition();
      document.documentElement.classList.remove(styles.transitionRoot);
    };
  }, []);

  async function toggle(button: HTMLButtonElement) {
    const root = document.documentElement;
    const next = (targetTheme.current ?? root.dataset.theme) === 'dark' ? 'light' : 'dark';
    targetTheme.current = next;
    const current = ++revision.current;
    activeReveal.current?.cancel();
    activeTransition.current?.skipTransition();
    root.classList.remove(styles.transitionRoot);
    const apply = () => {
      if (current !== revision.current) return;
      root.dataset.theme = next;
      flushSync(() => setDark(next === 'dark'));
      try { localStorage.setItem(storageKey, next); } catch { /* The theme also works without browser storage. */ }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition || document.hidden) {
      apply();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add(styles.transitionRoot);
    try {
      const transition = document.startViewTransition(apply);
      activeTransition.current = transition;
      await transition.ready;
      if (current !== revision.current) return;
      const reveal = root.animate({
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      }, {
        duration: 320,
        easing: 'cubic-bezier(.2, .8, .2, 1)',
        pseudoElement: '::view-transition-new(root)',
      });
      activeReveal.current = reveal;
      await Promise.all([reveal.finished, transition.finished]);
    } catch {
      if (current === revision.current) {
        activeTransition.current?.skipTransition();
        if (root.dataset.theme !== next) apply();
      }
    } finally {
      if (current === revision.current) {
        root.classList.remove(styles.transitionRoot);
        activeTransition.current = null;
        activeReveal.current = null;
      }
    }
  }

  const label = dark ? '切换浅色模式' : '切换深色模式';
  return <button className={styles.toggle} type="button" onClick={(event) => { void toggle(event.currentTarget); }} aria-label={label} aria-pressed={dark} title={label}>
    <span className={styles.icons} aria-hidden="true">
      <svg className={styles.sun} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path className={styles.rays} d="M12 2.5v1.8m0 15.4v1.8M2.5 12h1.8m15.4 0h1.8M5.3 5.3l1.3 1.3m10.8 10.8 1.3 1.3M5.3 18.7l1.3-1.3M17.4 6.6l1.3-1.3" />
      </svg>
      <svg className={styles.moon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.2 14.8A8.4 8.4 0 0 1 9.2 3.8a8.4 8.4 0 1 0 11 11Z" />
        <path className={styles.star} d="M18 3.2v3.6M16.2 5h3.6" />
      </svg>
    </span>
  </button>;
}
