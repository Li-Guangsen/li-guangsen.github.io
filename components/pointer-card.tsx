'use client';

import Link from 'next/link';
import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import styles from './pointer-card.module.css';

// Only the decorative layer follows the pointer; text and hit targets stay still.
export function PointerCard({ children, className = '', href }: { children: ReactNode; className?: string; href?: string }) {
  const bounds = useRef<DOMRect | null>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 240, damping: 28, mass: .5 });
  const y = useSpring(0, { stiffness: 240, damping: 28, mass: .5 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const reset = () => { bounds.current = null; opacity.set(0); };
    if (reduced) reset();
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      window.removeEventListener('blur', reset);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('resize', reset);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [opacity, reduced]);

  function track(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (!bounds.current) {
      bounds.current = event.currentTarget.getBoundingClientRect();
      x.jump(event.clientX - bounds.current.left);
      y.jump(event.clientY - bounds.current.top);
    }
    x.set(event.clientX - bounds.current.left);
    y.set(event.clientY - bounds.current.top);
    opacity.set(1);
  }

  const props = {
    className: `${styles.surface} ${className}`,
    'data-pointer-surface': '',
    onPointerEnter: track,
    onPointerMove: track,
    onPointerLeave: () => { bounds.current = null; opacity.set(0); },
    onPointerCancel: () => { bounds.current = null; opacity.set(0); },
  };
  const content = <><motion.span aria-hidden="true" className={styles.glow} data-pointer-glow style={{ x, y, opacity }} />{children}</>;
  return href ? <Link href={href} {...props}>{content}</Link> : <article {...props}>{content}</article>;
}
