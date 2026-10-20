import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { Arrow } from './icons';

export function PostRow({ post }: { post: Omit<Post, 'content'> }) {
  return <Link href={`/blog/${post.slug}/`} className="post-row"><time dateTime={post.date}>{post.date.replaceAll('-', '.')}</time><div className="post-text"><div className="post-title-line"><h3>{post.title}</h3>{post.sample && <span className="sample-label">示例</span>}</div><p>{post.description}</p><div className="post-mobile-meta">{post.category}<span>·</span>{post.minutes} 分钟阅读</div></div><span className="post-category">{post.category}</span><Arrow className="post-arrow" /></Link>;
}
