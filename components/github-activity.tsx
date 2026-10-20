'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import activity from '@/data/github-activity.json';
import styles from './github-activity.module.css';

const days = activity.days;
const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
const weeks = Math.ceil((days.length + offset) / 7);
const cells = Array.from({ length: weeks * 7 }, (_, index) => days[index - offset] ?? null);
const monthMarkers = days.flatMap((day, index) => {
  const column = Math.floor((index + offset) / 7);
  if ((index !== 0 && !day.date.endsWith('-01')) || column > weeks - 3) return [];
  return [{ column, date: day.date, label: `${Number(day.date.slice(5, 7))}月` }];
});
const months = monthMarkers.filter((month, index) => index !== 0 || !monthMarkers[1] || monthMarkers[1].column - month.column >= 3);
function dayLabel(index: number) {
  const day = days[index];
  return `${day.date} · ${day.count} 次贡献`;
}

export function GitHubActivity() {
  const [focused, setFocused] = useState(days.length - 1);
  const [detail, setDetail] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollLeft = el.scrollWidth; }, []);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'Escape') { setDetail(null); return; }
    const weekday = (index + offset) % 7;
    const targets: Record<string, number> = { ArrowLeft: index - 7, ArrowRight: index + 7, ArrowUp: index - 1, ArrowDown: index + 1, Home: index - weekday, End: index + 6 - weekday };
    if (!(event.key in targets)) return;
    event.preventDefault();
    dayRefs.current[Math.max(0, Math.min(days.length - 1, targets[event.key]))]?.focus();
  }

  return <section className={styles.activity} aria-labelledby="activity-heading">
    <div className={styles.activityHeading}>
      <h3 id="activity-heading">GitHub Activity</h3>
      <time dateTime={activity.updatedAt} title={`公开贡献数据更新于 ${activity.updatedAt.slice(0, 10)}`}>{activity.updatedAt.slice(0, 10).replaceAll('-', '.')}</time>
    </div>
      <p id="activity-instructions" className="sr-only">过去一年的 GitHub 公开贡献记录。按方向键切换日期，Home 和 End 跳到本周起止日期。也可以点击或轻触方格查看贡献次数。</p>
      <div className={styles.activityScroll} ref={scrollRef}>
        <div className={styles.activityChart} style={{ '--weeks': weeks } as CSSProperties}>
          <div className={styles.activityMonths} aria-hidden="true">{months.map((month) => <span key={month.date} style={{ gridColumn: `${month.column + 1} / span 3` }}>{month.label}</span>)}</div>
          <div role="group" aria-label={`过去一年 ${activity.total} 次 GitHub 公开贡献`} aria-describedby="activity-instructions" className={styles.activityGrid} onPointerLeave={() => setDetail(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDetail(null); }}>
            {cells.map((day, cellIndex) => {
              if (!day) return <span key={`empty-${cellIndex}`} aria-hidden="true" />;
              const index = cellIndex - offset;
              return <button key={day.date} type="button" ref={(element) => { dayRefs.current[index] = element; }} className={styles.activityDay} data-level={day.level} data-date={day.date} aria-label={dayLabel(index)} title={dayLabel(index)} tabIndex={focused === index ? 0 : -1} onPointerEnter={() => setDetail(index)} onClick={() => setDetail(index)} onFocus={() => { setFocused(index); setDetail(index); }} onKeyDown={(event) => navigate(event, index)} />;
            })}
          </div>
        </div>
      </div>
      <div className={styles.activityFooter}>
        <p className={styles.activityDetail} aria-live="polite">{detail === null ? <>过去一年 <strong>{activity.total}</strong> 次公开贡献</> : dayLabel(detail)}</p>
        <div className={styles.activityLegend} aria-label="颜色从浅到深表示贡献从少到多"><span>少</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} aria-hidden="true" />)}<span>多</span></div>
      </div>
  </section>;
}
