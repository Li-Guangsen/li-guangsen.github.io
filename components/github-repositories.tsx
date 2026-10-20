import { forkedRepositories, githubDate, githubProfile, githubUpdatedAt, ownRepositories, type GitHubRepository } from '@/lib/github';
import styles from './github-profile.module.css';

function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  return <article className={styles.repository}>
    <div className={styles.repositoryTop}>
      <span className={styles.repositoryType}>{repository.fork ? 'FORK' : 'OWN REPOSITORY'}</span>
      {repository.archived && <span className={styles.archived}>已归档</span>}
    </div>
    <h4><a href={repository.url} target="_blank" rel="noopener noreferrer">{repository.name}<span aria-hidden="true">↗</span></a></h4>
    {repository.parent && <p className={styles.upstream}>Fork 自 <a href={repository.parent.url} target="_blank" rel="noopener noreferrer">{repository.parent.fullName}</a></p>}
    {repository.description && <p className={styles.repositoryDescription}>{repository.description}</p>}
    {!repository.description && <p className={styles.noDescription}>暂未填写仓库简介</p>}
    <div className={styles.repositoryDetails}>
      {repository.language && <span className={styles.language}><i aria-hidden="true" />{repository.language}</span>}
      <span title={`${repository.stars} 个 Star`} aria-label={`${repository.stars} 个 Star`}>☆ {repository.stars}</span>
      <span title={`${repository.forks} 个 Fork`} aria-label={`${repository.forks} 个 Fork`}>⑂ {repository.forks}</span>
      <span className={styles.pushed}>推送于 <time dateTime={repository.pushedAt}>{githubDate(repository.pushedAt)}</time></span>
    </div>
  </article>;
}

export function GitHubRepositories() {
  return <section className={styles.repositories} aria-labelledby="github-repositories" id="github-collection">
    <div className={styles.collectionHeading}>
      <div><span className={styles.kicker}>FROM GITHUB</span><h2 id="github-repositories">代码的另一面<span>.</span></h2><p>自己的实践，与感兴趣的开源项目，放在这里一起翻看。</p></div>
      <a href={`${githubProfile.url}?tab=repositories`} target="_blank" rel="noopener noreferrer" className={styles.allRepositories}>全部 {githubProfile.publicRepos} 个仓库 <span aria-hidden="true">↗</span></a>
    </div>
    <div className={styles.repositoryGroup}>
      <div className={styles.groupHeading}><h3>本人创建<span>{ownRepositories.length.toString().padStart(2, '0')}</span></h3><p>由这个账号创建的公开仓库。</p></div>
      <div className={styles.repositoryGrid}>{ownRepositories.map((repository) => <RepositoryCard key={repository.fullName} repository={repository} />)}</div>
      {ownRepositories.length === 0 && <p className={styles.empty}>还没有公开的本人创建仓库。下一次想法落地后，会在这里出现。</p>}
    </div>
    <div className={styles.repositoryGroup}>
      <div className={styles.groupHeading}><h3>开源关注 · Fork<span>{forkedRepositories.length.toString().padStart(2, '0')}</span></h3><p>从上游复制的仓库，记录关注方向；项目归属于原作者。</p></div>
      <div className={styles.repositoryGrid}>{forkedRepositories.map((repository) => <RepositoryCard key={repository.fullName} repository={repository} />)}</div>
      {forkedRepositories.length === 0 && <p className={styles.empty}>暂时没有公开的 Fork 仓库。</p>}
    </div>
    <p className={styles.snapshotNote}>数据来自 GitHub 公开接口，更新于 <time dateTime={githubUpdatedAt}>{githubDate(githubUpdatedAt)}</time>。Star 和 Fork 数为这个账号下各仓库的数据。</p>
  </section>;
}
