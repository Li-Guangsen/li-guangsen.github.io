import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/data/site';
import { ProjectVisual } from '@/components/project-card';
import { Arrow } from '@/components/icons';
import { pageMetadata } from '@/lib/page-metadata';

export const dynamicParams = false;
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return pageMetadata(project.title, project.description, `/projects/${slug}/`);
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const notes = project.notes || [{ title: '关于这个项目', paragraphs: [project.description] }];
  return <article className="inner-page project-detail">
    <Link className="back-link" href="/projects/">← 返回项目</Link>
    <div className="page-heading"><h1>{project.title}</h1><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    <ProjectVisual project={project} />
    <div className="detail-body"><div className="detail-summary"><span className="eyebrow">PROJECT NOTES</span><span className="status-label"><span className="green-dot" />{project.status}</span></div><div className="prose">{notes.map((note) => <section key={note.title}><h2>{note.title}</h2>{note.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{note.items && <ul>{note.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}</div></div>
    <div className="project-actions">{project.github && <a className="button button-primary" href={project.github} target="_blank" rel="noopener noreferrer">查看源码 <Arrow diagonal /></a>}{project.url && <a className="button button-text" href={project.url} target="_blank" rel="noopener noreferrer">访问项目 <Arrow diagonal /></a>}</div>
  </article>;
}
