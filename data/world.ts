export type WorldCard = {
  id: string;
  title: string;
  caption: string;
  image: string;
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

// Replace these original illustrations with your own photos or screenshots.
// Keep kind: 'illustration' until an image actually documents your experience.
export const worldCollections: WorldCollection[] = [
  {
    id: 'digital', eyebrow: '01 / DIGITAL', title: '数字',
    description: '算法、终端与轨道插画。',
    cards: [
      { id: 'steps', title: '算法', caption: '方格纸上的排序示意。', image: '/images/world/algorithm.svg', alt: '橄榄绿方格纸上的柱状序列与排序箭头插画', kind: 'illustration', rotation: -4 },
      { id: 'terminal', title: '终端', caption: '桌面与命令行窗口。', image: '/images/world/terminal.svg', alt: '米色桌面上打开终端窗口的原创插画', kind: 'illustration', rotation: 3 },
      { id: 'orbit', title: '轨道', caption: '星点、轨道与纸飞机。', image: '/images/world/orbit.svg', alt: '深绿色背景中的轨道、星点与纸飞机插画', kind: 'illustration', rotation: -2 },
    ],
  },
  {
    id: 'physical', eyebrow: '02 / EVERYDAY', title: '日常',
    description: '书本、窗台与风景插画。',
    cards: [
      { id: 'pages', title: '阅读', caption: '书本与橄榄叶。', image: '/images/world/pages.svg', alt: '木色背景上的书本与一片橄榄叶插画', kind: 'illustration', rotation: 3 },
      { id: 'window', title: '窗边', caption: '植物与午后光影。', image: '/images/world/window.svg', alt: '奶油色窗台、绿色植物和午后光影的原创插画', kind: 'illustration', rotation: -3 },
      { id: 'landscape', title: '山丘', caption: '绿、米色与陶土色的风景。', image: '/images/world/landscape.svg', alt: '由柔和绿、米色与陶土色构成的抽象山丘插画', kind: 'illustration', rotation: 4 },
    ],
  },
];
