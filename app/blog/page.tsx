import { pageMetadata } from '@/lib/page-metadata';
import { getPostSummaries } from '@/lib/posts';
import { BlogExplorer } from '@/components/blog-explorer';

export const metadata = pageMetadata('博客', '学习笔记、实践记录和一些未完待续的想法。', '/blog/');

export default function BlogPage() {
  const posts = getPostSummaries();
  return <div className="inner-page blog-page"><div className="page-heading"><span className="eyebrow">NOTES ALONG THE WAY</span><h1>写下来<span>.</span></h1><p>学习笔记、实践记录，和一些未完待续的想法。<br />让每一次探索，都留下点什么。</p></div><BlogExplorer posts={posts} /><div className="endnote"><span>✳</span><p>文字会慢慢长出来。</p></div></div>;
}
