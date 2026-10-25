'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { PostSummary } from '@/lib/posts';
import { matchesPost } from '@/lib/post-filters';
import { SearchIcon } from './icons';

const SearchContext = createContext<{ openSearch: () => void } | null>(null);
export function useSiteSearch() { return useContext(SearchContext); }

export function SiteSearchProvider({ posts, children }: { posts: PostSummary[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const resultId = useId();
  const results = useMemo(() => posts.filter((post) => matchesPost(post, query)), [posts, query]);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value); }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) { if (dialog.open) dialog.close(); return; }
    setQuery(''); setSelected(0); dialog.showModal(); inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => { listRef.current?.querySelector(`[data-result="${selected}"]`)?.scrollIntoView({ block: 'nearest' }); }, [selected]);
  function close() { dialogRef.current?.close(); setOpen(false); }
  function navigate(index: number) { const post = results[index]; if (post) { close(); router.push(`/blog/${post.slug}/`); } }

  return <SearchContext.Provider value={{ openSearch: () => setOpen(true) }}>
    {children}
    <dialog ref={dialogRef} className="site-search-dialog" aria-label="搜索文章" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => setOpen(false)} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="search-dialog-inner">
        <div className="search-dialog-heading"><span className="eyebrow">SEARCH</span><button type="button" onClick={close} aria-label="关闭搜索">Close <kbd>Esc</kbd></button></div>
        <div className="search-dialog-input"><SearchIcon /><input ref={inputRef} type="search" placeholder="Search articles…" aria-label="搜索关键词" role="combobox" aria-expanded={open} aria-controls={resultId} aria-autocomplete="list" aria-activedescendant={results[selected] ? `${resultId}-${selected}` : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); setSelected((value) => Math.max(0, Math.min(value + 1, results.length - 1))); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setSelected((value) => Math.max(0, value - 1)); }
          if (event.key === 'Enter') { event.preventDefault(); navigate(selected); }
        }} autoComplete="off" /></div>
        <p className="search-result-count" aria-live="polite" lang="en">{query.trim() ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Search by title, topic or tag'}</p>
        <ul id={resultId} ref={listRef} role="listbox" aria-label="搜索结果" className="search-results">
          {results.map((post, index) => <li key={post.slug} id={`${resultId}-${index}`} role="option" aria-selected={selected === index} data-result={index} className={selected === index ? 'is-selected' : ''}>
            <Link href={`/blog/${post.slug}/`} onClick={close} onFocus={() => setSelected(index)}><div><span className="search-result-category">{post.category}</span><strong>{post.title}</strong><p>{post.description}</p></div><span aria-hidden="true">↗</span></Link>
          </li>)}
        </ul>
        {results.length === 0 && <div className="search-no-results" lang="en"><span>No results</span><p>Try another keyword or browse<a href="/blog/" onClick={close}>all articles</a>.</p></div>}
        <div className="search-dialog-footer" lang="en"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
      </div>
    </dialog>
  </SearchContext.Provider>;
}
