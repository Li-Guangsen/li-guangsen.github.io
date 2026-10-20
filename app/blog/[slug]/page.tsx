import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostSummaries, getPost, formatDate } from '@/lib/posts';
import { site } from '@/data/site';
import { MDXContent } from '@/components/mdx-content';
import { ArticleToc } from '@/components/article-toc';
import styles from '@/components/reading.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return getPostSummaries().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = `${site.url}/blog/${post.slug}/`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', title: post.title, description: post.description, url,
      siteName: site.name, locale: 'zh_CN', publishedTime: `${post.date}T00:00:00+08:00`,
      tags: post.tags, section: post.category,
      images: [{ url: '/social-card.svg', width: 1200, height: 630, alt: `${site.name} · ${post.title}` }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/social-card.svg'] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const posts = getPostSummaries();
  const chronological = [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const position = chronological.findIndex(({ slug: value }) => value === slug);
  const newer = chronological[position - 1];
  const older = chronological[position + 1];
  const categoryPosts = posts.filter((item) => item.categories.some((category) => post.categories.includes(category)));
  const related = (categoryPosts.length > 1 ? categoryPosts : posts).slice(0, 8);
  const articleId = `article-${post.slug}`;
  const articleUrl = `${site.url}/blog/${post.slug}/`;
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
    description: post.description, datePublished: `${post.date}T00:00:00+08:00`,
    mainEntityOfPage: articleUrl, url: articleUrl, inLanguage: 'zh-CN', keywords: post.tags.join(', '),
    articleSection: post.categories, isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
  };

  return <div className={styles.readingPage} id="article-top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <Link className={styles.backLink} href="/blog/">← 返回全部笔记</Link>
    <header className={styles.articleHeader}>
      <div className={styles.headerCategories}><span className="eyebrow">FIELD NOTES / </span>{post.categories.map((category) => <Link key={category} href={`/blog/?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      <h1>{post.title}</h1><p>{post.description}</p>
      <div className={styles.articleMeta}><time dateTime={post.date}>{formatDate(post.date)}</time><span aria-hidden="true">·</span><span>约 {post.minutes} 分钟阅读</span>{post.pinned && <span className={styles.pinned}>置顶笔记</span>}{post.sample && <span className="sample-label">示例文章</span>}</div>
    </header>
    <div className={styles.articleGrid}>
      <aside className={styles.relatedRail} aria-label="同类笔记">
        <span className={styles.railLabel}>IN THE MARGIN</span><h2 className={styles.railTitle}>{categoryPosts.length > 1 ? '同一条思路' : '继续翻阅'}</h2>
        <ol className={styles.relatedList}>{related.map((item) => <li key={item.slug}><Link href={`/blog/${item.slug}/`} aria-current={item.slug === slug ? 'page' : undefined}>{item.title}<time dateTime={item.date}>{formatDate(item.date)}</time></Link></li>)}</ol>
        <Link className={styles.railAll} href="/blog/">全部笔记 →</Link>
      </aside>
      <ArticleToc key={post.slug} articleId={articleId} slug={post.slug} enabled={post.toc} />
      <article className={styles.articleBody} aria-label={post.title}>
        {post.sample && <aside className={styles.sampleNotice}>这是一篇展示写作与阅读功能的示例，内容不代表个人真实经历。可以保留为写作参考，也可以替换成自己的笔记。</aside>}
        <div id={articleId} className={`prose ${styles.articleContent}`}><MDXContent code={post.content} /></div>
        <footer className={styles.articleFooter}>
          <div className={styles.articleTags}>{post.tags.map((tag) => <Link href={`/blog/?tag=${encodeURIComponent(tag)}`} key={tag}># {tag}</Link>)}</div>
          <p className={styles.readingEnd}>END OF NOTE / 把过程留在这里</p>
          <nav className={styles.postNavigation} aria-label="相邻文章">
            {newer && <Link href={`/blog/${newer.slug}/`}><span>← 较新的笔记</span><strong>{newer.title}</strong></Link>}
            {older && <Link href={`/blog/${older.slug}/`}><span>较早的笔记 →</span><strong>{older.title}</strong></Link>}
          </nav>
        </footer>
      </article>
    </div>
  </div>;
}
