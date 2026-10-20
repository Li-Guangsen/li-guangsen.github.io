import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { projects, learning } from '@/data/site';
import { ProjectCard } from '@/components/project-card';
import { Arrow } from '@/components/icons';
import { GitHubRepositories } from '@/components/github-repositories';

export const metadata = pageMetadata('项目', '从一个想法开始，记录正在生长的作品、实验与学习笔记。', '/projects/');

export default function ProjectsPage() {
  return <div className="inner-page"><div className="page-heading"><span className="eyebrow">THINGS I BUILD</span><h1>项目<span>.</span></h1><p>从一个想法开始，边做边学。<br />这里收录正在生长的作品与实验。</p></div><div className="collection-label"><span>SELECTED PROJECTS</span><span>{String(projects.length).padStart(2, '0')} 项作品</span></div><div className="projects-list">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div><GitHubRepositories />{learning.length > 0 && <section className="learning-section" aria-labelledby="learning-heading"><div className="section-heading"><div><span className="eyebrow">LEARN BY DOING</span><h2 id="learning-heading">学习，也是一种创造<span>.</span></h2></div></div><div className="learning-list">{learning.map((item, index) => <Link href={item.href} className="learning-card" key={item.href}><span className="learning-index">{String(index + 1).padStart(2, '0')} / FIELD STUDY</span><div><h3>{item.title}</h3><p>{item.description}</p><div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><Arrow /></Link>)}</div></section>}<div className="endnote"><span>✳</span><p>慢慢来，下一个想法已经在路上。</p></div></div>;
}
