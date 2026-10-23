import Link from 'next/link';
import Image from 'next/image';
import { forkedRepositories, githubProfile, ownRepositories } from '@/lib/github';
import { GitHubActivity } from './github-activity';
import styles from './github-profile.module.css';

export function GitHubProfile() {
  return <section className={styles.profile} aria-labelledby="github-profile-heading">
    <div className={styles.profileMain}>
      <h2 id="github-profile-heading">GitHub<span>.</span></h2>
      <div className={styles.identity}>
        <a href={githubProfile.url} target="_blank" rel="noopener noreferrer" className={styles.account}>
          <Image src={githubProfile.avatarPath} alt={`${githubProfile.name || githubProfile.login} 的 GitHub 头像`} width={52} height={52} className={styles.avatar} />
          <span><strong>{githubProfile.name || githubProfile.login}</strong><span>@{githubProfile.login}</span></span><span className={styles.external} aria-hidden="true">↗</span>
        </a>
      </div>
      {githubProfile.bio && <p className={styles.bio}>{githubProfile.bio}</p>}
      {githubProfile.location && <p className={styles.meta}>{githubProfile.location}</p>}
      <p className={styles.accountMeta}><span>加入于 <time dateTime={githubProfile.createdAt}>{githubProfile.createdAt.slice(0, 4)}</time></span><span>{githubProfile.followers} 关注者 · {githubProfile.following} 关注</span></p>
    </div>
    <div className={styles.profileAside}>
      <div className={styles.profileSummary}>
        <dl className={styles.stats}>
          <div><dt>公开仓库</dt><dd>{githubProfile.publicRepos}</dd></div>
          <div><dt>本人创建</dt><dd>{ownRepositories.length}</dd></div>
          <div><dt>Fork 仓库</dt><dd>{forkedRepositories.length}</dd></div>
        </dl>
        <Link className={styles.browseRepositories} href="/projects/#github-repositories">浏览仓库 <span aria-hidden="true">↗</span></Link>
      </div>
      <GitHubActivity />
    </div>
  </section>;
}
