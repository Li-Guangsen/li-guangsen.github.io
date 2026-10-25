'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion, useDragControls, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { worldCollections, type WorldCard, type WorldCollection } from '@/data/world';
import styles from './showcase.module.css';

const allCards = worldCollections.flatMap((collection) => collection.cards);

function ScrapbookCard({ card, constraints, reset, open, compact }: { card: WorldCard; constraints: React.RefObject<HTMLDivElement | null>; reset: number; open: (id: string) => void; compact: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useDragControls();
  const reduced = useReducedMotion();
  const [moving, setMoving] = useState(false);
  const bounds = useRef<DOMRect | null>(null);
  const rotateX = useSpring(0, { stiffness: 240, damping: 26, mass: .5 });
  const rotateY = useSpring(0, { stiffness: 240, damping: 26, mass: .5 });
  useEffect(() => { x.set(0); y.set(0); rotateX.jump(0); rotateY.jump(0); bounds.current = null; }, [reset, compact, reduced, x, y, rotateX, rotateY]);
  useEffect(() => {
    const reset = () => { bounds.current = null; rotateX.set(0); rotateY.set(0); };
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset);
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('scroll', reset); window.removeEventListener('resize', reset); window.removeEventListener('blur', reset); };
  }, [rotateX, rotateY]);

  function resetTilt() { bounds.current = null; rotateX.set(0); rotateY.set(0); }
  function tilt(event: PointerEvent<HTMLElement>) {
    if (compact || reduced || moving || event.pointerType !== 'mouse') return;
    const box = bounds.current ??= event.currentTarget.getBoundingClientRect();
    const horizontal = Math.max(-.5, Math.min(.5, (event.clientX - box.left) / box.width - .5));
    const vertical = Math.max(-.5, Math.min(.5, (event.clientY - box.top) / box.height - .5));
    rotateX.set(-vertical * 10);
    rotateY.set(horizontal * 10);
  }

  function moveWithKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const delta: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
    if (event.key === 'Home') { event.preventDefault(); x.set(0); y.set(0); return; }
    if (!delta[event.key] || compact) return;
    event.preventDefault();
    // Keep keyboard movement within the surrounding scrapbook margin.
    x.set(Math.min(40, Math.max(-40, x.get() + delta[event.key][0])));
    y.set(Math.min(40, Math.max(-40, y.get() + delta[event.key][1])));
  }

  return <motion.article className={styles.scrapCard} style={{ x, y, rotateX, rotateY, transformPerspective: 800, rotate: compact || reduced ? 0 : card.rotation, zIndex: moving ? 5 : 1 }} drag={!compact && !reduced} dragControls={controls} dragListener={false} dragConstraints={constraints} dragElastic={0.08} dragMomentum={false} onDragStart={() => { setMoving(true); resetTilt(); }} onDragEnd={() => { setMoving(false); resetTilt(); }} onPointerMove={tilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt} whileHover={!reduced && !compact ? { rotate: 0, scale: 1.02 } : undefined} whileDrag={{ scale: 1.03, rotate: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26, mass: .5 }}>
    <div className={styles.cardTopline}><span>{card.kind === 'illustration' ? '展示插画' : '生活记录'}</span><button type="button" className={styles.dragHandle} aria-label={`移动“${card.title}”，方向键移动，Home 复位`} aria-describedby="gallery-instructions" onKeyDown={moveWithKeys} onPointerDown={(event) => { if (!compact && !reduced) controls.start(event); }} disabled={compact || Boolean(reduced)} title="拖动，或用方向键移动">⠿</button></div>
    <button type="button" className={styles.cardImageButton} onClick={() => open(card.id)} aria-label={`放大查看：${card.title}`}>
      <img src={card.image} width="800" height="560" alt={card.alt} style={{ objectPosition: card.imagePosition }} loading="lazy" draggable="false" />
      <span className={styles.expandHint} aria-hidden="true">↗</span>
    </button>
    <div className={styles.cardCaption}><h3>{card.title}</h3><p>{card.caption}</p></div>
    <span className={styles.cardGlare} aria-hidden="true" />
  </motion.article>;
}

function Collection({ collection, open, compact }: { collection: WorldCollection; open: (id: string) => void; compact: boolean }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [reset, setReset] = useState(0);
  return <section className={styles.gallerySection} aria-labelledby={`collection-${collection.id}`}>
    <div className={styles.galleryHeading}><h2 id={`collection-${collection.id}`}>{collection.title}</h2><button type="button" className={styles.resetButton} onClick={() => setReset((value) => value + 1)} aria-label={`重新摆好${collection.title}的卡片`}>↺ Reset</button></div>
    <div className={styles.scrapbook} ref={areaRef}>{collection.cards.map((card) => <ScrapbookCard key={card.id} card={card} constraints={areaRef} reset={reset} open={open} compact={compact} />)}</div>
  </section>;
}

export function WorldGallery() {
  const [compact, setCompact] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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
    if (previewOpen && !dialog.open) dialog.showModal();
    if (!previewOpen && dialog.open) dialog.close();
  }, [previewOpen]);
  useEffect(() => {
    if (!previewOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [previewOpen]);

  function change(direction: number) { setSelected(allCards[(current + direction + allCards.length) % allCards.length].id); }
  return <>
    <p className={styles.galleryInstructions} id="gallery-instructions">{compact ? 'Tap to explore.' : 'Drag the handle. Click to explore.'}<span className="sr-only">移动按钮支持方向键和 Home 复位；放大后按左右方向键切换，Escape 关闭。</span></p>
    {worldCollections.map((collection) => <Collection key={collection.id} collection={collection} compact={compact} open={(id) => { setSelected(id); setPreviewOpen(true); }} />)}
    <dialog ref={dialogRef} className={`${styles.lightbox} gallery-lightbox`} aria-labelledby="lightbox-title" aria-describedby="lightbox-caption" onClose={() => setPreviewOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false); }} onKeyDown={(event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); change(1); }
    }}>
      {card && <div className={styles.lightboxContent}>
        <div className={styles.lightboxTopline}><span>{card.kind === 'illustration' ? '原创插画 · 展示用，非个人照片' : '生活记录'}</span><button type="button" autoFocus className={styles.lightboxClose} onClick={() => setPreviewOpen(false)} aria-label="关闭图片预览">×</button></div>
        <img key={card.id} src={card.image} alt={card.alt} width="800" height="560" />
        <div className={styles.lightboxFooter}><div><h2 id="lightbox-title">{card.title}</h2><p id="lightbox-caption">{card.caption}</p></div><div className={styles.lightboxNavigation}><button type="button" onClick={() => change(-1)} aria-label="上一张图片">←</button><span>{current + 1} / {allCards.length}</span><button type="button" onClick={() => change(1)} aria-label="下一张图片">→</button></div></div>
      </div>}
    </dialog>
  </>;
}
