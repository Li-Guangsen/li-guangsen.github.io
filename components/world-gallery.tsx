'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, useDragControls, useMotionValue, useReducedMotion } from 'motion/react';
import { worldCollections, type WorldCard, type WorldCollection } from '@/data/world';
import styles from './showcase.module.css';

const allCards = worldCollections.flatMap((collection) => collection.cards);

function ScrapbookCard({ card, constraints, reset, open, compact }: { card: WorldCard; constraints: React.RefObject<HTMLDivElement | null>; reset: number; open: (id: string) => void; compact: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useDragControls();
  const reduced = useReducedMotion();
  const [moving, setMoving] = useState(false);
  useEffect(() => { x.set(0); y.set(0); }, [reset, compact, x, y]);

  function moveWithKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const delta: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
    if (event.key === 'Home') { event.preventDefault(); x.set(0); y.set(0); return; }
    if (!delta[event.key] || compact) return;
    event.preventDefault();
    // Keep keyboard movement within the surrounding scrapbook margin.
    x.set(Math.min(40, Math.max(-40, x.get() + delta[event.key][0])));
    y.set(Math.min(40, Math.max(-40, y.get() + delta[event.key][1])));
  }

  return <motion.article className={styles.scrapCard} style={{ x, y, rotate: compact || reduced ? 0 : card.rotation, zIndex: moving ? 5 : 1 }} drag={!compact && !reduced} dragControls={controls} dragListener={false} dragConstraints={constraints} dragElastic={0.08} dragMomentum={false} onDragStart={() => setMoving(true)} onDragEnd={() => setMoving(false)} whileHover={!reduced && !compact ? { rotate: 0 } : undefined} transition={{ type: 'tween', duration: .18, ease: [.2, .8, .2, 1] }}>
    <div className={styles.cardTopline}><span>{card.kind === 'illustration' ? '展示插画' : '生活记录'}</span><button type="button" className={styles.dragHandle} aria-label={`移动“${card.title}”，方向键移动，Home 复位`} aria-describedby="gallery-instructions" onKeyDown={moveWithKeys} onPointerDown={(event) => { if (!compact && !reduced) controls.start(event); }} disabled={compact || Boolean(reduced)} title="拖动，或用方向键移动">⠿</button></div>
    <button type="button" className={styles.cardImageButton} onClick={() => open(card.id)} aria-label={`放大查看：${card.title}`}>
      <img src={card.image} width="800" height="560" alt={card.alt} loading="lazy" draggable="false" />
      <span className={styles.expandHint} aria-hidden="true">↗</span>
    </button>
    <div className={styles.cardCaption}><h3>{card.title}</h3><p>{card.caption}</p></div>
  </motion.article>;
}

function Collection({ collection, open, compact }: { collection: WorldCollection; open: (id: string) => void; compact: boolean }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [reset, setReset] = useState(0);
  return <section className={styles.gallerySection} aria-labelledby={`collection-${collection.id}`}>
    <div className={styles.galleryHeading}><h2 id={`collection-${collection.id}`}>{collection.title}</h2><button type="button" className={styles.resetButton} onClick={() => setReset((value) => value + 1)} aria-label={`重新摆好${collection.title}的卡片`}>↺ 复位</button></div>
    <div className={styles.scrapbook} ref={areaRef}>{collection.cards.map((card) => <ScrapbookCard key={card.id} card={card} constraints={areaRef} reset={reset} open={open} compact={compact} />)}</div>
  </section>;
}

export function WorldGallery() {
  const [compact, setCompact] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = allCards.findIndex((card) => card.id === selected);
  const card = allCards[current];
  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px), (pointer: coarse)');
    const update = () => setCompact(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function change(direction: number) { setSelected(allCards[(current + direction + allCards.length) % allCards.length].id); }
  return <>
    <p className={styles.galleryInstructions} id="gallery-instructions">{compact ? '轻触图片放大。' : '拖动右上角移动卡片，点击图片放大。'}<span className="sr-only">移动按钮支持方向键和 Home 复位；放大后按左右方向键切换，Escape 关闭。</span></p>
    {worldCollections.map((collection) => <Collection key={collection.id} collection={collection} compact={compact} open={setSelected} />)}
    <dialog ref={dialogRef} className={styles.lightbox} aria-labelledby="lightbox-title" aria-describedby="lightbox-caption" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); change(1); }
    }}>
      {card && <div className={styles.lightboxContent}>
        <div className={styles.lightboxTopline}><span>{card.kind === 'illustration' ? '原创插画 · 展示用，非个人照片' : '生活记录'}</span><button type="button" autoFocus className={styles.lightboxClose} onClick={() => setSelected(null)} aria-label="关闭图片预览">×</button></div>
        <img src={card.image} alt={card.alt} width="800" height="560" />
        <div className={styles.lightboxFooter}><div><h2 id="lightbox-title">{card.title}</h2><p id="lightbox-caption">{card.caption}</p></div><div className={styles.lightboxNavigation}><button type="button" onClick={() => change(-1)} aria-label="上一张图片">←</button><span>{current + 1} / {allCards.length}</span><button type="button" onClick={() => change(1)} aria-label="下一张图片">→</button></div></div>
      </div>}
    </dialog>
  </>;
}
