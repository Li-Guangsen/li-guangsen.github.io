export type WorldCard = {
  id: string;
  title: string;
  caption: string;
  image: string;
  imagePosition?: string;
  alt: string;
  kind: 'illustration' | 'photo';
  rotation: number;
};

export type WorldCollection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: WorldCard[];
};

// Keep photos and original display illustrations clearly labelled.
export const worldCollections: WorldCollection[] = [
  {
    id: 'digital', eyebrow: '01 / DIGITAL', title: 'Digital World',
    description: '算法、终端与轨道插画。',
    cards: [
      { id: 'steps', title: '算法', caption: '方格纸上的排序示意。', image: '/images/world/algorithm.svg', alt: '橄榄绿方格纸上的柱状序列与排序箭头插画', kind: 'illustration', rotation: -4 },
      { id: 'terminal', title: '终端', caption: '桌面与命令行窗口。', image: '/images/world/terminal.svg', alt: '米色桌面上打开终端窗口的原创插画', kind: 'illustration', rotation: 3 },
      { id: 'orbit', title: '轨道', caption: '星点、轨道与纸飞机。', image: '/images/world/orbit.svg', alt: '深绿色背景中的轨道、星点与纸飞机插画', kind: 'illustration', rotation: -2 },
    ],
  },
  {
    id: 'physical', eyebrow: '02 / EVERYDAY', title: 'Physical World',
    description: '户外照片与生活插画。',
    cards: [
      { id: 'bonfire', title: '天鹅湖', caption: '天鹅湖 · 篝火合影', image: '/images/world/bonfire.webp', alt: '天鹅湖的夜晚，大家围在篝火旁合影，手里拿着荧光棒', kind: 'photo', rotation: -3 },
      { id: 'canyon', title: '南太行', caption: '南太行 · 山间峡谷', image: '/images/world/canyon.webp', alt: '南太行层层延伸的山崖与峡谷，谷底有一条蜿蜒公路', kind: 'photo', rotation: 3 },
      { id: 'lakeside', title: '腾格里', caption: '腾格里 · 湖边留影', image: '/images/world/lakeside.webp', imagePosition: '50% 75%', alt: '腾格里湖边，身穿黄色外套、橙色鞋套的人跃起，背景是蓝天、白云和沙丘', kind: 'photo', rotation: -2 },
      { id: 'pages', title: '阅读', caption: '书本与橄榄叶。', image: '/images/world/pages.svg', alt: '木色背景上的书本与一片橄榄叶插画', kind: 'illustration', rotation: 3 },
      { id: 'window', title: '窗边', caption: '植物与午后光影。', image: '/images/world/window.svg', alt: '奶油色窗台、绿色植物和午后光影的原创插画', kind: 'illustration', rotation: -3 },
      { id: 'landscape', title: '山丘', caption: '绿、米色与陶土色的风景。', image: '/images/world/landscape.svg', alt: '由柔和绿、米色与陶土色构成的抽象山丘插画', kind: 'illustration', rotation: 4 },
    ],
  },
];
