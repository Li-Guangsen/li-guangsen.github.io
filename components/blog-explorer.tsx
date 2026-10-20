'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PostSummary } from '@/lib/posts';
import { blogFilterHref, matchesPost, paginatePosts, readBlogFilters, type BlogFilters } from '@/lib/post-filters';
import { PostRow } from './post-row';
import { SearchIcon } from './icons';

const initialFilters: BlogFilters = { query: '', category: '', tag: '', page: 1 };

export function BlogExplorer({ posts }: { posts: PostSummary[] }) {
  const [filters, setFilters] = useState(initialFilters);
  useEffect(() => {
    const read = () => setFilters(readBlogFilters(window.location.search));
    read(); window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const categories = useMemo(() => [...new Set(posts.flatMap((post) => post.categories.length ? post.categories : [post.category]))].sort((a, b) => a.localeCompare(b, 'zh-CN')), [posts]);
  const filtered = useMemo(() => posts.filter((post) => matchesPost(post, filters.query, filters.category, filters.tag)), [posts, filters]);
  const pagination = paginatePosts(filtered, filters.page);

  function update(patch: Partial<BlogFilters>, replace = false) {
    const next = { ...filters, page: 1, ...patch };
    setFilters(next);
    window.history[replace ? 'replaceState' : 'pushState'](null, '', blogFilterHref(next));
  }

  return <>
    <div className="blog-tools"><div className="filter-list" aria-label="文章分类">{['', ...categories].map((category) => <button key={category} type="button" onClick={() => update({ category })} aria-pressed={filters.category === category} className={filters.category === category ? 'selected' : ''}>{category || '全部'}{!category && <span>{posts.length}</span>}</button>)}</div><label className="search-field"><SearchIcon /><input type="search" placeholder="搜索文章…" aria-label="搜索文章" value={filters.query} onChange={(event) => update({ query: event.target.value }, true)} /></label></div>
    <div className="blog-list-meta"><span aria-live="polite">{filtered.length} 篇笔记{filters.category && ` / ${filters.category}`}{filters.tag && <button type="button" className="active-tag" onClick={() => update({ tag: '' })} aria-label={`清除标签 ${filters.tag}`}># {filters.tag} ×</button>}</span><span>按置顶与日期排列</span></div>
    <div className="post-list">{pagination.posts.map((post) => <PostRow key={post.slug} post={post} />)}</div>
    {filtered.length === 0 && <div className="empty-state"><span>没有找到相关文章</span><p>试试其他关键词，或回到全部文章。</p><button type="button" className="text-button" onClick={() => update(initialFilters)}>查看全部文章 →</button></div>}
    {pagination.totalPages > 1 && <nav className="blog-pagination" aria-label="文章分页"><button type="button" disabled={pagination.page === 1} onClick={() => update({ page: pagination.page - 1 })}>← 上一页</button><div>{Array.from({ length: pagination.totalPages }, (_, index) => index + 1).filter((page) => page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1).map((page, index, pages) => <span key={page}>{index > 0 && page - pages[index - 1] > 1 && <span className="pagination-gap">…</span>}<button type="button" aria-label={`第 ${page} 页`} aria-current={pagination.page === page ? 'page' : undefined} onClick={() => update({ page })}>{page}</button></span>)}</div><button type="button" disabled={pagination.page === pagination.totalPages} onClick={() => update({ page: pagination.page + 1 })}>下一页 →</button></nav>}
  </>;
}
