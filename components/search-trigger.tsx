'use client';

import { useEffect, useState } from 'react';
import { SearchIcon } from './icons';
import styles from './search-trigger.module.css';

function CommandIcon() {
  return <svg className={styles.command} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="8" height="8" /><path d="M8 8H5.5A2.5 2.5 0 1 1 8 5.5V8ZM16 8V5.5A2.5 2.5 0 1 1 18.5 8H16ZM16 16h2.5a2.5 2.5 0 1 1-2.5 2.5V16ZM8 16v2.5A2.5 2.5 0 1 1 5.5 16H8Z" /></svg>;
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(`${navigator.platform} ${navigator.userAgent}`));
  }, []);

  return <button type="button" className={styles.trigger} aria-label="搜索文章（Ctrl 或 Command K）" aria-haspopup="dialog" aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'} title={`搜索文章 · ${isMac ? 'Command' : 'Ctrl'} + K`} onClick={onClick}>
    <SearchIcon />
    <span className={styles.label} lang="en">Search</span>
    <kbd className={styles.shortcut} aria-hidden="true">
      {isMac ? <CommandIcon /> : <span className={styles.modifier}>Ctrl</span>}
      <span className={styles.key}>K</span>
    </kbd>
  </button>;
}
