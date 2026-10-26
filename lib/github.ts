import snapshot from '@/data/github-profile.json';
import avatar from '@/public/images/github-avatar.png';

export type GitHubRepository = (typeof snapshot.repositories)[number];
export const githubProfile = snapshot.profile;
// A content-hashed asset URL updates when the synced avatar changes.
export const githubAvatar = avatar;
export const githubUpdatedAt = snapshot.updatedAt;
export const githubRepositories = snapshot.repositories;
export const ownRepositories = githubRepositories.filter((repository) => !repository.fork);
export const forkedRepositories = githubRepositories.filter((repository) => repository.fork);

export function githubDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(new Date(date));
}
