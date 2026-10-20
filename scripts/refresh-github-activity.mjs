import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DAY = 86_400_000;
const output = new URL('../data/github-activity.json', import.meta.url);
const username = process.env.GITHUB_ACTIVITY_USERNAME || 'Li-Guangsen';
if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error('Invalid GitHub activity username.');
const source = `https://github.com/users/${username}/contributions`;

function attributes(markup) {
  return Object.fromEntries([...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

export function validateSnapshot(snapshot, expectedUsername = username) {
  if (snapshot?.username !== expectedUsername || snapshot.source !== `https://github.com/users/${expectedUsername}/contributions`) {
    throw new Error('Contribution snapshot belongs to a different GitHub account.');
  }
  if (!Array.isArray(snapshot.days) || snapshot.days.length < 350 || snapshot.days.length > 371) {
    throw new Error('Expected a full year of public contribution data.');
  }
  let previous = null;
  for (const day of snapshot.days) {
    const timestamp = Date.parse(`${day.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== day.date
      || !Number.isInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4
      || (day.count === 0) !== (day.level === 0)) throw new Error(`Invalid contribution day: ${day.date}`);
    if (previous !== null && timestamp - previous !== DAY) throw new Error('Contribution dates must be unique and consecutive.');
    previous = timestamp;
  }
  if (!Number.isInteger(snapshot.total) || snapshot.days.reduce((sum, day) => sum + day.count, 0) !== snapshot.total) {
    throw new Error('Contribution counts do not match the reported total.');
  }
  return snapshot;
}

export function parseContributions(html, account = username) {
  const labels = new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map((match) => [
    attributes(match[1]).for, match[2].replace(/<[^>]*>/g, '').trim(),
  ]));
  const days = [...html.matchAll(/<td\b([^>]*)>/g)].flatMap((match) => {
    const attrs = attributes(match[1]);
    if (!attrs['data-date']) return [];
    const count = labels.get(attrs.id)?.match(/^(No|[\d,]+) contributions? on /)?.[1];
    if (!count) throw new Error(`Missing contribution count for ${attrs['data-date']}.`);
    return [{ date: attrs['data-date'], count: count === 'No' ? 0 : Number(count.replaceAll(',', '')), level: Number(attrs['data-level']) }];
  }).sort((a, b) => a.date.localeCompare(b.date));
  const heading = html.match(/<h2\b[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const total = heading?.match(/([\d,]+)\s+contributions?\b/)?.[1];
  if (!total) throw new Error('Missing GitHub contribution total.');
  return validateSnapshot({ username: account, source: `https://github.com/users/${account}/contributions`, total: Number(total.replaceAll(',', '')), days }, account);
}

export async function refreshActivity() {
  try {
    const response = await fetch(source, {
      headers: { Accept: 'text/html', 'Accept-Language': 'en-US', 'User-Agent': 'Personal-Site-Activity-Snapshot' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`);
    const snapshot = { ...parseContributions(await response.text()), updatedAt: new Date().toISOString() };
    const latest = Date.parse(`${snapshot.days.at(-1).date}T00:00:00Z`);
    if (latest < Date.now() - 4 * DAY || latest > Date.now() + DAY) throw new Error('GitHub returned an unexpected contribution date range.');
    await mkdir(new URL('../data/', import.meta.url), { recursive: true });
    const temporary = new URL(`${output.href}.tmp`);
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporary, output);
    console.log(`GitHub activity: ${snapshot.total} public contributions across ${snapshot.days.length} days for ${username}.`);
    return snapshot;
  } catch (error) {
    const cached = await readFile(output, 'utf8').then(JSON.parse).then((value) => validateSnapshot(value)).catch(() => null);
    if (!cached || !Number.isFinite(Date.parse(cached.updatedAt))) throw error;
    console.warn(`GitHub activity: keeping the verified snapshot from ${cached.updatedAt}. ${error.message}`);
    return cached;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await refreshActivity();
