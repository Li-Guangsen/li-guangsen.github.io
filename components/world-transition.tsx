'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function WorldLink({ children, className, current }: { children: React.ReactNode; className?: string; current?: boolean }) {
  return <Link href="/the-world/" className={className} aria-current={current ? 'page' : undefined} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.location.pathname === '/the-world/') return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('sethli:world', { detail: { x: event.clientX || innerWidth / 2, y: event.clientY || innerHeight / 2 } }));
  }}>{children}</Link>;
}

export function WorldTransition() {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const router = useRouter();
  useEffect(() => {
    function transition(event: Event) {
      const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
      timers.current.forEach(clearTimeout);
      setOrigin(detail);
      timers.current = [setTimeout(() => router.push('/the-world/'), 180), setTimeout(() => setOrigin(null), 700)];
    }
    window.addEventListener('sethli:world', transition);
    return () => { window.removeEventListener('sethli:world', transition); timers.current.forEach(clearTimeout); };
  }, [router]);
  if (!origin) return null;
  return <div className="world-transition" aria-hidden="true" style={{ '--origin-x': `${origin.x}px`, '--origin-y': `${origin.y}px` } as React.CSSProperties}><span>把目光，放慢一点。</span></div>;
}
