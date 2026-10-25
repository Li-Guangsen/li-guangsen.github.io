import { PointerCard } from './pointer-card';
import type { PostSummary } from '@/lib/posts';
import { Arrow } from './icons';

export function PostRow({ post }: { post: PostSummary }) {
  const labels = [...new Set([...post.tags, ...post.categories])];
  return <PointerCard href={`/blog/${post.slug}/`} className="post-row">
    <div className="post-labels">
      {post.pinned && <span className="pinned-label">置顶</span>}
      {post.sample && <span className="sample-label">示例</span>}
      {labels.map((label) => <span key={label}>{label}</span>)}
    </div>
    <div className="post-text"><h3>{post.title}</h3><p>{post.description}</p></div>
    <div className="post-bottom"><time dateTime={post.date}>{post.date}</time><span className="post-read" lang="en">{post.minutes} min read <Arrow /></span></div>
  </PointerCard>;
}
