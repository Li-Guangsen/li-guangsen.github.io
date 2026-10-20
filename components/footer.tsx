import Link from 'next/link';
import { site } from '@/data/site';
import { Arrow } from './icons';
import { GitHubIcon, MailIcon, XIcon } from './social-icons';
import { WorldLink } from './world-transition';
import { BrandWordmark } from './brand-wordmark';
import styles from './footer.module.css';

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-top">
      <div><Link href="/" className="footer-name" aria-label={`${site.name} 首页`}><BrandWordmark /></Link><p>保持好奇。慢慢构建。</p></div>
      <div className={styles.resources}>
        <nav className="footer-links" aria-label="页脚导航">
          <Link href="/projects/">项目 <Arrow diagonal /></Link>
          <Link href="/blog/">博客 <Arrow diagonal /></Link>
          <WorldLink>拾光 <Arrow diagonal /></WorldLink>
        </nav>
        <nav className={styles.socials} aria-label="社交与联系">
          {site.github && <a href={site.github} target="_blank" rel="noopener noreferrer" title="GitHub · Li-Guangsen" aria-label="GitHub · Li-Guangsen"><GitHubIcon /></a>}
          {site.x && <a href={site.x} target="_blank" rel="noopener noreferrer" title="X · @rickk_Depth" aria-label="X · @rickk_Depth"><XIcon /></a>}
          {site.email && <a href={`mailto:${site.email}`} title={site.email} aria-label={`邮箱 · ${site.email}`}><MailIcon /></a>}
        </nav>
      </div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.footerDomain || site.name}</span><span>A LITTLE CORNER OF THE INTERNET.</span></div>
  </footer>;
}
