'use client';

import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import * as runtime from 'react/jsx-runtime';
import { AlgorithmSteps } from './algorithm-steps';
import styles from './reading.module.css';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
  } catch { /* Browsers can deny clipboard access; allow the legacy fallback. */ }
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  Object.assign(input.style, { position: 'fixed', top: '0', left: '-9999px' });
  document.body.appendChild(input);
  try {
    input.select();
    return document.execCommand('copy');
  } catch { return false; }
  finally { input.remove(); previousFocus?.focus({ preventScroll: true }); }
}

function CopyButton({ value, label = '复制代码' }: { value: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2600);
    return () => window.clearTimeout(timer);
  }, [status]);
  return <button className={styles.copyButton} type="button" onClick={async () => setStatus(await copyText(value) ? 'copied' : 'failed')}>
    <span aria-live="polite">{status === 'copied' ? '已复制 ✓' : status === 'failed' ? '复制失败，请手动选择' : label}</span>
  </button>;
}

function Pre({ children, className = '', ...props }: ComponentProps<'pre'>) {
  const code = Children.toArray(children).find((child) => isValidElement(child));
  const data = props as Record<string, unknown>;
  const childProps = isValidElement(code) ? code.props as Record<string, unknown> : {};
  const language = String(data['data-language'] || childProps['data-language'] || 'text');
  return <div className={styles.codeBlock}>
    <div className={styles.codeToolbar}><span>{language}</span><CopyButton value={textOf(children)} /></div>
    <pre {...props} className={`${styles.codePre} ${className}`} tabIndex={0} aria-label={`${language} 代码`}>{children}</pre>
  </div>;
}

function Figure({ children, className = '', ...props }: ComponentProps<'figure'>) {
  return <figure {...props} className={`${styles.figure} ${className}`}>{children}</figure>;
}

function Table({ children, ...props }: ComponentProps<'table'>) {
  return <div className={styles.tableScroll} role="region" aria-label="文章表格，可横向滚动" tabIndex={0}><table {...props}>{children}</table></div>;
}

function ArticleImage({ alt = '', ...props }: ComponentProps<'img'>) {
  // Keep the image inline-compatible: Markdown commonly places it inside <p>.
  return <img {...props} alt={alt} loading={props.loading || 'lazy'} decoding="async" className={`${styles.articleImage} ${props.className || ''}`} />;
}

function Callout({ title = '记一下', type = 'note', children }: { title?: string; type?: 'note' | 'tip' | 'important' | 'warning' | 'caution'; children: ReactNode }) {
  return <aside className={`markdown-alert markdown-alert-${type}`}><p className="markdown-alert-title">{title}</p>{children}</aside>;
}

function MermaidSvg({ id, className = '', style, ...props }: ComponentProps<'svg'> & { 'data-mermaid-source'?: string }) {
  const source = props['data-mermaid-source'];
  const isDiagram = !!source || (typeof id === 'string' && id.startsWith('mermaid-'));
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const zoom = (change: number) => setScale((value) => Math.min(4, Math.max(.5, Math.round((value + change) * 100) / 100)));
  const pan = (x: number, y: number) => setOffset((value) => ({ x: value.x + x, y: value.y + y }));
  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }); };
  if (!isDiagram) return <svg id={id} className={className} style={style} {...props} />;

  return <figure className={styles.diagram}>
    <div className={styles.diagramToolbar}>
      <span>流程图 <small>{Math.round(scale * 100)}%</small></span>
      <div className={styles.diagramActions}>
        <button type="button" aria-label="缩小图表" disabled={scale <= .5} onClick={() => zoom(-.25)}>−</button>
        <button type="button" aria-label="放大图表" disabled={scale >= 4} onClick={() => zoom(.25)}>＋</button>
        <button type="button" aria-label="复位图表" onClick={reset}>复位</button>
        {source && <CopyButton value={source} label="复制源码" />}
      </div>
    </div>
    <div className={styles.diagramViewport} tabIndex={0} role="group" aria-label="可移动图表。方向键移动，加减号缩放，0 复位。"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        switch (event.key) {
          case 'ArrowLeft': event.preventDefault(); pan(-40, 0); break;
          case 'ArrowRight': event.preventDefault(); pan(40, 0); break;
          case 'ArrowUp': event.preventDefault(); pan(0, -40); break;
          case 'ArrowDown': event.preventDefault(); pan(0, 40); break;
          case '+': case '=': event.preventDefault(); zoom(.25); break;
          case '-': event.preventDefault(); zoom(-.25); break;
          case '0': event.preventDefault(); reset(); break;
        }
      }}
      onDoubleClick={reset}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: offset.x, y: offset.y };
      }}
      onPointerMove={(event) => {
        if (!drag.current || drag.current.id !== event.pointerId) return;
        // Vertical touch gestures stay available for reading; horizontal gestures pan.
        if (event.pointerType === 'touch' && Math.abs(event.clientY - drag.current.startY) > Math.abs(event.clientX - drag.current.startX)) return;
        setOffset({ x: drag.current.x + event.clientX - drag.current.startX, y: drag.current.y + event.clientY - drag.current.startY });
      }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <div className={styles.diagramCanvas} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
        <svg {...props} id={id} className={`${styles.mermaidSvg} ${className}`} style={{ ...style, width: '100%', maxWidth: '100%', height: 'auto' }} />
      </div>
    </div>
    <figcaption>拖动查看 · 双击复位 · 聚焦图表后可用方向键与 ＋ / − 操作</figcaption>
  </figure>;
}

const components = { pre: Pre, figure: Figure, table: Table, img: ArticleImage, svg: MermaidSvg, AlgorithmSteps, Callout };

function compileComponent(code: string): ComponentType<{ components: typeof components }> {
  // Only repository-authored MDX compiled by Velite reaches this renderer.
  // Content is passed by the server for this article, never imported as a full collection.
  return (new Function(code)({ ...runtime }) as { default: ComponentType<{ components: typeof components }> }).default;
}

export function MDXContent({ code }: { code: string }) {
  const Content = useMemo(() => compileComponent(code), [code]);
  return <Content components={components} />;
}
