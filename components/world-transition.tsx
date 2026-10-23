import Link from 'next/link';
import type { ReactNode } from 'react';

export function WorldLink({ children, className, current, label }: { children: ReactNode; className?: string; current?: boolean; label?: string }) {
  return <Link href="/the-world/" className={className} aria-current={current ? 'page' : undefined} aria-label={label}>{children}</Link>;
}
