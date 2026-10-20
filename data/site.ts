// Personal information lives here. Leave unknown fields empty until you want to publish them.
export const site = {
  // The brand is independent of whichever domain hosts the website.
  name: 'sethli',
  // Displayed only in the footer copyright; it does not control hosting or branding.
  footerDomain: 'sethli.tech',
  // Public build-time URL; set NEXT_PUBLIC_SITE_URL when moving to a custom domain.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://li-guangsen.github.io').replace(/\/+$/, ''),
  title: '一个持续生长的个人空间',
  description: '个人介绍、项目作品与技术笔记。记录学习，也记录从想法到实现的过程。',
  initials: 'S',
  preview: true,
  introduction: [
    '这里用来收藏认真做过的东西，以及值得再次翻开的笔记。',
    '从一个小问题出发，在实践中寻找答案。把过程写下来，让零散的想法慢慢连成线。',
  ],
  // Set these to your own public links. Empty values are not displayed.
  github: 'https://github.com/Li-Guangsen',
  wechat: 'Quenching_raw',
  email: 'liguangsen60@qq.com',
  location: '',
  // Logo A is the default avatar. A personal photo can replace it later.
  avatar: '/brand/avatar-512.png',
  interests: ['个人项目', '技术写作', '持续学习'],
  // Example: { title: '学校或公司', description: '专业或职位', period: '2024 — 2026' }
  experience: [] as { title: string; description: string; period: string }[],
  education: [
    { title: '山东科技大学', description: '计算机科学与技术硕士', period: 'Sep 2025 – Present' },
    { title: '山东科技大学', description: '计算机科学与技术学士', period: 'Sep 2021 – Jun 2025' },
  ],
  // Fill these only with technologies you want to list as your own skills.
  skills: ['Java', 'Python', 'C', 'Spring Boot', 'FastAPI', 'MySQL', 'Redis', 'Linux', 'Docker', 'Next.js', 'Git'],
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
  image?: string;
  notes?: { title: string; paragraphs?: string[]; items?: string[] }[];
};

export const projects: Project[] = [
  {
    slug: 'personal-site',
    title: '一个属于自己的数字空间',
    eyebrow: 'PERSONAL WEBSITE',
    description: '把个人介绍、项目与文章放在同一个地方。简洁、轻量，也留出继续生长的空间。',
    tags: ['Next.js', 'TypeScript', 'Velite', 'MDX'],
    status: '持续构建',
    year: '2026',
    github: 'https://github.com/Li-Guangsen/li-guangsen.github.io',
    notes: [
      { title: '给过程一个落脚的地方', paragraphs: ['把项目、笔记和日常观察放进同一个空间。保留清晰的层次、安静的配色，也让每一次小小的更新有迹可循。'] },
      { title: '这一版能做什么', items: ['个人首页：简介、公开 GitHub 活动、可配置的经历与技能。', '项目与学习：作品手记、技术标签、源码入口和学习笔记。', '技术写作：Markdown / MDX、分类标签、搜索、置顶与分页。', '阅读体验：代码高亮与复制、数学公式、交互图表、目录和阅读进度。', '拾光收藏：可拖动、可放大浏览的图像册。'] },
      { title: '怎样继续生长', paragraphs: ['文章和资料随源码一起保存，每次提交都留下一个可恢复的版本。推送到 GitHub 后，Actions 自动完成内容编译、静态构建和 GitHub Pages 发布。', '这里仍保留明确标注的写作与插画示例，之后可以逐步换成真实的笔记、照片和项目记录。'] },
    ],
  },
];

// Learning showcases link to actual notes; this entry is explicitly an example.
export const learning = [{
  title: '把一道题，拆成可以理解的步骤',
  description: '用二分查找演示如何记录思路、代码、复杂度和复盘，也试着让抽象的过程动起来。',
  tags: ['算法', '交互演示', '写作示例'],
  href: '/blog/binary-search-field-notes/',
}];
