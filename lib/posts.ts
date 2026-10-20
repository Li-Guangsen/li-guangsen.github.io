import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const directory = path.join(process.cwd(), 'content', 'posts');

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  sample: boolean;
  minutes: number;
  content: string;
};

export function getPosts(): Post[] {
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
      const slug = file.replace(/\.md$/, '');
      if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid post filename: ${file}`);
      for (const field of ['title', 'description', 'date', 'category']) {
        if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${file}: missing ${field}`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) throw new Error(`${file}: invalid date`);
      return {
        slug, content, title: data.title, description: data.description,
        date: data.date, category: data.category,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        sample: data.sample === true,
        draft: data.draft === true,
        minutes: Math.max(1, Math.ceil(content.length / 500)),
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return getPosts().find((post) => post.slug === slug);
}

export async function renderMarkdown(content: string) {
  // Only trusted, locally authored Markdown is read. Do not use this for visitor input.
  return marked.parse(content, { gfm: true, breaks: false });
}

export function formatDate(value: string) {
  return value.replaceAll('-', '.');
}
