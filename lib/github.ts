import snapshot from '@/data/github-profile.json';

export type GitHubRepository = (typeof snapshot.repositories)[number];
export const githubProfile = snapshot.profile;
export const githubUpdatedAt = snapshot.updatedAt;
export const githubRepositories = snapshot.repositories;
export const ownRepositories = githubRepositories.filter((repository) => !repository.fork);
export const forkedRepositories = githubRepositories.filter((repository) => repository.fork);

export function githubDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(new Date(date));
}
