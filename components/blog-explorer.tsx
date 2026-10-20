'use client';

import { useMemo, useState } from 'react';
import type { Post } from '@/lib/posts';
import { PostRow } from './post-row';
import { SearchIcon } from './icons';

export function BlogExplorer({ posts }: { posts: Omit<Post, 'content'>[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const categories = ['全部', ...new Set(posts.map((post) => post.category))];
  const filtered = useMemo(() => posts.filter((post) => {
    const matchCategory = category === '全部' || post.category === category;
    const matchQuery = [post.title, post.description, ...post.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase());
    return matchCategory && matchQuery;
  }), [posts, category, query]);

  return <><div className="blog-tools"><div className="filter-list" aria-label="文章分类">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? 'selected' : ''}>{item}{item === '全部' && <span>{posts.length}</span>}</button>)}</div><label className="search-field"><SearchIcon /><input type="search" placeholder="搜索文章…" aria-label="搜索文章" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div><p className="sr-only" aria-live="polite">找到 {filtered.length} 篇文章</p><div className="post-list">{filtered.map((post) => <PostRow key={post.slug} post={post} />)}</div>{filtered.length === 0 && <div className="empty-state"><span>没有找到相关文章</span><p>试试其他关键词，或回到全部文章。</p><button type="button" className="text-button" onClick={() => { setQuery(''); setCategory('全部'); }}>查看全部文章 →</button></div>}</>;
}
