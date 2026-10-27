// Personal information lives here. Leave unknown fields empty until you want to publish them.
export const site = {
  // The brand is independent of whichever domain hosts the website.
  name: 'sethli',
  displayName: '李广森',
  bio: [
    '苦命研究生，CS 在读',
    '徒步佬一枚，看世界，也找自己',
    '电影爱好者，魂系游戏玩家',
    '喜欢折腾技术，后端开发学习中',
    '偶尔写点东西，记录思考',
  ],
  // Displayed only in the footer copyright; it does not control hosting or branding.
  footerDomain: 'sethli.tech',
  // Public build-time URL; set NEXT_PUBLIC_SITE_URL when moving to a custom domain.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://li-guangsen.github.io').replace(/\/+$/, ''),
  description: 'sethli 的个人主页：项目、技术笔记与 GitHub 活动。',
  initials: 'S',
  preview: true,
  // Set these to your own public links. Empty values are not displayed.
  github: 'https://github.com/Li-Guangsen',
  wechat: 'Quenching_raw',
  email: 'liguangsen60@qq.com',
  location: '',
  // Brand artwork for project cards. The homepage uses the local GitHub avatar snapshot.
  avatar: '/brand/avatar-512.png',
  interests: ['后端开发', 'AI Agent'],
  // Example: { title: '学校或公司', description: '专业或职位', period: '2024 — 2026' }
  experience: [] as { title: string; description: string; period: string }[],
  education: [
    { title: '山东科技大学', description: '计算机科学与技术硕士', period: 'Sep 2025 – Present' },
    { title: '山东科技大学', description: '计算机科学与技术学士', period: 'Sep 2021 – Jun 2025' },
  ],
  // Fill these only with technologies you want to list as your own skills.
  skills: ['Java', 'Python', 'C', 'Spring Boot', 'FastAPI', 'MySQL', 'Redis', 'Linux', 'Docker', 'Git'],
  exploring: ['LangGraph', 'MCP', 'RAG', 'Spring AI', 'OpenAI Agents SDK'],
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
  icon?: string;
  image?: string;
  notes?: { title: string; paragraphs?: string[]; items?: string[] }[];
};

export const projects: Project[] = [
  {
    slug: 'repopilot',
    title: 'RepoPilot',
    eyebrow: 'GITHUB AGENT',
    description: '基于 DeerFlow 的 GitHub 研发 Agent，探索 Issue 分析、代码修改与 Draft PR 交付。开发中。',
    tags: ['Python', 'LangGraph', 'MCP', 'Docker'],
    status: '开发中',
    year: '2026',
    github: 'https://github.com/Li-Guangsen/RepoPilot',
    icon: '/images/projects/repopilot.svg',
    notes: [
      { title: '当前进度', paragraphs: ['已完成 DeerFlow 上游源码梳理、环境检查和阶段规划，下一步是验证 Agent 工具调用与 Docker 沙箱运行。'] },
      { title: '开发计划', items: ['面向文档修复、单元测试补充和小 Bug 修复，分析 GitHub Issue 并制定计划。', '开发 Python 测试报告与 Diff 检查工具，记录实际测试结果和变更。', '打通 Issue → 沙箱修改与验证 → Draft PR 的流程，保留人工审核。'] },
      { title: '技术路线', paragraphs: ['基于 DeerFlow 二次开发，使用 Python、LangGraph、MCP 和 Docker Sandbox。测试报告工具与完整交付流程仍在规划中，开发进度记录在 GitHub 仓库。'] },
    ],
  },
  {
    slug: 'timecomm',
    title: 'TimeComm',
    eyebrow: '拾光社区 · JAVA BACKEND',
    description: '从零搭建的 Java 内容社区，围绕笔记、互动与搜索练习后端开发。目前处于基础工程阶段。',
    tags: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    status: '开发中',
    year: '2026',
    github: 'https://github.com/Li-Guangsen/TimeComm',
    icon: '/images/projects/timecomm.svg',
    notes: [
      { title: '当前进度', paragraphs: ['已创建 Java 17 / Maven 基础工程和开发计划，下一步是验证工程构建、搭建第一个 Spring Boot 业务模块。'] },
      { title: '开发计划', items: ['用户认证、个人资料与笔记发布。', '点赞、收藏、评论、关注及相关计数。', '随业务推进加入缓存、异步消息与内容检索，并补充测试和性能测量。'] },
      { title: '技术路线', paragraphs: ['计划采用 Spring Boot 3、MySQL 和 Redis，后续逐步引入 Spring Cloud Alibaba、RocketMQ 与 Elasticsearch。目前仍在工程搭建阶段，模块进度记录在 GitHub 仓库。'] },
    ],
  },
  {
    slug: 'personal-site',
    title: '个人网站',
    eyebrow: 'PERSONAL WEBSITE',
    description: 'Next.js 静态网站，支持 MDX 写作、文章搜索和 GitHub 活动同步。',
    tags: ['Next.js', 'TypeScript', 'Velite', 'MDX'],
    status: '维护中',
    year: '2026',
    github: 'https://github.com/Li-Guangsen/li-guangsen.github.io',
    notes: [
      { title: '简介', paragraphs: ['个人主页、项目展示和技术博客，使用 Next.js、Velite 与 MDX 构建，部署在 GitHub Pages。'] },
      { title: '这一版能做什么', items: ['个人首页：简介、公开 GitHub 活动、可配置的经历与技能。', '项目与学习：作品手记、技术标签、源码入口和学习笔记。', '技术写作：Markdown / MDX、分类标签、搜索、置顶与分页。', '阅读体验：代码高亮与复制、数学公式、交互图表、目录和阅读进度。', '拾光收藏：可拖动、可放大浏览的图像册。'] },
      { title: '更新方式', paragraphs: ['文章使用 Markdown / MDX 编写，推送后由 GitHub Actions 自动构建发布。GitHub 活动每天同步。', '示例文章与展示插画均有标注。'] },
    ],
  },
];

// Learning showcases link to actual notes; this entry is explicitly an example.
export const learning = [{
  title: '二分查找：交互笔记',
  description: '思路、Python 实现、复杂度分析和逐步演示。',
  tags: ['算法', '交互演示', '写作示例'],
  href: '/blog/binary-search-field-notes/',
}];
