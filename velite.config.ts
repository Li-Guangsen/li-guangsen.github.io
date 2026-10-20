import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineCollection, defineConfig, s } from 'velite';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkGemoji from 'remark-gemoji';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeMermaid from 'rehype-mermaid';
import { visit } from 'unist-util-visit';
import { toText } from 'hast-util-to-text';
import type { Root as MarkdownRoot } from 'mdast';
import type { Root as HtmlRoot } from 'hast';

// Build native MDX nodes so alerts also work without raw HTML parsing.
function remarkAlerts() {
  const titles: Record<string, string> = {
    note: '笔记', tip: '提示', important: '要点', warning: '注意', caution: '小心',
  };
  return (tree: MarkdownRoot) => {
    visit(tree, 'blockquote', (node) => {
      const paragraph = node.children[0];
      if (paragraph?.type !== 'paragraph') return;
      const first = paragraph.children[0];
      if (first?.type !== 'text') return;
      const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]+([^\r\n]+))?(?:\r?\n|$)/i.exec(first.value);
      if (!match) return;
      const kind = match[1].toLowerCase();
      first.value = first.value.slice(match[0].length);
      if (!first.value) paragraph.children.shift();
      if (!paragraph.children.length) node.children.shift();
      node.data = {
        hName: 'div',
        hProperties: { className: ['markdown-alert', `markdown-alert-${kind}`], role: 'note' },
      };
      node.children.unshift({
        type: 'paragraph',
        data: { hProperties: { className: ['markdown-alert-title'] } },
        children: [{ type: 'text', value: match[2]?.trim() || titles[kind] }],
      });
    });
  };
}

function rehypeRawGitHubImages() {
  return (tree: HtmlRoot) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || typeof node.properties.src !== 'string') return;
      node.properties.src = node.properties.src.replace(
        /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/,
        'https://raw.githubusercontent.com/$1/$2/$3',
      );
    });
  };
}

// Preserve the original diagram text before replacing the code block with SVG.
function rehypeDiagramSources() {
  return (tree: HtmlRoot, file: { data: Record<string, unknown> }) => {
    const sources: string[] = [];
    visit(tree, 'element', (node) => {
      const classes = node.properties.className;
      if (node.tagName === 'code' && Array.isArray(classes) && classes.includes('language-mermaid')) {
        sources.push(toText(node, { whitespace: 'pre' }));
      }
    });
    file.data.diagramSources = sources;
  };
}

function rehypeDiagramSourceAttributes() {
  return (tree: HtmlRoot, file: { data: Record<string, unknown> }) => {
    const sources = file.data.diagramSources as string[] | undefined;
    let index = 0;
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'svg' || !String(node.properties.id || '').startsWith('mermaid-')) return;
      const source = sources?.[index++];
      if (source) node.properties['data-mermaid-source'] = source;
    });
  };
}

const nonempty = s.string().trim().min(1);
const date = s.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, '日期必须是真实的 YYYY-MM-DD 日期');

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.{md,mdx}',
  schema: s.object({
    slug: s.path().transform((path) => path.split('/').at(-1) || '').refine(
      (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      '文章文件名只能包含小写英文字母、数字和连字符',
    ),
    title: nonempty,
    description: nonempty,
    date,
    category: nonempty.optional(),
    categories: s.array(nonempty).default([]),
    tags: s.array(nonempty).default([]),
    sample: s.boolean().default(false),
    draft: s.boolean().default(false),
    published: s.boolean().default(true),
    pinned: s.boolean().default(false),
    toc: s.boolean().default(true),
    reading: s.metadata(),
    content: s.mdx(),
  }).refine((post) => post.categories.length > 0 || Boolean(post.category), {
    message: '请填写 category 或至少一个 categories 分类', path: ['categories'],
  }).transform(({ category, categories, reading, draft, ...post }) => {
    const normalized = [...new Set([...categories, ...(category ? [category] : [])]
      .map((value) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()))];
    return {
      ...post,
      category: normalized[0],
      categories: normalized,
      tags: [...new Set(post.tags)],
      published: post.published && !draft,
      minutes: reading.readingTime,
    };
  }),
});

export default defineConfig({
  root: 'content',
  strict: true,
  collections: { posts },
  output: { data: '.velite', assets: 'public/static', base: '/static/', clean: true },
  mdx: {
    // GFM is explicit here; disable Velite's duplicate built-in GFM registration.
    gfm: false,
    remarkPlugins: [remarkGfm, remarkMath, remarkGemoji, remarkAlerts],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: { className: ['heading-anchor'], ariaLabel: '链接到这一节' },
        content: { type: 'text', value: '#' },
      }],
      rehypeRawGitHubImages,
      rehypeDiagramSources,
      [rehypeMermaid, {
        strategy: 'inline-svg',
        ...(process.env.MERMAID_CHROMIUM_EXECUTABLE_PATH ? {
          launchOptions: { executablePath: process.env.MERMAID_CHROMIUM_EXECUTABLE_PATH },
        } : {}),
        mermaidConfig: {
          theme: 'neutral',
          fontFamily: 'system-ui, sans-serif',
          themeVariables: { primaryColor: '#f0eddf', primaryBorderColor: '#74795d', lineColor: '#74795d' },
        },
      }],
      rehypeDiagramSourceAttributes,
      [rehypePrettyCode, {
        theme: { light: 'github-light', dark: 'github-dark-dimmed' },
        keepBackground: false,
        defaultLang: 'text',
      }],
      [rehypeKatex, { output: 'htmlAndMathml', strict: 'ignore', throwOnError: true }],
    ],
  },
  async prepare(data, { config }) {
    const slugs = new Set<string>();
    for (const post of data.posts) {
      if (slugs.has(post.slug)) throw new Error(`文章地址重复：${post.slug}`);
      slugs.add(post.slug);
    }
    // Drafts never enter generated public datasets, even indirectly through search.
    data.posts = data.posts.filter((post) => post.published)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    const summaries = data.posts.map(({ content: _content, ...post }) => post);
    const target = join(config.output.data, 'post-summaries.json');
    const json = JSON.stringify(summaries);
    const existing = await readFile(target, 'utf8').catch(() => '');
    if (json !== existing) await writeFile(target, json);
  },
});
