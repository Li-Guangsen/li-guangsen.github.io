import Link from 'next/link';
import { site, type Project } from '@/data/site';
import { Arrow } from './icons';
import { GitHubIcon } from './social-icons';
import { PointerCard } from './pointer-card';

export function ProjectVisual({ project }: { project?: Project }) {
  return <div className={`project-visual${project?.image ? ' has-cover' : ''}`} aria-hidden="true"><img src={project?.image || project?.icon || site.avatar} alt="" width="128" height="128" loading="lazy" /></div>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <PointerCard className="project-card">
    <div className="project-card-header">
      <Link href={`/projects/${project.slug}/`} aria-label={`查看项目：${project.title}`}><img className="project-icon" src={project.icon || project.image || site.avatar} alt="" width="56" height="56" /></Link>
      <div><h3><Link href={`/projects/${project.slug}/`}>{project.title}</Link></h3><p>{project.eyebrow}</p></div>
    </div>
    <div className="project-description"><p>{project.description}</p><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    <div className="project-actions">
      {project.github && <a href={project.github} className="button button-primary" target="_blank" rel="noopener noreferrer"><GitHubIcon />View on GitHub <Arrow diagonal /></a>}
      <Link href={`/projects/${project.slug}/`} className="project-link">详情 <Arrow /></Link>
      {project.url && <a href={project.url} className="project-link" target="_blank" rel="noopener noreferrer">访问 <Arrow diagonal /></a>}
    </div>
  </PointerCard>;
}
