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
  return [{ column, date: day.date, label: new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) }];
});
const months = monthMarkers.filter((month, index) => index !== 0 || !monthMarkers[1] || monthMarkers[1].column - month.column >= 3);
function dayLabel(index: number) {
  const day = days[index];
  return `${day.date} · ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}`;
}

export function GitHubActivity() {
  const [focused, setFocused] = useState(days.length - 1);
  const [detail, setDetail] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const showLatest = () => { element.scrollLeft = element.scrollWidth; };
    showLatest();
    const observer = new ResizeObserver(showLatest);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'Escape') { setDetail(null); return; }
    const weekday = (index + offset) % 7;
    const targets: Record<string, number> = { ArrowLeft: index - 7, ArrowRight: index + 7, ArrowUp: index - 1, ArrowDown: index + 1, Home: index - weekday, End: index + 6 - weekday };
    if (!(event.key in targets)) return;
    event.preventDefault();
    dayRefs.current[Math.max(0, Math.min(days.length - 1, targets[event.key]))]?.focus();
  }

  return <section className={styles.activity} aria-labelledby="activity-heading" lang="en">
    <div className={styles.activityHeading}>
      <h2 id="activity-heading"><a href={`https://github.com/${activity.username}`} target="_blank" rel="noreferrer" title="View contribution activity on GitHub">GitHub Activity</a></h2>
      <time dateTime={activity.updatedAt} title={`Updated ${activity.updatedAt.slice(0, 10)} · Synced daily`}>{activity.updatedAt.slice(0, 10).replaceAll('-', '.')}</time>
    </div>
      <p id="activity-instructions" className="sr-only">Synced with GitHub, including anonymous private contributions enabled on the profile. Use arrow keys to explore dates, Home and End to move within a week, or tap a square for details.</p>
      <div className={styles.activityScroll} ref={scrollRef}>
        <div className={styles.activityChart} style={{ '--weeks': weeks } as CSSProperties}>
          <div className={styles.activityMonths} aria-hidden="true">{months.map((month) => <span key={month.date} style={{ gridColumn: `${month.column + 1} / span 3` }}>{month.label}</span>)}</div>
          <div role="group" aria-label={`${activity.total} contributions in the last year`} aria-describedby="activity-instructions" className={styles.activityGrid} onPointerLeave={() => setDetail(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDetail(null); }}>
            {cells.map((day, cellIndex) => {
              if (!day) return <span key={`empty-${cellIndex}`} aria-hidden="true" />;
              const index = cellIndex - offset;
              return <button key={day.date} type="button" ref={(element) => { dayRefs.current[index] = element; }} className={styles.activityDay} data-level={day.level} data-date={day.date} aria-label={dayLabel(index)} title={dayLabel(index)} tabIndex={focused === index ? 0 : -1} onPointerEnter={() => setDetail(index)} onClick={() => setDetail(index)} onFocus={() => { setFocused(index); setDetail(index); }} onKeyDown={(event) => navigate(event, index)} />;
            })}
          </div>
        </div>
      </div>
      <div className={styles.activityFooter}>
        <p className={styles.activityDetail} aria-live="polite">{detail === null ? <><strong>{activity.total}</strong> contributions in the last year</> : dayLabel(detail)}</p>
        <div className={styles.activityLegend} aria-label="Contribution intensity from less to more"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} aria-hidden="true" />)}<span>More</span></div>
      </div>
  </section>;
}
