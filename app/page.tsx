import Link from 'next/link';
import { site, projects } from '@/data/site';
import { getPostSummaries } from '@/lib/posts';
import { GitHubProfile } from '@/components/github-profile';
import { ProfileDetails } from '@/components/profile-details';
import { AvatarSpark } from '@/components/avatar-spark';
import { WorldLink } from '@/components/world-transition';
import { Arrow } from '@/components/icons';
import { ProjectCard } from '@/components/project-card';
import { PostRow } from '@/components/post-row';

export default function Home() {
  const posts = getPostSummaries().slice(0, 3);
  return <>
    <section className="hero" aria-labelledby="intro-heading">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">个人主页 <span className="eyebrow-rule" /></p>
        <h1 id="intro-heading">{site.name}<span className="hero-name">{site.displayName}</span></h1>
        <p className="hero-intro">{site.role}</p>
        <ul className="hero-focus" aria-label="关注方向">{site.interests.map((interest) => <li key={interest}>{interest}</li>)}</ul>
        <div className="hero-actions">
          <Link className="button button-primary" href="/projects/">项目 <Arrow /></Link>
          <Link className="button button-text" href="/blog/">博客 <Arrow /></Link>
        </div>
      </div>
      <div className="identity-art">
        <div className="art-grid" aria-hidden="true" />
        <div className="identity-card">
          <AvatarSpark className="identity-letter">
            {site.avatar ? <img src={site.avatar} alt="sethli 标志" width="160" height="160" /> : <span>{site.initials}<b>.</b></span>}
          </AvatarSpark>
          <span className="identity-caption">{site.name}</span>
        </div>
      </div>
    </section>

    {site.experience.length > 0 && <section className="experience-section">
      <div className="section-heading"><h2>经历<span>.</span></h2></div>
      {site.experience.map((item) => <div className="experience-row" key={`${item.title}-${item.period}`}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.period}</span></div>)}
    </section>}

    <GitHubProfile />
    <ProfileDetails education={site.education} skills={site.skills} />

    <section className="home-projects" aria-labelledby="projects-heading">
      <div className="section-heading"><h2 id="projects-heading">项目<span>.</span></h2><Link className="text-link" href="/projects/">全部项目 <Arrow /></Link></div>
      <div className="projects-list">{projects.slice(0, 2).map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
    </section>

    <section className="home-posts" aria-labelledby="writing-heading">
      <div className="section-heading"><h2 id="writing-heading">最近文章<span>.</span></h2><Link className="text-link" href="/blog/">全部文章 <Arrow /></Link></div>
      <div className="post-list">{posts.map((post) => <PostRow key={post.slug} post={post} />)}</div>
    </section>

    <section className="home-collection" aria-labelledby="collection-heading">
      <div><h2 id="collection-heading">拾光<span>.</span></h2><p>图片收藏 · 目前为展示插画</p><WorldLink className="text-link">浏览收藏 <Arrow /></WorldLink></div>
      <WorldLink className="collection-art" label="浏览拾光图片收藏"><span className="collection-paper paper-back" /><span className="collection-paper paper-front"><span className="collection-sun" /><span className="collection-hill" /></span></WorldLink>
    </section>
  </>;
}
