import Link from 'next/link';
import { site } from '@/data/site';
import { GitHubIcon, MailIcon } from './social-icons';
import { WeChatContact } from './wechat-contact';
import { BrandWordmark } from './brand-wordmark';
import styles from './footer.module.css';

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner">
    <div className="footer-top">
      <div className="footer-about"><Link href="/" className="footer-name" aria-label={`${site.name} 首页`}><img src="/brand/favicon-32.png" alt="" width="20" height="20" /><BrandWordmark /></Link><p>Built with Next.js &amp; Velite<br />Deployed on GitHub Pages</p></div>
      <div className={styles.resources}>
        <div><h2>Navigation</h2><nav className="footer-links" aria-label="页脚导航"><Link href="/">首页</Link><Link href="/projects/">项目</Link><Link href="/blog/">博客</Link><Link href="/the-world/">拾光</Link></nav></div>
        <div><h2>Interlinked</h2><nav className={styles.socials} aria-label="社交与联系">
          {site.github && <a href={site.github} target="_blank" rel="noopener noreferrer" title="GitHub · Li-Guangsen" aria-label="GitHub · Li-Guangsen"><GitHubIcon /></a>}
          {site.wechat && <WeChatContact account={site.wechat} className={styles.socialButton} />}
          {site.email && <a href={`mailto:${site.email}`} title={site.email} aria-label={`邮箱 · ${site.email}`}><MailIcon /></a>}
        </nav></div>
      </div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.footerDomain || site.name}</span><a href="https://github.com/Li-Guangsen/li-guangsen.github.io" target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a></div>
  </div></footer>;
}
