import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesPost, readBlogFilters, blogFilterHref, paginatePosts } from '../lib/post-filters.ts';
import type { PostSummary } from '../lib/posts.ts';

const post: PostSummary = {
  slug: 'binary-search', title: '二分查找：把区间慢慢缩小', description: '学习 loop invariant 和复杂度分析。',
  date: '2026-10-20', category: '算法', categories: ['算法', 'agent'], tags: ['Python', '学习记录'],
  published: true, pinned: true, toc: true, minutes: 3, sample: true,
};

test('search combines words across title, description, tags and categories', () => {
  assert.equal(matchesPost(post, '二分 PYTHON'), true);
  assert.equal(matchesPost(post, 'invariant agent'), true);
  assert.equal(matchesPost(post, 'ＰＹＴＨＯＮ'), true);
  assert.equal(matchesPost(post, '不存在的关键词'), false);
  assert.equal(matchesPost(post, '   '), true);
});

test('category and exact tag filters can be combined with search', () => {
  assert.equal(matchesPost(post, '二分', 'AGENT', 'python'), true);
  assert.equal(matchesPost(post, '二分', '随笔'), false);
  assert.equal(matchesPost(post, '', '', 'Py'), false);
});

test('shared URLs round-trip Chinese categories, tags and special query characters', () => {
  const state = { query: 'C++ & 二分', category: '算法', tag: 'Python', page: 2 };
  const href = blogFilterHref(state);
  assert.deepEqual(readBlogFilters(new URL(href, 'https://example.com').search), state);
  assert.equal(blogFilterHref({ query: ' ', category: '', tag: '', page: 1 }), '/blog/');
});

test('malformed or missing page parameters safely resolve to the first page', () => {
  for (const page of ['', '0', '-5', 'NaN', '1.5', 'Infinity', '999999999999999999999']) {
    assert.equal(readBlogFilters(`?page=${page}`).page, 1);
  }
});

test('pagination covers each item once and clamps stale page URLs', () => {
  const posts = Array.from({ length: 23 }, (_, index) => index);
  assert.deepEqual(paginatePosts(posts, 1).posts, posts.slice(0, 10));
  assert.deepEqual(paginatePosts(posts, 2).posts, posts.slice(10, 20));
  const last = paginatePosts(posts, 999);
  assert.equal(last.page, 3);
  assert.equal(last.totalPages, 3);
  assert.deepEqual(last.posts, [20, 21, 22]);
  assert.deepEqual(paginatePosts([], 5), { page: 1, totalPages: 1, posts: [] });
});
