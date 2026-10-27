export type WorldCard = {
  id: string;
  title: string;
  caption: string;
  image: string;
  imagePosition?: string;
  alt: string;
  kind: 'illustration' | 'photo' | 'film';
  rotation: number;
};

export type WorldCollection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: WorldCard[];
};

// Published gallery items use the owner's supplied images.
export const worldCollections: WorldCollection[] = [
  {
    id: 'digital', eyebrow: '01 / DIGITAL', title: 'Digital World',
    description: '电影与数字世界的收藏。',
    cards: [
      { id: 'odyssey', title: '奥德赛', caption: '《奥德赛》· 电影剧照', image: '/images/world/odyssey.webp', alt: '《奥德赛》电影剧照：蓝色海面前，一名戴着黑色盔甲与高冠头盔的人物', kind: 'film', rotation: -3 },
    ],
  },
  {
    id: 'physical', eyebrow: '02 / EVERYDAY', title: 'Physical World',
    description: '户外照片与生活记录。',
    cards: [
      { id: 'bonfire', title: '腾格里', caption: '腾格里 · 篝火合影', image: '/images/world/bonfire.webp', alt: '腾格里的夜晚，大家围在篝火旁合影，手里拿着荧光棒', kind: 'photo', rotation: -3 },
      { id: 'canyon', title: '南太行', caption: '南太行 · 山间峡谷', image: '/images/world/canyon.webp', alt: '南太行层层延伸的山崖与峡谷，谷底有一条蜿蜒公路', kind: 'photo', rotation: 3 },
      { id: 'lakeside', title: '天鹅湖', caption: '天鹅湖 · 湖边留影', image: '/images/world/lakeside.webp', imagePosition: '50% 75%', alt: '天鹅湖边，身穿黄色外套、橙色鞋套的人跃起，背景是蓝天、白云和沙丘', kind: 'photo', rotation: -2 },
      { id: 'clawd-wizard', title: 'Clawd', caption: 'Wizard 版 Clawd 玩偶', image: '/images/world/clawd-wizard.webp', alt: '盒子里的橙色 Clawd 玩偶，戴着蓝色巫师帽，拿着黄色星星魔杖', kind: 'photo', rotation: 2 },
    ],
  },
];
