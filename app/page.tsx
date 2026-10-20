import Link from 'next/link';
import { site, projects } from '@/data/site';
import { getPostSummaries } from '@/lib/posts';
import { GitHubActivity } from '@/components/github-activity';
import { AvatarSpark } from '@/components/avatar-spark';
import { WorldLink } from '@/components/world-transition';
import { Arrow, Asterisk } from '@/components/icons';
import { ProjectCard } from '@/components/project-card';
import { PostRow } from '@/components/post-row';

export default function Home() {
  const posts = getPostSummaries().slice(0, 3);
  return <>
    <section className="hero"><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="green-dot" /> HELLO, WORLD. <span className="eyebrow-rule" /></div><h1>把想法写下来，<br />把作品<span className="hero-highlight">做出来<span className="highlight-line" /></span>。</h1><p className="hero-intro">你好，欢迎来到 <strong>{site.name}</strong>。<br />一个用来记录、探索和分享的个人空间。</p><div className="hero-actions"><Link className="button button-primary" href="/projects/">探索项目 <Arrow /></Link><Link className="button button-text" href="/blog/">翻翻我的笔记 <Arrow diagonal /></Link></div><div className="hero-footnote"><span>记录 · 创造 · 保持好奇</span><span>EST. 2026</span></div></div><div className="identity-art"><div className="art-grid" /><div className="identity-card"><div className="identity-top"><span>PERSONAL SPACE</span><span>001</span></div><AvatarSpark className="identity-letter">{site.avatar ? <img src={site.avatar} alt="个人头像" /> : <span>{site.initials}<b>.</b></span>}<Asterisk className="identity-star" /></AvatarSpark><div className="identity-bottom"><span>{site.name}</span><span>↗</span></div></div><div className="art-note"><span className="green-dot" /> ALWAYS A WORK IN PROGRESS</div><span className="art-axis axis-top">+</span><span className="art-axis axis-bottom">+</span></div></section>

    <section className="about-section" aria-labelledby="about-heading"><div className="section-index"><span className="eyebrow">01 / ABOUT</span><h2 id="about-heading">关于这里<span>.</span></h2></div><div className="about-copy"><h3>给想法一个落脚的地方。</h3>{site.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="interest-list">{site.interests.map((interest) => <span key={interest}><span className="tiny-cross">+</span>{interest}</span>)}</div>{site.preview && <p className="preview-note">初版预览 · 个人简介待补充</p>}</div></section>

    {site.experience.length > 0 && <section className="experience-section"><div className="section-heading"><div><span className="eyebrow">EXPERIENCE</span><h2>一路走来<span>.</span></h2></div></div>{site.experience.map((item) => <div className="experience-row" key={`${item.title}-${item.period}`}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.period}</span></div>)}</section>}

    {site.education.length > 0 && <section className="experience-section" aria-label="教育经历"><div className="section-heading"><div><span className="eyebrow">EDUCATION</span><h2>学习的足迹<span>.</span></h2></div></div>{site.education.map((item) => <div className="experience-row" key={`${item.title}-${item.period}`}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.period}</span></div>)}</section>}
    {site.skills.length > 0 && <section className="profile-skills" aria-label="技术栈"><span className="eyebrow">TOOLS I WORK WITH</span><div className="tag-list">{site.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
    <GitHubActivity />

    <section className="home-projects" aria-labelledby="projects-heading"><div className="section-heading"><div><span className="eyebrow">02 / SELECTED WORK</span><h2 id="projects-heading">把想法变成作品<span>.</span></h2></div><Link className="text-link" href="/projects/">全部项目 <Arrow /></Link></div>{projects.slice(0, 2).map((project) => <ProjectCard key={project.slug} project={project} />)}</section>

    <section className="home-posts" aria-labelledby="writing-heading"><div className="section-heading"><div><span className="eyebrow">03 / RECENT WRITING</span><h2 id="writing-heading">最近写下的<span>.</span></h2></div><Link className="text-link" href="/blog/">全部文章 <Arrow /></Link></div><div className="post-list">{posts.map((post) => <PostRow key={post.slug} post={post} />)}</div></section>

    <section className="home-collection"><div><span className="eyebrow">04 / LITTLE COLLECTIONS</span><h2>也留一点空间，<br />给屏幕之外<span>.</span></h2><p>把喜欢的画面、偶然的发现，和日常的小小片刻，收进这本随手翻开的册子。</p><WorldLink className="text-link">翻开拾光 <Arrow diagonal /></WorldLink></div><WorldLink className="collection-art"><span className="collection-paper paper-back" /><span className="collection-paper paper-front"><span className="collection-sun" /><span className="collection-hill" /><span className="collection-caption">SLOW MOMENTS / 拾光</span></span><span className="collection-stamp">KEEP<br />THE LITTLE<br />THINGS.</span></WorldLink></section>

    <section className="closing-note"><Asterisk /><p>一些小小的想法，<br /><span>也值得被认真记录。</span></p><Link className="text-link" href="/blog/">从一篇笔记开始 <Arrow diagonal /></Link></section>
  </>;
}
