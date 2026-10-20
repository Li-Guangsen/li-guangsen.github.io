<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/wordmark-dark.svg">
  <img src="public/brand/wordmark.svg" width="180" alt="sethli 字标">
</picture>

# sethli 个人网站

个人介绍、项目展示、技术笔记与生活收藏。使用 Next.js + Velite + MDX 构建，静态导出后由 GitHub Pages 托管。源码和文章保存在同一个仓库，继续沿用奶油色、橄榄绿与留白为主的原有风格。

- 源码：<https://github.com/Li-Guangsen/li-guangsen.github.io>
- 当前主页：<https://li-guangsen.github.io/>
- 写作说明：[content/README.md](content/README.md)

当前维护和发布以 GitHub Pages 为准，访问默认主页不需要腾讯云服务器。原有 `sethli.tech` 与 Nginx 配置保留，本次功能重构不修改腾讯云站点、DNS 或证书；文末的服务器说明仅供历史查阅和按需回退。

## 架构与功能

```text
content/posts/*.md 或 *.mdx
        ↓ Velite：校验元数据、编译正文、过滤草稿
.velite/posts.json + post-summaries.json
        ↓ Next.js App Router：预生成页面
out/ 静态网页与资源
        ↓ GitHub Actions
GitHub Pages
```

| 部分 | 实现 |
| --- | --- |
| 页面 | Next.js App Router、React、TypeScript，`output: 'export'` |
| 内容 | Velite 严格校验，兼容旧 `.md` 与新 `.mdx`，文章文件名保留为 URL |
| 博客列表 | 多分类、置顶、分页、带 URL 状态的筛选；全站快捷搜索匹配标题、摘要、标签和分类 |
| 阅读 | 同类文章导航、滚动目录、阅读进度、上一篇与下一篇、文章独立元数据 |
| 代码与公式 | Shiki / rehype-pretty-code 代码高亮和复制，KaTeX 数学公式 |
| 图表 | Mermaid 在构建时生成 SVG；阅读时缩放、拖动、复位和复制源码 |
| 扩展语法 | GFM 表格、任务列表、脚注、提示块、Emoji、标题锚点和 React 交互组件 |
| 个人展示 | 可选教育、经历与技能，GitHub 资料名片、原创/Fork 仓库分组、贡献日历、项目卡片与图片，以及可拖动的兴趣收藏卡片 |
| 交互 | 深浅色切换、页面与卡片动画、头像彩纸效果，并尊重减少动态效果偏好 |
| 发布 | GitHub Actions 自动构建，GitHub Pages 托管，定时刷新公开贡献数据 |

按需求不接入评论系统。列表、搜索和关联文章只使用不含编译正文的摘要数据，正文随当前文章页面加载，避免把所有文章放进公共浏览器脚本。未发布文章不会进入公开文章数据、搜索或站点地图；公开仓库中的原稿仍可在 GitHub 查看。

## 项目目录

```text
app/                     页面、路由、全局样式、元数据与站点地图
components/              页面组件、文章渲染、搜索及交互展示
content/posts/           Markdown / MDX 文章
content/README.md        文章字段与正文语法说明
data/site.ts             个人信息与项目列表
data/world.ts            兴趣收藏卡片配置
data/github-activity.json 已验证的 GitHub 公开贡献快照
data/github-profile.json  已验证的 GitHub 资料与公开仓库快照
lib/                     文章与界面数据处理
public/                  头像、项目图、原创插画与图标
scripts/                 内容开发、贡献数据刷新和静态预览
tests/                   关键逻辑与浏览器回归检查
velite.config.ts         内容结构与编译插件配置
.github/workflows/       自动检查、构建和 Pages 发布
deploy/                  原服务器 Nginx 配置示例
```

`node_modules/`、`.next/`、`.velite/`、`public/static/`、`out/`、`next-env.d.ts` 和 `*.tsbuildinfo` 是依赖或生成文件，不加入 Git，也不需要从 Windows 继续复制。`public/static/` 专用于 Velite 复制的文章资源，会在内容构建时清理；自己维护的图片应放在 `public/images/` 等目录，或文章旁由 Velite 处理。

类型检查缓存写入 `.next/cache/tsconfig.tsbuildinfo`。`next.config.ts`、`tsconfig.json`、`.node-version` 和 `AGENTS.md` 是需要保留的跨平台配置或工具说明。

## 安装与本地开发

使用 `.node-version` 指定的 Node.js；项目要求 Node.js 22 或更高版本。本服务器已安装 Node.js 24.21.0，命令入口为 `/home/sethli/.local/bin`。旧终端找不到命令时执行 `export PATH="/home/sethli/.local/bin:$PATH"`，不需要重复安装 Node.js。

首次克隆、换平台或修改依赖后：

```bash
cd /home/sethli/projects/personal-site
npm ci
npx playwright install --with-deps chromium
```

Playwright Chromium 仅用于构建 Mermaid 图表和浏览器验证，线上静态网站不需要运行浏览器进程。Ubuntu 的 `--with-deps` 会通过系统包管理器安装所需库，可能需要 sudo 权限；已有系统依赖时可执行 `npx playwright install chromium`。GitHub Actions 会准备构建所需浏览器和依赖。

```bash
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。开发脚本先严格构建内容，再同时监听文章和页面变化；修改 `.md` / `.mdx` 后自动更新，按 `Ctrl+C` 结束。

| 命令 | 用途 |
| --- | --- |
| `npm run content:build` | 单次严格编译文章；非法日期、文件名、字段和重复 URL 会阻止构建 |
| `npm run content:watch` | 单独监听并编译文章 |
| `npm run github:refresh` | 刷新 GitHub 资料、公开仓库与贡献快照 |
| `npm run typecheck` | 先编译内容，再生成 Next.js 路由类型并运行 TypeScript |
| `npm test` | 检查搜索、分页与 GitHub 外部数据校验 |
| `npm run test:browser` | 构建后检查搜索、文章交互、移动端和收藏预览；自动启动并清理静态预览 |
| `npm run build` | 刷新 GitHub 数据、严格编译内容、生成 `out/` |
| `npm run preview` | 在 `http://127.0.0.1:4173` 预览构建结果 |

这里的内容命令显式使用 `--strict`；Velite CLI 的默认值会覆盖配置中的严格选项，不能省掉这个参数。

两个预览服务默认只监听本机；在远程服务器开发时，可通过 SSH 端口转发访问。GitHub Pages 正式网站由平台提供访问，不依赖开发预览进程。

## 修改个人资料与展示

- `data/site.ts`：网站名称、地址、头像、简介、兴趣、公开邮箱、GitHub、教育、经历、技能与项目列表。GitHub 使用已确认的 `Li-Guangsen`；未提供的履历保持空值，只填写真实资料。
- `data/world.ts`：兴趣收藏的分组、标题、说明和图片。当前图片是原创示意插画，明确标注为插画；替换成自己的照片或截图后再设置相应类型与说明。
- `public/images/`：自己维护的头像、项目图片与收藏素材；例如 `public/images/avatar.webp` 对应 `/images/avatar.webp`。
- `app/globals.css` 与组件样式文件：配色、排版和交互样式。
- `app/projects/[slug]/page.tsx`：项目详情；新增项目时同步补充正文。

首页的 GitHub 日历展示真实公开贡献快照。每次构建以及每日定时工作流会抓取 `Li-Guangsen` 的公开贡献日历，校验账户、连续日期、每日次数和汇总值后写入 `data/github-activity.json`。网络异常时使用最近一次已验证快照，页面显示快照更新时间；不会编造贡献数据，也不需要访客提供 GitHub Token。

首页 GitHub 名片与项目页仓库列表来自公开 GitHub API，在构建时写入 `data/github-profile.json`。原创仓库和 Fork 分组展示，Fork 显示上游来源，不把上游作品计为个人原创。简介、地区和技术语言只在公开资料有值时展示；访客浏览时不请求 GitHub API。刷新失败时使用已验证快照。

当前仍保留预览模式与明确标记的示例文章。填好自己的资料、替换示例后，在 `data/site.ts` 将 `preview` 改为 `false`，移除预览提示并允许搜索引擎收录。此开关不会自动把示例文章变成真实个人记录，示例标签由各文章的 `sample` 字段决定。

## 品牌与字体

网站品牌为 **sethli**，与托管域名分开配置。页面标题、页眉、页脚、头像、项目插图和分享图均不携带域名后缀。以后换域名只需调整公开站点地址与托管设置。

- A 标志用于 favicon 与默认头像：深色圆角方块、衬线 S、浅绿圆点。矢量原稿为 `public/icon.svg` 和 `public/brand/avatar.svg`，同时提供 16/32 px favicon 与 180 px Apple 图标。
- B 字标用于页眉、页脚与本文档，保留衬线字形和绿色句点，省去域名后缀。文档提供浅色和深色背景版本。
- `public/fonts/` 保存 Source Serif 4 与 JetBrains Mono 的 Latin 字符子集及许可证，由 `app/fonts.ts` 自托管；中文正文使用系统中文字体，不加载整套中文网页字体，也不依赖 Google Fonts 在线请求。
- 全站正文与辅助文案按用途分级，中文正文以 16 px 为基准，文章阅读字号为 16–17 px；窄屏同步调整行距、留白与控件布局。

## 写一篇算法或学习笔记

在 `content/posts/` 新建 `my-first-post.md`；需要交互组件时使用 `.mdx`。文件名只用小写英文、数字与连字符，它决定文章地址，修改标题不会改变 URL。

```markdown
---
title: '今天的算法练习'
description: '记录问题、关键思路和边界条件。'
date: '2026-10-20'
categories: ['算法', '学习笔记']
tags: ['Python']
sample: false
published: true
pinned: false
toc: true
---

## 题目与思路

从这里开始记录。
```

日期使用引号。旧的 `category` 单分类和 `draft` 字段继续兼容；`draft: true` 或 `published: false` 隐藏文章，`pinned: true` 置顶，`toc: false` 关闭当前文章目录。英文分类统一大小写，避免产生重复分类。

完整语法与字段说明见 [content/README.md](content/README.md)。[binary-search-field-notes.mdx](content/posts/binary-search-field-notes.mdx) 是明确标记的功能示例，包括 Python 代码、数学公式、Mermaid 流程图和 `<AlgorithmSteps />`。原有 3 篇文章的文件名与 URL 保留。内容编译只处理项目维护者审阅过的本地文章；MDX 与其他源码一样可以执行组件逻辑。

完成修改后检查并发布：

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
npm run preview
```

## GitHub Pages 发布

```bash
git status
git diff
git add -A
git commit -m "Write a new learning note"
git push
```

推送 `main` 后，`.github/workflows/pages.yml` 自动检查、构建并上传 `out/` 到 GitHub Pages。Pull Request 只检查和构建；也可以在仓库 Actions 手动运行。Node.js 版本跟随 `.node-version`。定时工作流刷新 GitHub 资料、仓库与贡献日历，不需要人工新增提交。

在 [Actions](https://github.com/Li-Guangsen/li-guangsen.github.io/actions) 查看 `Deploy website to GitHub Pages`；发布成功后访问 <https://li-guangsen.github.io/>。Pages 上传的是静态产物，不会把原始仓库目录或 `node_modules/` 当作网站发布。

首次设置已于 2026-10-20 完成：`Settings → Pages → Build and deployment → Source` 使用 `GitHub Actions`，旧 Custom domain 绑定与源码 `CNAME` 已移除。仓库名匹配用户主页地址，资源使用根路径，不需要项目子路径。首次发布记录保留为 <https://github.com/Li-Guangsen/li-guangsen.github.io/actions/runs/39418219609>（提交 `6769b0d`）；该记录对应最初版本，不代表此后修改的发布状态。

### 网站地址与以后换域名

`data/site.ts` 的 `site.url` 从公开变量 `NEXT_PUBLIC_SITE_URL` 读取，默认 `https://li-guangsen.github.io`，用于站点地图与分享元数据。仓库与源文件不绑定自定义域名。

Actions 读取 `Settings → Secrets and variables → Actions → Variables` 中的普通变量 `SITE_URL`。以后使用自定义域名时，设置 Pages 的 Custom domain、`SITE_URL` 和相应 DNS，再重新运行工作流。公开网址放 Variables 即可，无需保存为 Secret。

本地可参考 `.env.example` 创建 `.env.local`，或临时指定构建地址：

```bash
NEXT_PUBLIC_SITE_URL=https://li-guangsen.github.io npm run build
```

目前不执行腾讯云或 DNS 迁移。GitHub 官方说明：[自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[自定义域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

## 原服务器目录与回退记录

以下保留原部署记录，只在明确需要维护或回退旧站点时使用。当前 GitHub Pages 更新不需要同步服务器目录。

| 目录 | 用途 |
| --- | --- |
| `/home/sethli/projects/personal-site` | 当前源码工作目录 |
| 项目中的 `out/` | 当前静态构建产物 |
| `/var/www/sethli.tech/current` | 原 Nginx 网站目录，本次重构不修改 |
| `/home/sethli/backups/personal-site` | 独立源码、Git 历史和旧部署备份 |

## 服务器回退更新（需要时）

构建完成后，先备份当前网站，再同步 `out/` 的内容：

```bash
cd /home/sethli/projects/personal-site
NEXT_PUBLIC_SITE_URL=https://sethli.tech npm run build
backup_dir="/home/sethli/backups/personal-site/site-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
rsync -a /var/www/sethli.tech/current/ "$backup_dir/"
rsync -a --delete --chmod=D755,F644 out/ /var/www/sethli.tech/current/
```

只复制 `out/` 里的内容，不要把源码和 `node_modules/` 放到网站目录。普通内容更新无需重载 Nginx。

需要回退时，将上述备份目录替换为实际路径后执行：

```bash
rsync -a --delete --chmod=D755,F644 /home/sethli/backups/personal-site/site-实际时间/ /var/www/sethli.tech/current/
```

## 原服务器的域名与 HTTPS

2026-10-11 已完成域名解析和 HTTPS 配置。网站地址为 <https://sethli.tech/>，HTTP 会以 301 跳转到 HTTPS，并保留原路径和查询参数。网站目录为 `/var/www/sethli.tech/current`，服务器公网 IPv4 为 `43.167.185.41`。

实际 Nginx 配置位于 `/etc/nginx/sites-available/sethli.tech`，启用链接位于 `/etc/nginx/sites-enabled/sethli.tech`。`deploy/nginx.conf.example` 是尚未配置 HTTPS 时使用的初始 HTTP 模板。日常内容更新使用前一节的构建和同步步骤；服务器配置修改使用现用 Nginx 配置，并在重载前执行 `sudo nginx -t`。

`sethli.tech` 的 DNS 由 Cloudflare 管理，目前为以下记录：

| 字段 | 值 |
| --- | --- |
| Type | A |
| Name | @ |
| IPv4 address | 43.167.185.41 |
| Proxy status | Proxied（橙色云朵，已验证生效） |
| TTL | Auto |

Cloudflare 代理已启用，2026-10-11 通过两个 Cloudflare 地址验证 HTTPS 返回 200、HTTP 跳转到 HTTPS。2026-10-11 用户已确认在控制台将 SSL/TLS 模式设置为 `Full (strict)`（界面显示“完整（严格）”）并保存；设置后再次验证 Cloudflare 代理下的主要页面、JavaScript 资源、自定义 404 和保留路径及参数的 HTTP 跳转，全部通过。服务器已安装符合严格模式要求的 Let's Encrypt 证书。官方说明见 <https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/> 和 <https://developers.cloudflare.com/dns/proxy-status/>。

## 原服务器的证书维护

Certbot 5.8.0 通过官方 snap 安装，使用 Nginx 插件签发和部署 `sethli.tech` 的证书。首次证书到期日期为 `2027-01-09`，自动续期会更新这个日期。正式证书位于 `/etc/letsencrypt/live/sethli.tech/`。

自动续期由已启用的 `snap.certbot.renew.timer` 执行。维护时可查看证书和定时任务：

```bash
sudo certbot certificates
systemctl list-timers --all 'snap.certbot.renew.timer'
```

2026-10-11 的模拟续期已成功通过。下面的命令使用测试环境，并跳过本次测试的随机等待，不替换正式证书或更改定时任务：

```bash
sudo certbot renew --dry-run --no-random-sleep-on-renew
```

HTTPS 设置和部署不会修改网站源码、资料或文章。当前 `data/site.ts` 仍为 `preview: true`，示例内容仍显示示例标识；补充自己的资料和文章后，可按前文说明关闭预览标记并重新构建。

Nginx 默认站点的备份在 `/home/sethli/backups/personal-site/nginx-20261011-http/`，安装 HTTPS 前的有效 HTTP 配置备份在 `/home/sethli/backups/personal-site/nginx-20261011-before-https/`，完成后的 HTTPS 配置备份在 `/home/sethli/backups/personal-site/nginx-20261011-https/`。

## 本次迁移备份

`/home/sethli/backups/personal-site/migration-20261011/` 保存迁移前的源码压缩包、Windows 的 `node_modules/`、`.next/`、类型检查缓存、原预览截图及检查脚本，以及原来的 `out/`。`site-before/` 保存同步前的网站目录。旧依赖仅供回退和参考，Linux 构建使用重新安装的依赖。

2026-10-20 已初始化 Git 仓库，主分支为 `main`。以后备份或迁移源码时保留 `package-lock.json`，排除生成目录。

本次参考站功能重构前的独立恢复点为 `/home/sethli/backups/personal-site/before-reference-rebuild-20261020-204454/`，包含 `repository.bundle`（全部已提交 Git 历史）和 `source.tar.gz`（重构前源码快照）。它们保存在项目目录之外，不会被内容构建或 Git 操作覆盖。

品牌与 GitHub 展示调整前的恢复点为 `/home/sethli/backups/personal-site/before-brand-profile-20261020-212135/`，包含完整 Git 历史及提交 `c8ba72f` 的源码快照。

## Git 版本管理

源码仓库位于 `/home/sethli/projects/personal-site/.git`，分支为 `main`。2026-10-20 的初始提交保存了恢复后的项目说明及当前网站源码。依赖、构建产物、环境变量文件和私钥不加入版本管理；`.gitattributes` 统一文本文件使用 LF 换行。

远程 `origin` 的取回地址为 `https://github.com/Li-Guangsen/li-guangsen.github.io.git`，推送地址为 `git@github.com:Li-Guangsen/li-guangsen.github.io.git`。现有 GitHub 提交历史已合并保留，2026-10-20 已成功完成首次源码推送。提交身份在缺少既有 Git 配置时暂用本仓库专属的 `sethli <sethli@localhost>`，不会修改全局身份；以后可以在仓库内用 `git config user.name` 和 `git config user.email` 设置自己的提交身份。

服务器使用仓库专用 SSH deploy key，GitHub 中的标题为 `Tencent-Tokyo-Server`，已启用写入权限。密钥通过本仓库的 `core.sshCommand` 配置使用，私钥保存在 sethli 用户的 `.ssh/` 中，不加入版本管理。此密钥用于 Git 推送；GitHub Pages 的后台设置仍通过仓库网页管理。

修改前后检查状态和差异，确认修改内容后提交：

```bash
cd /home/sethli/projects/personal-site
git status
git diff
git add -A
git commit -m "Update site content"
git push
```

每次提交都会形成一个恢复点。Git 不会自动保存尚未提交的修改。推送 `main` 会自动构建并发布 Pages 网站；如果仍需更新原服务器目录，按前文的服务器回退步骤操作。

查看最近的版本及某个版本的文件：

```bash
git log --oneline -10
git show HEAD:README.md
```

如果 README 又被误覆盖，确认丢弃它尚未提交的内容后，恢复到最近一次提交：

```bash
git restore --source=HEAD -- README.md
```

初次提交后在 `/home/sethli/backups/personal-site/` 保存了 `git-initial-*.bundle`，Pages 迁移前后也保存了独立的 Git 备份包，均包含 Git 提交历史和源码，可以单独克隆恢复。这些备份包保存在服务器本机；已推送的源码和历史另有 GitHub 远程副本。需要保存后续所有已提交版本时，可生成新包：

```bash
cd /home/sethli/projects/personal-site
bundle_path="/home/sethli/backups/personal-site/git-$(date +%Y%m%d-%H%M%S).bundle"
git bundle create "$bundle_path" --all
git bundle verify "$bundle_path"
```

## 实现与素材说明

技术路线和功能组织参考 [neuromancer.club](https://neuromancer.club/)；页面、文案、交互样式和演示素材按本站原有风格重新实现，不复用对方头像、照片、个人经历或文章。

深浅色偏好保存在访客本机浏览器。线上网站不需要数据库、账户登录或常驻后端，也不接入评论与第三方统计。GitHub 资料、仓库与贡献数据在构建阶段读取，页面本身读取静态快照。

`public/social-card.svg` 是分享图矢量素材；页面分享元数据使用对应的 `public/brand/social-card.png`，兼容要求位图的社交平台。
