import { forkedRepositories, githubDate, githubProfile, githubUpdatedAt, ownRepositories, type GitHubRepository } from '@/lib/github';
import styles from './github-profile.module.css';
import { GitHubProfile } from './github-profile';
import { PointerCard } from './pointer-card';

function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  return <PointerCard className={styles.repository}>
    <div className={styles.repositoryTop}>
      <span className={styles.repositoryType}>{repository.fork ? 'FORK' : 'OWN REPOSITORY'}</span>
      {repository.archived && <span className={styles.archived}>Archived</span>}
    </div>
    <h4><a href={repository.url} target="_blank" rel="noopener noreferrer">{repository.name}<span aria-hidden="true">↗</span></a></h4>
    {repository.parent && <p className={styles.upstream}>Forked from <a href={repository.parent.url} target="_blank" rel="noopener noreferrer">{repository.parent.fullName}</a></p>}
    {repository.description && <p className={styles.repositoryDescription}>{repository.description}</p>}
    {!repository.description && <p className={styles.noDescription}>No description yet</p>}
    <div className={styles.repositoryDetails}>
      {repository.language && <span className={styles.language}><i aria-hidden="true" />{repository.language}</span>}
      <span title={`${repository.stars} 个 Star`} aria-label={`${repository.stars} 个 Star`}>☆ {repository.stars}</span>
      <span title={`${repository.forks} 个 Fork`} aria-label={`${repository.forks} 个 Fork`}>⑂ {repository.forks}</span>
      <span className={styles.pushed}>Updated <time dateTime={repository.pushedAt}>{githubDate(repository.pushedAt)}</time></span>
    </div>
  </PointerCard>;
}

export function GitHubRepositories() {
  return <section className={styles.repositories} aria-labelledby="github-repositories" id="github-collection">
    <div className={styles.collectionHeading}>
      <div><h2 id="github-repositories">GitHub</h2></div>
      <a href={`${githubProfile.url}?tab=repositories`} target="_blank" rel="noopener noreferrer" className={styles.allRepositories}>All {githubProfile.publicRepos} repositories <span aria-hidden="true">↗</span></a>
    </div>
    <GitHubProfile />
    <div className={styles.repositoryGroup}>
      <div className={styles.groupHeading}><h3>Original<span>{ownRepositories.length.toString().padStart(2, '0')}</span></h3></div>
      <div className={styles.repositoryGrid}>{ownRepositories.map((repository) => <RepositoryCard key={repository.fullName} repository={repository} />)}</div>
      {ownRepositories.length === 0 && <p className={styles.empty}>暂无本人创建的公开仓库。</p>}
    </div>
    <div className={styles.repositoryGroup}>
      <div className={styles.groupHeading}><h3>Forks<span>{forkedRepositories.length.toString().padStart(2, '0')}</span></h3></div>
      <div className={styles.repositoryGrid}>{forkedRepositories.map((repository) => <RepositoryCard key={repository.fullName} repository={repository} />)}</div>
      {forkedRepositories.length === 0 && <p className={styles.empty}>暂时没有公开的 Fork 仓库。</p>}
    </div>
    <p className={styles.snapshotNote}>Synced <time dateTime={githubUpdatedAt}>{githubDate(githubUpdatedAt)}</time> · Public GitHub data</p>
  </section>;
}
