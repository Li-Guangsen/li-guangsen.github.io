import Link from 'next/link';
import { forkedRepositories, githubDate, githubProfile, githubUpdatedAt, ownRepositories } from '@/lib/github';
import styles from './github-profile.module.css';

export function GitHubProfile() {
  return <section className={styles.profile} aria-labelledby="github-profile-heading">
    <div className={styles.profileMain}>
      <div className={styles.kicker}><span aria-hidden="true">↳</span> BUILDING IN PUBLIC</div>
      <h2 id="github-profile-heading">在 GitHub，继续动手<span>.</span></h2>
      <p className={styles.intro}>从一个仓库开始，把想法变成可以打开的东西。</p>
      <div className={styles.identity}>
        <a href={githubProfile.url} target="_blank" rel="noopener noreferrer" className={styles.account}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.75-.24.75-.53v-2.06c-3.1.68-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.73.39-1.22.7-1.5-2.47-.28-5.07-1.24-5.07-5.49 0-1.21.43-2.2 1.15-2.98-.12-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.94.72.78 1.15 1.77 1.15 2.98 0 4.26-2.6 5.2-5.08 5.48.4.35.76 1.03.76 2.08V22c0 .3.2.64.76.53A11.1 11.1 0 0 0 12 .9Z" /></svg>
          <span><strong>{githubProfile.name || githubProfile.login}</strong><span>@{githubProfile.login}</span></span><span className={styles.external} aria-hidden="true">↗</span>
        </a>
        <p className={styles.since}>加入于 <time dateTime={githubProfile.createdAt}>{githubProfile.createdAt.slice(0, 4)}</time></p>
      </div>
      {githubProfile.bio && <p className={styles.bio}>{githubProfile.bio}</p>}
      {githubProfile.location && <p className={styles.meta}>{githubProfile.location}</p>}
    </div>
    <div className={styles.profileAside}>
      <dl className={styles.stats}>
        <div><dt>公开仓库</dt><dd>{githubProfile.publicRepos}</dd></div>
        <div><dt>本人创建</dt><dd>{ownRepositories.length}</dd></div>
        <div><dt>Fork 仓库</dt><dd>{forkedRepositories.length}</dd></div>
      </dl>
      <div className={styles.profileBottom}><span className={styles.socialCounts}>{githubProfile.followers} 关注者 · {githubProfile.following} 关注</span><Link href="/projects/#github-repositories">浏览仓库 <span aria-hidden="true">↗</span></Link></div>
      <p className={styles.snapshotNote}>GitHub 公开资料 · 更新于 <time dateTime={githubUpdatedAt}>{githubDate(githubUpdatedAt)}</time></p>
    </div>
  </section>;
}
