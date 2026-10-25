import { pageMetadata } from '@/lib/page-metadata';
import { getPostSummaries } from '@/lib/posts';
import { BlogExplorer } from '@/components/blog-explorer';

export const metadata = pageMetadata('博客', '算法、开发与学习笔记。', '/blog/');

export default function BlogPage() {
  const posts = getPostSummaries();
  return <div className="inner-page blog-page textured-page"><div className="page-heading"><h1>Blog</h1><p>算法、开发与学习笔记。</p></div><BlogExplorer posts={posts} /></div>;
}
