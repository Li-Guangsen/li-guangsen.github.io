import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';
import { refreshProfile, validateProfileSnapshot } from '../scripts/refresh-github-profile.mjs';

const username = 'Fixture-Account';
const snapshot = {
  version: 2,
  source: `https://api.github.com/users/${username}`,
  updatedAt: '2026-01-01T12:00:00.000Z',
  profile: {
    login: username, name: 'Fixture User', url: `https://github.com/${username}`,
    avatarUrl: 'https://avatars.githubusercontent.com/u/123456?v=4', avatarPath: '/images/github-avatar.png',
    bio: null, location: null, createdAt: '2021-09-23T14:11:44Z',
    publicRepos: 2, followers: 0, following: 0,
  },
  repositories: [
    {
      name: 'own-repository', fullName: `${username}/own-repository`, url: `https://github.com/${username}/own-repository`,
      description: null, fork: false, language: 'TypeScript', stars: 0, forks: 0,
      pushedAt: '2025-12-31T12:00:00Z', archived: false, parent: null,
    },
    {
      name: 'forked-repository', fullName: `${username}/forked-repository`, url: `https://github.com/${username}/forked-repository`,
      description: 'A synthetic upstream project.', fork: true, language: null, stars: 0, forks: 0,
      pushedAt: '2025-12-30T12:00:00Z', archived: false,
      parent: { name: 'forked-repository', fullName: 'Upstream-Account/forked-repository', url: 'https://github.com/Upstream-Account/forked-repository' },
    },
  ],
};
const fixture = () => structuredClone(snapshot);

test('accepts a complete public GitHub snapshot and preserves explicit fork ownership', () => {
  const value = fixture();
  assert.equal(validateProfileSnapshot(value, username), value);
  assert.equal(value.repositories.length, value.profile.publicRepos);
  for (const repository of value.repositories) {
    assert.equal(Boolean(repository.parent), repository.fork);
    assert.equal('homepage' in repository, false);
  }
});

test('rejects another account and non-GitHub profile or repository URLs', () => {
  assert.throws(() => validateProfileSnapshot(fixture(), 'someone-else'));
  for (const mutate of [
    (value) => { value.profile.login = 'someone-else'; },
    (value) => { value.profile.url = 'https://example.com/Li-Guangsen'; },
    (value) => { value.repositories[0].url = 'javascript:alert(1)'; },
    (value) => { value.repositories[0].fullName = `someone-else/${value.repositories[0].name}`; },
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => validateProfileSnapshot(value, username));
  }
});

test('requires fork origins and rejects misleading parent links or non-fork ownership', () => {
  const forkIndex = snapshot.repositories.findIndex((repository) => repository.fork);
  const ownIndex = snapshot.repositories.findIndex((repository) => !repository.fork);
  assert.notEqual(forkIndex, -1);
  assert.notEqual(ownIndex, -1);
  for (const mutate of [
    (value) => { value.repositories[forkIndex].parent = null; },
    (value) => { value.repositories[forkIndex].parent.url = 'https://example.com/upstream'; },
    (value) => { value.repositories[ownIndex].parent = structuredClone(value.repositories[forkIndex].parent); },
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => validateProfileSnapshot(value, username));
  }
});

test('rejects incomplete or duplicated repository lists, invalid counts, and impossible dates', () => {
  for (const mutate of [
    (value) => { value.profile.publicRepos += 1; },
    (value) => { value.repositories.push(structuredClone(value.repositories[0])); value.profile.publicRepos += 1; },
    (value) => { value.repositories[0].stars = -1; },
    (value) => { value.profile.followers = 0.5; },
    (value) => { value.profile.createdAt = '2021-02-30T00:00:00Z'; },
    (value) => { value.updatedAt = 'invalid'; },
  ]) {
    const value = fixture();
    mutate(value);
    assert.throws(() => validateProfileSnapshot(value, username));
  }
});

test('accepts an account with no public repositories', () => {
  const value = fixture();
  value.repositories = [];
  value.profile.publicRepos = 0;
  assert.doesNotThrow(() => validateProfileSnapshot(value, username));
});

test('requires a local avatar and an HTTPS GitHub avatar source', () => {
  for (const avatarUrl of [
    null, 'http://avatars.githubusercontent.com/u/123456?v=4',
    'https://example.com/u/123456?v=4', 'https://avatars.githubusercontent.com.example.com/u/123456',
    'https://user:password@avatars.githubusercontent.com/u/123456', 'https://avatars.githubusercontent.com:8443/u/123456',
    'https://avatars.githubusercontent.com/arbitrary/path', 'https://avatars.githubusercontent.com/u/123456#fragment',
  ]) {
    const value = fixture();
    value.profile.avatarUrl = avatarUrl;
    assert.throws(() => validateProfileSnapshot(value, username));
  }
  for (const avatarPath of [undefined, '/images/another.png', 'https://example.com/avatar.png', '../../avatar.png']) {
    const value = fixture();
    value.profile.avatarPath = avatarPath;
    assert.throws(() => validateProfileSnapshot(value, username));
  }
});

test('keeps a validated local snapshot and avatar when GitHub is unavailable', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'github-profile-cache-'));
  const snapshotFile = pathToFileURL(join(directory, 'profile.json'));
  const avatarFile = pathToFileURL(join(directory, 'avatar.png'));
  const cachedSnapshot = fixture();
  await writeFile(snapshotFile, JSON.stringify(cachedSnapshot));
  await writeFile(avatarFile, await sharp({ create: { width: 512, height: 512, channels: 3, background: '#536f56' } }).png().toBuffer());
  const warnBefore = console.warn;
  let warned = false;
  console.warn = () => { warned = true; };
  try {
    assert.deepEqual(await refreshProfile({ profileUsername: username, snapshotFile, avatarFile, fetchImpl: async () => { throw new Error('Offline fixture'); } }), cachedSnapshot);
    assert.equal(warned, true);
    assert.deepEqual(JSON.parse(await readFile(snapshotFile, 'utf8')), cachedSnapshot);
  } finally {
    console.warn = warnBefore;
    await rm(directory, { recursive: true, force: true });
  }
});

test('refuses incomplete avatar caches instead of publishing broken images', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'github-profile-incomplete-'));
  const snapshotFile = pathToFileURL(join(directory, 'profile.json'));
  const avatarFile = pathToFileURL(join(directory, 'avatar.png'));
  await writeFile(snapshotFile, JSON.stringify(fixture()));
  const refresh = () => refreshProfile({ profileUsername: username, snapshotFile, avatarFile, fetchImpl: async () => { throw new Error('Offline fixture'); } });
  try {
    await assert.rejects(refresh(), /Offline fixture/);
    await writeFile(avatarFile, 'not an image');
    await assert.rejects(refresh(), /Offline fixture/);
    await writeFile(avatarFile, await sharp({ create: { width: 1, height: 1, channels: 3, background: '#536f56' } }).png().toBuffer());
    await assert.rejects(refresh(), /Offline fixture/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
