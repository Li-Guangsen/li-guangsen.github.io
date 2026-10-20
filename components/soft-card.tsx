'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

export function SoftCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 180, damping: 24 });
  const smoothY = useSpring(y, { stiffness: 180, damping: 24 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [1.6, -1.6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-1.6, 1.6]);
  const reducedMotion = useReducedMotion();
  return <motion.article className={`soft-card ${className}`} style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 1200 }} onPointerMove={(event) => {
    if (event.pointerType !== 'mouse' || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.article>;
}
