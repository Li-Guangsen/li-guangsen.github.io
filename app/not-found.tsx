import Link from 'next/link';
export default function NotFound() { return <div className="not-found"><span className="eyebrow">A SMALL DETOUR</span><div className="error-code">404<span>.</span></div><h1>这条路，还没写到这里。</h1><p>页面可能已移动，或者链接有一个小小的笔误。</p><Link className="button button-primary" href="/">返回首页 →</Link></div>; }
