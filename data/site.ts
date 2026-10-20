// Personal information lives here. Leave unknown fields empty until you want to publish them.
export const site = {
  name: 'sethli.tech',
  url: 'https://sethli.tech',
  title: '一个持续生长的个人空间',
  description: '个人介绍、项目作品与技术笔记。记录学习，也记录从想法到实现的过程。',
  initials: 'S',
  preview: true,
  introduction: [
    '这里用来收藏认真做过的东西，以及值得再次翻开的笔记。',
    '从一个小问题出发，在实践中寻找答案。把过程写下来，让零散的想法慢慢连成线。',
  ],
  // Set these to your own public links. Empty values are not displayed.
  github: '',
  email: '',
  location: '',
  // Set this to a URL such as /images/avatar.webp to use your own avatar.
  avatar: '',
  interests: ['个人项目', '技术写作', '持续学习'],
  // Example: { title: '学校或公司', description: '专业或职位', period: '2024 — 2026' }
  experience: [] as { title: string; description: string; period: string }[],
};

export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
  status: string;
  year: string;
  url?: string;
  github?: string;
};

export const projects: Project[] = [
  {
    slug: 'personal-site',
    title: '一个属于自己的数字空间',
    eyebrow: 'PERSONAL WEBSITE',
    description: '把个人介绍、项目与文章放在同一个地方。简洁、轻量，也留出继续生长的空间。',
    tags: ['Next.js', 'TypeScript', 'Markdown'],
    status: '持续构建',
    year: '2026',
  },
];
