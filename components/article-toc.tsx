'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './reading.module.css';

type Heading = { id: string; text: string; level: number };

export function ArticleToc({ articleId, slug, enabled = true }: { articleId: string; slug: string; enabled?: boolean }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState(0);
  const mobileRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    const elements = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'));
    setHeadings(elements.map((heading) => {
      const copy = heading.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('.heading-anchor, [aria-hidden="true"]').forEach((anchor) => anchor.remove());
      return { id: heading.id, text: copy.textContent?.trim() || heading.id, level: Number(heading.tagName[1]) };
    }));
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = article.getBoundingClientRect();
      const available = Math.max(1, bounds.height - window.innerHeight + 136);
      const percentage = Math.round(Math.min(1, Math.max(0, (136 - bounds.top) / available)) * 100);
      setProgress(percentage);
      let current = elements[0]?.id || '';
      for (const heading of elements) {
        if (heading.getBoundingClientRect().top <= 155) current = heading.id;
        else break;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [articleId, slug]);

  const list = (mobile: boolean) => <ol className={styles.tocList}>
    {headings.map((heading) => <li key={heading.id} data-level={heading.level}>
      <a href={`#${heading.id}`} aria-current={active === heading.id ? 'location' : undefined}
        onClick={() => { if (mobile && mobileRef.current) mobileRef.current.open = false; }}>
        {heading.text}
      </a>
    </li>)}
  </ol>;

  return <>
    <div className={styles.progressTrack} role="progressbar" aria-label="文章阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
    {enabled && headings.length > 0 && <aside className={styles.tocRail} aria-label="文章目录">
      <nav className={styles.desktopToc} aria-label="本篇目录">
        <div className={styles.railLabel}>ON THIS PAGE <span>{progress}%</span></div>
        <p className={styles.railTitle}>阅读路标</p>
        {list(false)}
        <a className={styles.backToTop} href="#article-top">↑ 回到开头</a>
      </nav>
      <details ref={mobileRef} className={styles.mobileToc}>
        <summary>本篇目录 <span>{headings.length} 节 <span aria-hidden="true">＋</span></span></summary>
        <nav aria-label="本篇目录">{list(true)}</nav>
      </details>
    </aside>}
  </>;
}
