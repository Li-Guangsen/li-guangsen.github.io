import type { CSSProperties } from 'react';

const icons: Record<string, string> = {
  java: 'java',
  python: 'python',
  c: 'c',
  springboot: 'springboot',
  spring: 'spring',
  fastapi: 'fastapi',
  mysql: 'mysql',
  redis: 'redis',
  linux: 'linux',
  docker: 'docker',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  git: 'git',
  langgraph: 'langgraph-logo',
  mcp: 'mcp',
};

/** Locally hosted source logos; the surrounding label supplies the accessible name. */
export function TechIcon({ name, className }: { name: string; className?: string }) {
  const key = name.toLowerCase().replace(/\s+/g, '');
  const icon = icons[key];

  if (icon) {
    const mask = `url("/icons/tech/${icon}.svg")`;
    // LangGraph's wide mark sits inside a square canvas with vertical padding.
    const iconWidth = key === 'langgraph' ? 32 : 20;
    const maskSize = key === 'langgraph' ? `${iconWidth}px ${iconWidth}px` : 'contain';
    const style: CSSProperties = {
      display: 'inline-block',
      width: iconWidth,
      height: 20,
      flexShrink: 0,
      backgroundColor: 'currentColor',
      maskImage: mask,
      WebkitMaskImage: mask,
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskSize,
      WebkitMaskSize: maskSize,
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    };
    return <span className={className} style={style} aria-hidden="true" />;
  }

  // RAG is a technique rather than a product: use a document-search symbol.
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {key === 'rag' ? <><path d="M13 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8M13 3l5 5h-5V3ZM7.5 8h2M7.5 12h3" /><circle cx="16" cy="15" r="3.5" /><path d="m18.5 17.5 3 3" /></> : <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" /></>}
  </svg>;
}
