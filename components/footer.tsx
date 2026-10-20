import Link from 'next/link';
import { site } from '@/data/site';
import { Arrow } from './icons';
import { WorldLink } from './world-transition';
import { BrandWordmark } from './brand-wordmark';

export function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div><Link href="/" className="footer-name" aria-label={`${site.name} 首页`}><BrandWordmark /></Link><p>保持好奇。慢慢构建。</p></div><div className="footer-links"><Link href="/projects/">项目 <Arrow diagonal /></Link><Link href="/blog/">博客 <Arrow diagonal /></Link><WorldLink>拾光 <Arrow diagonal /></WorldLink>{site.github && <a href={site.github} target="_blank" rel="noreferrer">GitHub <Arrow diagonal /></a>}{site.email && <a href={`mailto:${site.email}`}>联系我 <Arrow diagonal /></a>}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {site.name}</span><span>A LITTLE CORNER OF THE INTERNET.</span></div></footer>;
}
