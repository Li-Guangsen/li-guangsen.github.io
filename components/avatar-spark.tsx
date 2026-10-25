'use client';

import { useRef, useState, type ReactNode } from 'react';
import styles from './showcase.module.css';

export function AvatarSpark({ children, className = '', label = '撒点纸屑' }: { children: ReactNode; className?: string; label?: string }) {
  const lastBurst = useRef(0);
  const [message, setMessage] = useState('');

  async function celebrate(event: React.MouseEvent<HTMLButtonElement>) {
    if (Date.now() - lastBurst.current < 700) return;
    lastBurst.current = Date.now();
    setMessage('🎉');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    try {
      const { default: confetti } = await import('canvas-confetti');
      void confetti({
        particleCount: 56, spread: 360, startVelocity: 20, gravity: 0.25, ticks: 90, decay: .93,
        shapes: ['star', 'circle'], scalar: .9,
        origin: { x: (bounds.left + bounds.width / 2) / window.innerWidth, y: (bounds.top + bounds.height / 2) / window.innerHeight },
        colors: ['#4ade80', '#86efac', '#facc15', '#fef08a'],
        disableForReducedMotion: true, zIndex: 100,
      });
    } catch {
      // The text acknowledgement still works if an optional animation chunk cannot load.
    }
  }

  return <button type="button" className={`${styles.avatarSpark} ${className}`} aria-label={label} title={label} onClick={celebrate}>
    {children}
    <output className="sr-only" aria-live="polite">{message}</output>
  </button>;
}
