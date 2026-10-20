import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/data/site';
import { ProjectVisual } from '@/components/project-card';
import { Arrow } from '@/components/icons';

export const dynamicParams = false;
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.title, description: project?.description, alternates: { canonical: `/projects/${slug}/` } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <article className="inner-page project-detail"><Link className="back-link" href="/projects/">← 返回项目</Link><div className="page-heading"><span className="eyebrow">{project.eyebrow} / {project.year}</span><h1>{project.title}<span>.</span></h1><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><ProjectVisual /><div className="detail-body"><div className="detail-summary"><span className="eyebrow">PROJECT NOTES</span><span className="status-label"><span className="green-dot" />{project.status}</span></div><div className="prose"><h2>为什么做这个网站</h2><p>一个独立的个人空间，可以把作品、笔记和想法放在一起。页面保持简洁，让内容成为主角，也方便日后持续更新。</p><h2>这一版包含什么</h2><ul><li>个人首页：简介、项目和最近文章。</li><li>项目展示：记录每个作品的背景与实现。</li><li>技术博客：分类、搜索和独立文章页面。</li><li>阅读体验：浅色与深色模式、手机布局和键盘导航。</li></ul><h2>如何持续更新</h2><p>文章保存在 Markdown 文件中，个人资料集中维护。网站构建后生成静态文件，可以部署到自己的服务器。</p><p>当前版本是这个空间的起点。后续会逐步加入真实的个人介绍和项目记录。</p><Link href="/blog/building-a-personal-space/">阅读建站笔记 →</Link></div></div>{project.github && <a className="button button-primary" href={project.github} target="_blank" rel="noreferrer">查看源码 <Arrow diagonal /></a>}{project.url && <a className="button button-text" href={project.url} target="_blank" rel="noreferrer">访问项目 <Arrow diagonal /></a>}</article>;
}
