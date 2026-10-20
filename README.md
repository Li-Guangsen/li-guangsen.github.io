# SethLi 个人网站

个人介绍、项目展示和 Markdown 技术博客。使用 Next.js 静态导出，源码和文章统一保存在同一个 GitHub 仓库。

源码仓库：<https://github.com/Li-Guangsen/li-guangsen.github.io>。准备使用的 Pages 地址：<https://li-guangsen.github.io/>。

2026-10-20 正在从现有 Nginx 服务器迁移到 GitHub Pages。发布工作流已加入源码；首次远程推送和部署仍需完成 GitHub 授权及 Pages 设置。当前域名继续由原服务器提供服务。

## GitHub Pages 发布

`.github/workflows/pages.yml` 在推送 `main` 或手动运行时执行依赖安装、类型检查、静态构建和 Pages 发布。Pull Request 只执行检查与构建。Node.js 版本跟随 `.node-version`，构建产物为 `out/`。

首次发布：

1. 在仓库的 `Settings → Pages → Build and deployment → Source` 选择 `GitHub Actions`。
2. 为先验证 GitHub 默认地址，移除 `Settings → Pages → Custom domain` 中现有的 `sethli.tech` 绑定。源码中的旧 `CNAME` 已移除；使用 Actions 发布时，域名仍需在 Pages 设置中管理。
3. 在已获得 GitHub 写入权限的终端推送代码：

   ```bash
   cd /home/sethli/projects/personal-site
   git push -u origin main
   ```

4. 在 `Actions` 查看 `Deploy website to GitHub Pages`，确认发布成功后访问 <https://li-guangsen.github.io/>，检查首页、博客、文章直链、项目及 404。

仓库名匹配 `Li-Guangsen` 的用户主页地址，所以静态资源位于根路径，不需要配置项目子路径。Pages 发布只上传 `out/`，网站源码、文章原稿和依赖不作为 Pages 文件发布。

公开仓库内已经提交的源码和文章文件仍可在 GitHub 查看；`draft: true` 只控制文章是否进入生成的网站。

### 网站地址与以后换域名

`data/site.ts` 的 `site.url` 从公开构建变量 `NEXT_PUBLIC_SITE_URL` 读取，默认值为 `https://li-guangsen.github.io`。该网址用于站点地图和分享元数据，不影响仓库名。

GitHub Actions 读取仓库的 `Settings → Secrets and variables → Actions → Variables` 中的普通变量 `SITE_URL`。以后换域名时，更新该变量和 Pages 的 Custom domain，再重新运行工作流。该变量是公开网址，使用 Variables 即可。

在本机构建时，可以参考 `.env.example` 创建 `.env.local`，或通过环境变量指定网址：

```bash
NEXT_PUBLIC_SITE_URL=https://li-guangsen.github.io npm run build
```

完成 Pages 发布后再将自定义域名的 DNS 从服务器切换到 GitHub Pages；切换前保留下面的服务器维护和回退说明。

工作流与域名设置说明：<https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>、<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>。

## 服务器目录

| 目录 | 用途 |
| --- | --- |
| `/home/sethli/projects/personal-site` | 源码；以后在这里修改资料、文章和样式 |
| 项目中的 `out/` | 每次 `npm run build` 生成的静态网站 |
| `/var/www/sethli.tech/current` | Nginx 使用的网站目录 |
| `/home/sethli/backups/personal-site` | 迁移备份和网站更新前的备份 |

源码目录结构：

```text
app/             页面、路由、全局样式及网站元数据
components/      导航、项目卡片、博客搜索等组件
content/posts/   Markdown 文章
data/            个人资料与项目列表
lib/             文章读取与渲染
public/          头像、图片和图标
scripts/         本机静态预览
deploy/          Nginx 配置示例
```

`node_modules/`、`.next/`、`out/`、`next-env.d.ts` 和 `*.tsbuildinfo` 是依赖或生成文件，不需要从 Windows 继续复制，也不应加入 Git。换平台时根据 `package-lock.json` 重新安装依赖。

类型检查的增量缓存统一写入 `.next/cache/tsconfig.tsbuildinfo`，不会在源码根目录生成缓存文件。`.next/cache/` 可以删除，下次检查或构建会自动生成。`next.config.ts`、`tsconfig.json`、`.node-version`、`next-env.d.ts` 和 `AGENTS.md` 均为跨平台项目配置或工具文件，需要保留。

## 构建环境

项目要求 Node.js 22 或更高版本。本服务器已在 sethli 用户目录安装 Node.js 24.21.0，版本记录在 `.node-version`，官方版本说明见 <https://nodejs.org/en/about/previous-releases>。

Node.js 位于 `/home/sethli/.local/lib/node-v24.21.0-linux-x64`，命令入口位于 `/home/sethli/.local/bin`。Ubuntu 默认的 `~/.profile` 已支持这个目录；重新登录后可直接使用 `node` 和 `npm`。如果旧终端找不到命令，可以执行：

```bash
export PATH="/home/sethli/.local/bin:$PATH"
```

首次安装依赖、修改依赖或从另一台机器迁移后执行：

```bash
cd /home/sethli/projects/personal-site
npm ci
```

日常修改文章和页面不需要反复安装依赖。

## 修改个人内容

- `data/site.ts`：网站名称、域名、头像、简介、兴趣、公开邮箱、GitHub、经历和项目列表。
- `content/posts/*.md`：博客文章；文件名会成为文章 URL。
- `public/`：头像和项目图片等静态资源，例如 `public/images/avatar.webp` 对应 `/images/avatar.webp`。
- `app/globals.css`：配色和排版。
- `app/projects/[slug]/page.tsx`：当前项目详情正文；新增项目时也应补充相应正文。

尚未提供的经历、邮箱和 GitHub 不会显示。当前简介为初版文案，三篇文章都标为“示例”。正式发布自己的内容时，可替换或删除示例文章，并在 `data/site.ts` 将 `preview` 改为 `false`；这会移除预览提示并允许搜索引擎收录。

## 新增博客文章

在 `content/posts/` 新建 `my-first-post.md`，文件名使用小写英文、数字和连字符：

```markdown
---
title: '我的第一篇笔记'
description: '一句话简介'
date: '2026-10-11'
category: '技术笔记'
tags: ['学习记录']
sample: false
draft: false
---

## 从这里开始

正文写在这里。
```

日期使用引号。`draft: true` 的文章不会出现在页面或构建输出中；`sample: true` 会显示示例标签。分类和搜索会根据文章自动更新。当前支持 Markdown、表格和代码块，未启用 MDX/JSX。

文章渲染只接受自己维护的本地 Markdown 文件。

## 检查、构建与预览

```bash
cd /home/sethli/projects/personal-site
npm run typecheck
npm run build
```

`typecheck` 会先生成 Next.js 路由类型，因此清理 `.next/` 后也能独立运行。构建成功后，静态网页和资源位于 `out/`。

开发预览：

```bash
npm run dev
```

默认地址为 `http://127.0.0.1:3000`，保存文件后会自动更新。检查构建结果：

```bash
npm run preview
```

默认地址为 `http://127.0.0.1:4173`。两个预览服务都只监听服务器本机，电脑访问需要 SSH 端口转发。按 `Ctrl+C` 停止。生产网站由 Nginx 提供访问，不需要保持预览或 Node.js 进程运行。

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

## 域名与 HTTPS

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

## 证书维护

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

## Git 版本管理

源码仓库位于 `/home/sethli/projects/personal-site/.git`，分支为 `main`。2026-10-20 的初始提交保存了恢复后的项目说明及当前网站源码。依赖、构建产物、环境变量文件和私钥不加入版本管理；`.gitattributes` 统一文本文件使用 LF 换行。

远程 `origin` 已配置为 `https://github.com/Li-Guangsen/li-guangsen.github.io.git`，现有 GitHub 提交历史已取回并保留；首次推送需要 GitHub 写入权限。提交身份在缺少既有 Git 配置时暂用本仓库专属的 `sethli <sethli@localhost>`，不会修改全局身份；以后可以在仓库内用 `git config user.name` 和 `git config user.email` 设置自己的提交身份。

修改前后检查状态和差异，确认修改内容后提交：

```bash
cd /home/sethli/projects/personal-site
git status
git diff
git add -A
git commit -m "Update site content"
git push
```

每次提交都会形成一个恢复点。Git 不会自动保存尚未提交的修改。完成首次 Pages 设置后，推送 `main` 会自动构建并发布网站；如果仍需更新原服务器目录，按前文的服务器回退步骤操作。

查看最近的版本及某个版本的文件：

```bash
git log --oneline -10
git show HEAD:README.md
```

如果 README 又被误覆盖，确认丢弃它尚未提交的内容后，恢复到最近一次提交：

```bash
git restore --source=HEAD -- README.md
```

初次提交后会在 `/home/sethli/backups/personal-site/` 保存 `git-initial-*.bundle`，其中包含 Git 提交历史和源码，可以单独克隆恢复。该备份包保存在同一台服务器，尚未建立异地副本。需要保存后续所有已提交版本时，可生成新包：

```bash
cd /home/sethli/projects/personal-site
bundle_path="/home/sethli/backups/personal-site/git-$(date +%Y%m%d-%H%M%S).bundle"
git bundle create "$bundle_path" --all
git bundle verify "$bundle_path"
```

## 实现说明

- 原创页面实现，栏目结构参考 neuromancer.club，未复制对方的头像、照片、文章或源码。
- 深浅色偏好保存在本机浏览器。
- 无数据库、登录、第三方统计或远程字体依赖。
- `public/social-card.svg` 是矢量分享图草稿，后续可制作 PNG 以提高社交平台兼容性。
