import Link from 'next/link';
import Image from 'next/image';
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
          <Image src={githubProfile.avatarPath} alt={`${githubProfile.name || githubProfile.login} 的 GitHub 头像`} width={52} height={52} className={styles.avatar} />
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
