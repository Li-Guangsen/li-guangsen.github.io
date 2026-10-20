'use client';

import { useId, useMemo, useState } from 'react';
import styles from './reading.module.css';

const values = [2, 5, 8, 12, 16, 23, 38, 56, 72];
type Step = { left: number; right: number; middle: number; message: string; done: boolean; found: boolean };

function searchSteps(target: number): Step[] {
  const steps: Step[] = [];
  let left = 0;
  let right = values.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const value = values[middle];
    const found = value === target;
    steps.push({ left, right, middle, found, done: found, message: found
      ? `中点下标 ${middle} 的值为 ${value}，找到目标。`
      : `检查下标 ${middle}：${value} ${value < target ? '小于' : '大于'} ${target}，下一步保留${value < target ? '右' : '左'}半区间。` });
    if (found) return steps;
    if (value < target) left = middle + 1;
    else right = middle - 1;
  }
  steps.push({ left, right, middle: -1, done: true, found: false, message: `搜索区间为空，数组中没有 ${target}。` });
  return steps;
}

/** An original, deliberately small MDX component: no external charting runtime. */
export function AlgorithmSteps() {
  const [target, setTarget] = useState(23);
  const [position, setPosition] = useState(0);
  const selectId = useId();
  const steps = useMemo(() => searchSteps(target), [target]);
  const step = steps[position];

  return <section className={styles.algorithm} aria-label="二分查找交互演示">
    <div className={styles.demoHeader}>
      <div><span className={styles.railLabel}>SMALL EXPERIMENT / 01</span><h3>把搜索过程慢慢展开</h3></div>
      <label htmlFor={selectId}>寻找 <select id={selectId} value={target} onChange={(event) => { setTarget(Number(event.target.value)); setPosition(0); }}>
        <option value={23}>23</option><option value={2}>2</option><option value={72}>72</option><option value={20}>20（不存在）</option>
      </select></label>
    </div>
    <p className={styles.demoIntro}>有序数组，每次排除一半候选。选择目标，再逐步观察区间如何收缩。</p>
    <ol className={styles.array} aria-label="数组与当前搜索范围">
      {values.map((value, index) => <li key={index} data-in-range={index >= step.left && index <= step.right} data-middle={index === step.middle} data-found={step.found && index === step.middle}>
        <span className={styles.arrayIndex}>{index}</span><strong>{value}</strong>
        <span className={styles.arrayMarker}>{index === step.middle ? (step.found ? '找到' : 'mid') : index === step.left ? 'left' : index === step.right ? 'right' : '\u00a0'}</span>
      </li>)}
    </ol>
    <div className={styles.demoStatus} aria-live="polite" aria-atomic="true"><span>0{position + 1} / 0{steps.length}</span><p>{step.message}</p></div>
    <div className={styles.demoControls}>
      <button type="button" onClick={() => setPosition(0)} disabled={position === 0}>重新开始</button>
      <div><button type="button" onClick={() => setPosition((value) => value - 1)} disabled={position === 0}>← 上一步</button>
        <button type="button" className={styles.nextStep} onClick={() => setPosition((value) => value + 1)} disabled={position === steps.length - 1}>下一步 →</button></div>
    </div>
    <p className={styles.demoFootnote}>下标从 0 开始；当前区间为 [{step.left}, {step.right}]。时间复杂度 O(log n)，空间复杂度 O(1)。</p>
  </section>;
}
