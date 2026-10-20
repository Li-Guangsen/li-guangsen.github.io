'use client';

import { useRef, useState, type ReactNode } from 'react';
import styles from './showcase.module.css';

export function AvatarSpark({ children, className = '', label = '给今天一点小小的庆祝' }: { children: ReactNode; className?: string; label?: string }) {
  const lastBurst = useRef(0);
  const [message, setMessage] = useState('');

  async function celebrate(event: React.MouseEvent<HTMLButtonElement>) {
    if (Date.now() - lastBurst.current < 700) return;
    lastBurst.current = Date.now();
    setMessage('保持好奇，继续创造。');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    try {
      const { default: confetti } = await import('canvas-confetti');
      void confetti({
        particleCount: 40, spread: 65, startVelocity: 22, gravity: 0.9,
        origin: { x: (bounds.left + bounds.width / 2) / window.innerWidth, y: (bounds.top + bounds.height / 2) / window.innerHeight },
        colors: ['#50764d', '#b6c99d', '#d7c8a5', '#d9e3cf'],
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
