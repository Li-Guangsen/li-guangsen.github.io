import Image from 'next/image';
import { forkedRepositories, githubAvatar, githubProfile, ownRepositories } from '@/lib/github';
import styles from './github-profile.module.css';

export function GitHubProfile() {
  return <div className={styles.profile}>
    <a href={githubProfile.url} target="_blank" rel="noopener noreferrer" className={styles.account}>
      <Image src={githubAvatar} alt={`${githubProfile.name || githubProfile.login} 的 GitHub 头像`} width={44} height={44} className={styles.avatar} />
      <span><strong>{githubProfile.name || githubProfile.login}</strong><span>@{githubProfile.login}</span></span><span aria-hidden="true">↗</span>
    </a>
    <dl className={styles.stats}>
      <div><dt>Public repos</dt><dd>{githubProfile.publicRepos}</dd></div>
      <div><dt>Original</dt><dd>{ownRepositories.length}</dd></div>
      <div><dt>Forks</dt><dd>{forkedRepositories.length}</dd></div>
    </dl>
  </div>;
}
