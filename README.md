<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/wordmark-dark.svg">
  <img src="public/brand/wordmark.svg" width="180" alt="sethli 字标">
</picture>

# sethli 个人网站

个人介绍、项目展示、技术笔记与兴趣收藏。使用 Next.js、React、TypeScript、Velite 和 MDX 构建，静态导出并由 GitHub Pages 托管。

[访问网站](https://sethli.tech/) · [写作说明](content/README.md) · [素材来源](docs/ASSETS.md)

## 功能

- 居中头像与简介、单栏贡献日历、教育经历和技术栈；布局参考 neuromancer.club。
- 项目页独立展示项目卡片、GitHub 资料与仓库，区分本人创建与 Fork。
- Contact 菜单与页脚提供 GitHub、微信号复制、邮箱联系入口。
- Markdown / MDX 写作，支持分类、标签、置顶、分页和全站快捷搜索。
- 文章目录、阅读进度、关联文章、代码高亮与复制、KaTeX 公式、Mermaid 图表及 React 交互组件。
- 可拖动的“拾光”收藏与图片预览。
- 默认深色主题，记住手动切换的选择；支持响应式布局、键盘操作与减少动态效果偏好。
- GitHub Actions 自动检查和发布，每日刷新公开 GitHub 数据。不接入评论系统。

## 本地开发

使用 `.node-version` 指定的 Node.js 版本，在项目根目录执行：

```bash
npm ci
npx playwright install --with-deps chromium
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。修改文章和页面后会自动更新；按 `Ctrl+C` 结束。Chromium 用于构建 Mermaid SVG 和浏览器检查，线上静态网站不需要浏览器进程。

| 命令 | 用途 |
| --- | --- |
| `npm run content:build` | 严格校验并编译文章 |
| `npm run content:watch` | 监听文章变化 |
| `npm run github:refresh` | 更新公开 GitHub 资料、头像、仓库和贡献快照 |
| `npm run typecheck` | 编译内容并检查路由与 TypeScript 类型 |
| `npm test` | 检查搜索、分页和外部数据校验 |
| `npm run build` | 生成 `out/` 静态网站 |
| `npm run test:browser` | 检查构建产物的关键浏览器交互 |
| `npm run preview` | 在 `http://127.0.0.1:4173` 预览构建结果 |

内容命令需保留 `--strict`，非法字段、日期、文件名或重复文章地址会阻止发布。

页面文案以个人资料、项目事实和操作名称为主。动效只用于轻量反馈：页眉保持固定高度，卡片和文章列表悬停不改变布局，页面导航直接跳转。避免同时用 CSS 和动画库控制同一元素的 `transform`。浏览器检查覆盖正常动画与减少动态效果两种设置。

## 内容与配置

| 路径 | 用途 |
| --- | --- |
| `data/site.ts` | 品牌、公开联系链接、教育经历、技术栈和项目 |
| `data/world.ts` | 兴趣收藏的分组、说明与图片 |
| `content/posts/` | Markdown / MDX 文章 |
| `components/profile-details.tsx` | 教育与技术栈展示 |
| `components/github-profile.tsx` | 项目页的 GitHub 资料与仓库统计 |
| `components/github-activity.tsx` | 首页贡献日历 |
| `components/theme-toggle.tsx` | 主题切换与动画 |
| `public/brand/` | A/B 品牌资产、头像和分享图 |
| `public/icons/` | 本地托管的技术及社交图标 |
| `velite.config.ts` | 内容结构、校验与编译插件 |
| `.github/workflows/pages.yml` | 检查、构建与发布 |

品牌名称与托管地址分开配置。`site.name` 控制品牌；`site.footerDomain` 仅控制版权行的域名显示。`NEXT_PUBLIC_SITE_URL` 控制 canonical、站点地图和分享网址。本地构建默认使用 GitHub Pages 地址；正式发布时，Actions 自动读取 Pages 当前绑定的公开网址。

GitHub 数据在构建时刷新并校验，访客读取本地静态快照和头像，不请求 GitHub API。网络异常时使用已验证缓存。贡献日历使用 GitHub 对未登录访客展示的真实日期、次数与颜色等级，每天自动同步；Fork 保留上游来源。技术栈补充的 Agent 内容单列为探索方向，不标注掌握程度。

如果贡献总数少于本人登录 GitHub 后所见，在 GitHub 个人主页的贡献图右上角点击 `Contribution settings → Private contributions`，选择展示私有贡献的匿名统计，再重新构建网站。此设置只展示私有贡献数量，私有仓库名称和内容仍保持私有，详见 [GitHub 贡献可见性说明](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements)。网站不使用个人访问令牌读取私有活动。

当前示例文章和插画均有明确标识。填好资料、替换示例后，可将 `site.preview` 设为 `false`，允许搜索引擎收录。

## 写文章

在 `content/posts/` 新建 `.md` 或 `.mdx` 文件。小写英文文件名决定网址，正文从 `##` 标题开始：

```markdown
---
title: '今天的算法练习'
description: '记录问题、思路和边界条件。'
date: '2026-10-20'
categories: ['算法', '学习笔记']
tags: ['Python']
sample: false
published: true
pinned: false
toc: true
---

## 思路

从这里开始记录。
```

完整字段与扩展语法见 [content/README.md](content/README.md)。`draft: true` 或 `published: false` 隐藏网站中的文章；提交到公开仓库的原稿仍可从源码查看。

## 检查与发布

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
git add -A
git commit -m "Update site content"
git push
```

推送 `main` 后自动发布到 GitHub Pages；Pull Request 运行检查和构建。Pages 的 Source 使用 `GitHub Actions`。以后更换自定义域名时，调整 Pages 域名和 DNS，再重新运行工作流；网站的规范地址、站点地图和分享网址随 Pages 设置自动更新。Pull Request 不读取 Pages 配置，可用 Actions 普通变量 `SITE_URL` 指定构建网址，未设置时回退到 GitHub Pages 地址。

## 实现与素材

页面结构与视觉布局参考 [neuromancer.club](https://neuromancer.club/)：窄版个人首页、中性深浅色、网格背景、项目卡片、标签文章列表与拍立得相册。沿用本站组件独立实现，展示本站资料与内容。品牌资产、技术图标、校徽与社交图标来源见 [素材记录](docs/ASSETS.md) 及对应资源目录中的说明。

自托管字体附来源与许可证。依赖、构建产物、环境变量和私钥均不加入源码仓库。
