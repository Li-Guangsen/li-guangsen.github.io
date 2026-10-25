import { WorldGallery } from '@/components/world-gallery';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata = pageMetadata('拾光', '户外照片与数字世界的图片收藏。', '/the-world/');

export default function WorldPage() {
  return <div className="inner-page textured-page" data-the-world-page>
    <div className="page-heading"><h1>拾光</h1><p>图片收藏 · 生活记录</p></div>
    <WorldGallery />
  </div>;
}
