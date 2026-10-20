import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getPost, renderMarkdown, formatDate } from '@/lib/posts';

export const dynamicParams = false;
export function generateStaticParams() { return getPosts().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post?.title, description: post?.description, alternates: { canonical: `/blog/${slug}/` } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const html = await renderMarkdown(post.content);
  return <article className="article-page"><Link className="back-link" href="/blog/">← 返回全部文章</Link><header className="article-header"><span className="eyebrow">{post.category} / FIELD NOTES</span><h1>{post.title}</h1><p>{post.description}</p><div className="article-meta"><time dateTime={post.date}>{formatDate(post.date)}</time><span>·</span><span>{post.minutes} 分钟阅读</span>{post.sample && <span className="sample-label">示例文章</span>}</div></header>{post.sample && <aside className="sample-notice">这是一篇用于展示阅读效果的示例文章，可以替换为你的真实笔记。</aside>}<div className="prose" dangerouslySetInnerHTML={{ __html: html }} /><footer className="article-footer"><div className="tag-list">{post.tags.map((tag) => <span key={tag}># {tag}</span>)}</div><Link className="text-link" href="/blog/">继续读其他文章 →</Link></footer></article>;
}
