import { WorldGallery } from '@/components/world-gallery';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata = pageMetadata('拾光', '图片收藏。目前收录展示插画。', '/the-world/');

export default function WorldPage() {
  return <div className="inner-page textured-page" data-the-world-page>
    <div className="page-heading"><h1>The World</h1><p>图片收藏 · 展示插画</p></div>
    <WorldGallery />
  </div>;
}
