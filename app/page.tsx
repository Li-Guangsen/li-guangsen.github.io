import Link from 'next/link';
import { site, projects } from '@/data/site';
import { getPostSummaries } from '@/lib/posts';
import { GitHubProfile } from '@/components/github-profile';
import { ProfileDetails } from '@/components/profile-details';
import { AvatarSpark } from '@/components/avatar-spark';
import { WorldLink } from '@/components/world-transition';
import { Arrow, Asterisk } from '@/components/icons';
import { ProjectCard } from '@/components/project-card';
import { PostRow } from '@/components/post-row';

export default function Home() {
  const posts = getPostSummaries().slice(0, 3);
  return <>
    <section className="hero"><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="green-dot" /> Online <span className="eyebrow-rule" /></div><h1>写代码，<br />也写下<span className="hero-highlight">想法<span className="highlight-line" /></span>。</h1><p className="hero-intro">Hi，我是 <strong>{site.name}</strong>。<br />这里记录我做过的项目、学到的东西，还有一些随手写下的笔记。</p><div className="hero-actions"><Link className="button button-primary" href="/projects/">看看项目 <Arrow /></Link><Link className="button button-text" href="/blog/">读点笔记 <Arrow diagonal /></Link></div><div className="hero-footnote"><span>Build · Learn · Document</span><span>2026</span></div></div><div className="identity-art"><div className="art-grid" /><div className="identity-card"><div className="identity-top"><span>DEV / LEARNER</span><span>001</span></div><AvatarSpark className="identity-letter">{site.avatar ? <img src={site.avatar} alt="个人头像" /> : <span>{site.initials}<b>.</b></span>}{!site.avatar && <Asterisk className="identity-star" />}</AvatarSpark><div className="identity-bottom"><span>{site.name}</span><span>↗</span></div></div><div className="art-note"><span className="green-dot" /> CONSTANTLY EVOLVING</div><span className="art-axis axis-top">+</span><span className="art-axis axis-bottom">+</span></div></section>

    <section className="about-section" aria-labelledby="about-heading"><div className="section-index"><span className="eyebrow">About</span><h2 id="about-heading">这里是什么<span>.</span></h2></div><div className="about-copy"><h3>代码之外，还有更多值得记录的东西。</h3>{site.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="interest-list">{site.interests.map((interest) => <span key={interest}><span className="tiny-cross">→</span>{interest}</span>)}</div></div></section>

    {site.experience.length > 0 && <section className="experience-section"><div className="section-heading"><div><span className="eyebrow">EXPERIENCE</span><h2>一路走来<span>.</span></h2></div></div>{site.experience.map((item) => <div className="experience-row" key={`${item.title}-${item.period}`}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.period}</span></div>)}</section>}

    <GitHubProfile />
    <ProfileDetails education={site.education} skills={site.skills} />

    <section className="home-projects" aria-labelledby="projects-heading"><div className="section-heading"><div><span className="eyebrow">Projects</span><h2 id="projects-heading">我做过的东西<span>.</span></h2></div><Link className="text-link" href="/projects/">全部项目 <Arrow /></Link></div>{projects.slice(0, 2).map((project) => <ProjectCard key={project.slug} project={project} />)}</section>

    <section className="home-posts" aria-labelledby="writing-heading"><div className="section-heading"><div><span className="eyebrow">Writing</span><h2 id="writing-heading">最近在写<span>.</span></h2></div><Link className="text-link" href="/blog/">全部文章 <Arrow /></Link></div><div className="post-list">{posts.map((post) => <PostRow key={post.slug} post={post} />)}</div></section>

    <section className="home-collection"><div><span className="eyebrow">Collection</span><h2>也记录一些<br />屏幕之外的瞬间<span>.</span></h2><p>喜欢的风景、偶然的发现，还有值得被记住的日常片段。</p><WorldLink className="text-link">打开拾光 <Arrow diagonal /></WorldLink></div><WorldLink className="collection-art"><span className="collection-paper paper-back" /><span className="collection-paper paper-front"><span className="collection-sun" /><span className="collection-hill" /><span className="collection-caption">MOMENTS / 拾光</span></span><span className="collection-stamp">KEEP<br />THE<br />MOMENTS.</span></WorldLink></section>

    <section className="closing-note"><Asterisk /><p>每个项目都从一个小想法开始，<br /><span>每篇笔记都是学习路上的一块砖。</span></p><Link className="text-link" href="/blog/">从一篇笔记开始 <Arrow diagonal /></Link></section>
  </>;
}
