import type { CSSProperties } from 'react';

export function Arrow({ diagonal = false, className = '' }: { diagonal?: boolean; className?: string }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
}

export function Asterisk({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="8"><path d="M32 3v58M3 32h58M11.5 11.5l41 41m-41 0 41-41" /></g></svg>;
}

export function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
}
