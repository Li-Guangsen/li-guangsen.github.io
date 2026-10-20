import { WorldGallery } from '@/components/world-gallery';
import { pageMetadata } from '@/lib/page-metadata';

const description = '收藏屏幕内外的小片刻。原创插画先占个位置，等待自己的照片、截图与灵感慢慢填满。';
export const metadata = pageMetadata('拾光', description, '/the-world/');

export default function WorldPage() {
  return <div className="inner-page" data-the-world-page>
    <div className="page-heading"><span className="eyebrow">LITTLE THINGS, KEPT CLOSE</span><h1>拾光<span>.</span></h1><p>代码之外，也给生活留一点位置。<br />把值得停下来的片刻，收进这本慢慢填满的剪贴簿。</p></div>
    <WorldGallery />
    <div className="endnote"><span>✳</span><p>这里先放上原创插画，真实的故事，等自己来写。</p></div>
  </div>;
}
