import Link from 'next/link';
import { site, type Project } from '@/data/site';
import { Arrow, Asterisk } from './icons';

export function ProjectVisual({ project }: { project?: Project }) {
  if (project?.image) return <div className="project-visual has-cover" aria-hidden="true"><img src={project.image} alt="" loading="lazy" /></div>;
  return <div className="project-visual" aria-hidden="true"><span className="visual-corner">PERSONAL WEBSITE</span><div className="mini-window"><div className="mini-toolbar"><i /><i /><i /><span>{site.name}</span></div><div className="mini-content"><span className="mini-greeting">PROJECTS / NOTES</span><div className="mini-title">{site.name}<span>.</span></div><div className="mini-lines"><i /><i /></div><div className="mini-button">PROJECTS <span>↗</span></div><Asterisk className="mini-flower" /></div></div></div>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card"><Link href={`/projects/${project.slug}/`} className="project-visual-link" aria-label={`查看项目：${project.title}`}><ProjectVisual project={project} /></Link><div className="project-description"><div className="project-topline"><span className="eyebrow">{project.eyebrow}</span><span className="status-label"><span className="green-dot" />{project.status}</span></div><h3><Link href={`/projects/${project.slug}/`}>{project.title}</Link></h3><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-actions"><Link href={`/projects/${project.slug}/`} className="project-link">详情 <Arrow /></Link>{project.github && <a href={project.github} className="project-link" target="_blank" rel="noopener noreferrer">源码 <Arrow diagonal /></a>}{project.url && <a href={project.url} className="project-link" target="_blank" rel="noopener noreferrer">访问 <Arrow diagonal /></a>}</div></div></article>;
}
