import { site } from '@/data/site';
import { githubProfile } from '@/lib/github';
import { GitHubActivity } from '@/components/github-activity';
import { ProfileDetails } from '@/components/profile-details';
import { AvatarSpark } from '@/components/avatar-spark';

export default function Home() {
  return <div className="home-page">
    <section className="hero" aria-labelledby="intro-heading">
      <AvatarSpark className="profile-avatar" label="点击头像，撒点纸屑">
        <img src={githubProfile.avatarPath} alt={`${site.displayName} 的 GitHub 头像`} width="112" height="112" fetchPriority="high" />
      </AvatarSpark>
      <h1 id="intro-heading"><a href={site.github} target="_blank" rel="noopener noreferrer">@{githubProfile.login}</a></h1>
      <div className="profile-bio">{site.bio.map((line) => <p key={line}>{line}</p>)}</div>
    </section>
    <GitHubActivity />
    {site.experience.length > 0 && <section className="experience-section" aria-labelledby="experience-heading">
      <h2 id="experience-heading">Work Experience</h2>
      {site.experience.map((item) => <div className="experience-row" key={`${item.title}-${item.period}`}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.period}</span></div>)}
    </section>}
    <ProfileDetails education={site.education} skills={site.skills} />
  </div>;
}
