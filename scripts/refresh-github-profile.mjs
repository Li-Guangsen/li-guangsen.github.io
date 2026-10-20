import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../data/github-profile.json', import.meta.url);
const username = process.env.GITHUB_PROFILE_USERNAME || process.env.GITHUB_ACTIVITY_USERNAME || 'Li-Guangsen';
if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error('Invalid GitHub profile username.');
const api = 'https://api.github.com';

function text(value, label, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || value.length > 2_000 || (!nullable && !value.trim())) throw new Error(`Invalid ${label}.`);
  return value;
}

function count(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${label}.`);
  return value;
}

function date(value, label) {
  const normalized = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) ? value.replace(/Z$/, '.000Z') : value;
  if (typeof normalized !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(normalized)
    || !Number.isFinite(Date.parse(normalized)) || new Date(normalized).toISOString() !== normalized) throw new Error(`Invalid ${label}.`);
  return value;
}

function repositoryIdentity(repository, expectedOwner) {
  text(repository?.name, 'repository name');
  text(repository?.fullName, 'repository full name');
  if (!/^[\w.-]+$/.test(repository.name) || repository.fullName.split('/').length !== 2 || repository.fullName.split('/')[1] !== repository.name) {
    throw new Error('Invalid repository identity.');
  }
  const owner = repository.fullName.split('/')[0];
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner) || (expectedOwner && owner.toLowerCase() !== expectedOwner.toLowerCase())) {
    throw new Error('Repository belongs to a different GitHub account.');
  }
  if (repository.url !== `https://github.com/${repository.fullName}`) throw new Error('Invalid repository URL.');
}

export function validateProfileSnapshot(snapshot, expectedUsername = username) {
  if (snapshot?.version !== 1 || snapshot.source !== `${api}/users/${expectedUsername}`) throw new Error('Invalid GitHub profile source.');
  date(snapshot.updatedAt, 'snapshot date');
  if (Date.parse(snapshot.updatedAt) > Date.now() + 86_400_000) throw new Error('Unexpected GitHub snapshot date.');
  const profile = snapshot.profile;
  if (typeof profile?.login !== 'string' || profile.login.toLowerCase() !== expectedUsername.toLowerCase() || profile.url !== `https://github.com/${profile.login}`) {
    throw new Error('GitHub profile belongs to a different account.');
  }
  for (const field of ['name', 'bio', 'location']) text(profile[field], `profile ${field}`, true);
  date(profile.createdAt, 'GitHub join date');
  for (const field of ['publicRepos', 'followers', 'following']) count(profile[field], `profile ${field}`);
  if (!Array.isArray(snapshot.repositories) || snapshot.repositories.length !== profile.publicRepos) throw new Error('GitHub repository count does not match the profile.');
  const seen = new Set();
  for (const repository of snapshot.repositories) {
    repositoryIdentity(repository, profile.login);
    const key = repository.fullName.toLowerCase();
    if (seen.has(key)) throw new Error('Duplicate GitHub repository.');
    seen.add(key);
    text(repository.description, 'repository description', true);
    text(repository.language, 'repository language', true);
    count(repository.stars, 'repository stars');
    count(repository.forks, 'repository forks');
    date(repository.pushedAt, 'repository push date');
    if (typeof repository.fork !== 'boolean' || typeof repository.archived !== 'boolean') throw new Error('Invalid GitHub repository status.');
    if (repository.fork) repositoryIdentity(repository.parent);
    else if (repository.parent !== null) throw new Error('Non-fork repository has an upstream parent.');
  }
  return snapshot;
}

async function request(path) {
  const response = await fetch(`${api}${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Personal-Site-Profile-Snapshot', 'X-GitHub-Api-Version': '2022-11-28' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status} for ${path.split('?')[0]}.`);
  return response.json();
}

function identity(repository) {
  return { name: repository.name, fullName: repository.full_name, url: repository.html_url };
}

export async function refreshProfile() {
  let temporary;
  try {
    const profile = await request(`/users/${username}`);
    const repositories = [];
    for (let page = 1; ; page += 1) {
      if (page > 100) throw new Error('GitHub repository pagination exceeded its limit.');
      const batch = await request(`/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error('GitHub returned an invalid repository list.');
      repositories.push(...batch);
      if (batch.length < 100) break;
    }
    const normalized = await Promise.all(repositories.map(async (repository) => {
      const detail = repository.fork ? await request(`/repos/${repository.full_name}`) : repository;
      return {
        ...identity(repository), description: repository.description, fork: repository.fork,
        language: repository.language, stars: repository.stargazers_count, forks: repository.forks_count,
        pushedAt: repository.pushed_at, archived: repository.archived,
        parent: repository.fork ? identity(detail.parent) : null,
      };
    }));
    const snapshot = validateProfileSnapshot({
      version: 1, source: `${api}/users/${username}`, updatedAt: new Date().toISOString(),
      profile: {
        login: profile.login, name: profile.name, url: profile.html_url, bio: profile.bio, location: profile.location,
        createdAt: profile.created_at, publicRepos: profile.public_repos, followers: profile.followers, following: profile.following,
      },
      repositories: normalized.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt) || a.name.localeCompare(b.name)),
    });
    await mkdir(new URL('../data/', import.meta.url), { recursive: true });
    temporary = new URL(`${output.href}.${process.pid}.tmp`);
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporary, output);
    console.log(`GitHub profile: ${snapshot.profile.login}, ${normalized.length} public repositories (${normalized.filter((repository) => repository.fork).length} forks).`);
    return snapshot;
  } catch (error) {
    if (temporary) await rm(temporary, { force: true }).catch(() => {});
    const cached = await readFile(output, 'utf8').then(JSON.parse).then((value) => validateProfileSnapshot(value)).catch(() => null);
    if (!cached) throw error;
    console.warn(`GitHub profile: keeping the verified snapshot from ${cached.updatedAt}. ${error.message}`);
    return cached;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await refreshProfile();
