import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { projects, learning } from '@/data/site';
import { ProjectCard } from '@/components/project-card';
import { Arrow } from '@/components/icons';
import { GitHubRepositories } from '@/components/github-repositories';

export const metadata = pageMetadata('项目', '个人项目、源码和学习记录。', '/projects/');

export default function ProjectsPage() {
  return <div className="inner-page textured-page">
    <div className="page-heading"><h1>项目</h1><p>个人项目与公开仓库。</p></div>
    <div className="projects-list">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
    <GitHubRepositories />
    {learning.length > 0 && <section className="learning-section" aria-labelledby="learning-heading">
      <div className="section-heading"><h2 id="learning-heading">Learning</h2></div>
      <div className="learning-list">{learning.map((item) => <Link href={item.href} className="learning-card" key={item.href}><div><h3>{item.title}</h3><p>{item.description}</p><div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><Arrow /></Link>)}</div>
    </section>}
  </div>;
}
