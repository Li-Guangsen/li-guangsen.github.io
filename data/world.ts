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
    id: 'digital', eyebrow: '01 / ON THE SCREEN', title: '屏幕里的小宇宙',
    description: '给截图、实验与灵感留一张小桌子。先放上几张原创插画，等待真实记录慢慢填满。',
    cards: [
      { id: 'steps', title: '一步，再一步', caption: '把抽象的思路，变成看得见的过程。', image: '/images/world/algorithm.svg', alt: '橄榄绿方格纸上的柱状序列与排序箭头插画', kind: 'illustration', rotation: -4 },
      { id: 'terminal', title: '一个新的开始', caption: '从光标闪烁的地方开始。', image: '/images/world/terminal.svg', alt: '米色桌面上打开终端窗口的原创插画', kind: 'illustration', rotation: 3 },
      { id: 'orbit', title: '保持探索', caption: '还没有命名的想法，也可以先收藏。', image: '/images/world/orbit.svg', alt: '深绿色背景中的轨道、星点与纸飞机插画', kind: 'illustration', rotation: -2 },
    ],
  },
  {
    id: 'physical', eyebrow: '02 / AWAY FROM THE SCREEN', title: '屏幕之外的留白',
    description: '以后可以是一本书、一束光，或某次出门遇见的风景。这里的插画只作展示，不代表个人经历。',
    cards: [
      { id: 'pages', title: '翻过一页', caption: '给阅读、手写笔记和片刻停顿留个位置。', image: '/images/world/pages.svg', alt: '木色背景上的书本与一片橄榄叶插画', kind: 'illustration', rotation: 3 },
      { id: 'window', title: '光落进来', caption: '偶尔抬头，看看屏幕之外。', image: '/images/world/window.svg', alt: '奶油色窗台、绿色植物和午后光影的原创插画', kind: 'illustration', rotation: -3 },
      { id: 'landscape', title: '还未出发的远方', caption: '为将来自己的照片保留一块空白。', image: '/images/world/landscape.svg', alt: '由柔和绿、米色与陶土色构成的抽象山丘插画', kind: 'illustration', rotation: 4 },
    ],
  },
];
