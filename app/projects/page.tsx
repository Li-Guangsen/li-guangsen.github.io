import type { Metadata } from 'next';
import { projects } from '@/data/site';
import { ProjectCard } from '@/components/project-card';

export const metadata: Metadata = { title: '项目', alternates: { canonical: '/projects/' } };

export default function ProjectsPage() {
  return <div className="inner-page"><div className="page-heading"><span className="eyebrow">THINGS I BUILD</span><h1>项目<span>.</span></h1><p>从一个想法开始，边做边学。<br />这里收录正在生长的作品与实验。</p></div><div className="collection-label"><span>SELECTED PROJECTS</span><span>{String(projects.length).padStart(2, '0')} 项作品</span></div><div className="projects-list">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div><div className="endnote"><span>✳</span><p>慢慢来，下一个想法已经在路上。</p></div></div>;
}
