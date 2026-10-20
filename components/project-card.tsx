import Link from 'next/link';
import type { Project } from '@/data/site';
import { Arrow, Asterisk } from './icons';

export function ProjectVisual() {
  return <div className="project-visual" aria-hidden="true"><span className="visual-corner">01 / PERSONAL SPACE</span><div className="mini-window"><div className="mini-toolbar"><i /><i /><i /><span>sethli.tech</span></div><div className="mini-content"><span className="mini-greeting">HELLO, WORLD.</span><div className="mini-title">Small ideas.<br />A space of their own.</div><div className="mini-lines"><i /><i /></div><div className="mini-button">EXPLORE <span>↗</span></div><Asterisk className="mini-flower" /></div></div><span className="visual-bottom">DESIGNED TO KEEP GROWING.</span></div>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <Link href={`/projects/${project.slug}/`} className="project-card"><ProjectVisual /><div className="project-description"><div className="project-topline"><span className="eyebrow">{project.eyebrow}</span><span className="status-label"><span className="green-dot" />{project.status}</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="project-link">了解这个项目 <Arrow /></span></div></Link>;
}
