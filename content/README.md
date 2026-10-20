# 写文章

文章放在 `content/posts/`。现有 `.md` 可以继续使用；需要嵌入 React 交互组件时使用 `.mdx`。两个扩展名都由 Velite 编译，最终导出静态网页，推送 `main` 后 GitHub Actions 自动发布。

## 新建一篇笔记

文件名就是网址中的 slug，例如 `two-sum.md` 对应 `/blog/two-sum/`。只用小写英文字母、数字和连字符，不要用日期或标题字段覆盖 slug；同名 `.md` 与 `.mdx` 也会被视为重复地址并阻止构建。

```yaml
---
title: '今天的算法练习'
description: '题目、关键思路和下一次值得记住的边界条件。'
date: '2026-10-20'
categories: ['算法', '学习笔记']
tags: ['Python', '双指针']
sample: false
published: true
pinned: false
toc: true
---
```

在 `---` 后写正文。标题、摘要、日期、至少一个分类是必填字段。日期必须用引号包围，采用真实的 `YYYY-MM-DD` 日期。`tags` 可省略，默认空列表。原有的 `category: '算法'` 仍有效，多分类优先使用 `categories`；分类会去除多余空格并统一英文大小写，避免 `Agent` 和 `agent` 成为两个分类。

- `sample: true`：明确显示为示例内容，默认 `false`。
- `published: false` 或旧字段 `draft: true`：不生成公开文章、列表项、搜索项或站点地图条目。
- `pinned: true`：文章在列表中置顶，同一组内按日期从新到旧排列。
- `toc: false`：关闭该文章的目录，默认开启。正文从 `##` 开始写，页面会单独显示文章标题。

草稿文件提交到公开 GitHub 仓库后，原稿仍然公开；上述字段只控制网站展示。

## 可用的正文语法

- Markdown：表格、任务列表、删除线、自动链接、脚注、图片、引用。
- 代码：标明语言以启用高亮；围栏后可加 `title="example.py" {2-4}` 展示文件名和高亮行。没有语言时按纯文本处理。
- 公式：行内使用 `$x^2$`，独立公式用单独成行的 `$$` 包围。
- 图表：使用 `mermaid` 代码块，构建时生成 SVG；阅读时支持缩放、拖动、复位和复制源码。
- 提示块：引用首行写 `[!NOTE]`、`[!TIP]`、`[!IMPORTANT]`、`[!WARNING]` 或 `[!CAUTION]`，也可以在标记后填写自定义标题。
- Emoji：例如 `:seedling:`；标题自动生成可以复制的锚点。
- MDX：可以嵌入注册好的 React 组件，目前有 `<AlgorithmSteps />` 二分查找演示，无需在文章内导入。添加新组件时，在 `components/mdx-content.tsx` 注册后使用。

`binary-search-field-notes.mdx` 是完整的示例，可查看原稿学习以上语法。它明确标记为演示内容，可删除或替换。

## 本地检查

```bash
npm run typecheck
npm run build
npm run preview
```

内容构建采用严格校验：字段类型、日期、文件名或 MDX 语法出错都会阻止发布。Mermaid 在构建时需要 Playwright Chromium，首次安装后执行 `npx playwright install chromium`；GitHub Actions 会准备浏览器及所需依赖。

不要在文章中放密钥或不适合公开的内容。MDX 是会执行的受信任项目代码，只放自己审阅过的本地文件。
