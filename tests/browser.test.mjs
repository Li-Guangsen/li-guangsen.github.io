import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import net from 'node:net';
import { after, before, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

let browser;
let preview;
let origin;
const githubSnapshot = JSON.parse(await readFile(new URL('../data/github-profile.json', import.meta.url), 'utf8'));
const activitySnapshot = JSON.parse(await readFile(new URL('../data/github-activity.json', import.meta.url), 'utf8'));

before(async () => {
  // Each run owns its preview process and port; an existing dev server is never reused.
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
  origin = `http://127.0.0.1:${port}`;
  preview = spawn(process.execPath, ['scripts/preview.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  preview.stdout.on('data', (chunk) => { output += chunk; });
  preview.stderr.on('data', (chunk) => { output += chunk; });
  let spawnError;
  preview.on('error', (error) => { spawnError = error; });
  const deadline = Date.now() + 15_000;
  while (true) {
    if (spawnError) throw spawnError;
    if (preview.exitCode !== null) throw new Error(`Static preview exited: ${output}`);
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      if (response.ok) break;
    } catch { /* The owned server may still be starting. */ }
    if (Date.now() >= deadline) throw new Error(`Static preview did not become ready: ${output}`);
    await delay(100);
  }
  browser = await chromium.launch({
    executablePath: process.env.MERMAID_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
}, { timeout: 60_000 });

after(async () => {
  await browser?.close();
  if (preview && preview.exitCode === null && preview.signalCode === null) {
    const exited = once(preview, 'exit');
    preview.kill('SIGTERM');
    await Promise.race([exited, delay(2000)]);
    if (preview.exitCode === null && preview.signalCode === null) {
      preview.kill('SIGKILL');
      await exited;
    }
  }
});

async function journey(options, run) {
  const context = await browser.newContext({ baseURL: origin, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await run(page, context);
    assert.deepEqual(errors, [], 'The journey must not produce uncaught browser errors');
  } finally {
    await context.close();
  }
}

async function assertFitsViewport(page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  assert.ok(sizes.content <= sizes.viewport + 1, `Horizontal overflow: ${JSON.stringify(sizes)}`);
}

test('keyboard search opens an article and Escape releases the filled search dialog', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 } }, async (page) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const search = page.getByRole('dialog', { name: '搜索文章' });
    await search.waitFor({ state: 'visible' });
    await search.getByRole('combobox', { name: '搜索关键词' }).fill('二分 Python');
    await search.getByRole('option').first().waitFor();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/blog/binary-search-field-notes/');
    await page.getByRole('heading', { level: 1 }).waitFor();
    assert.equal(await search.isVisible(), false);

    const previousOverflow = await page.evaluate(() => document.body.style.overflow);
    await page.keyboard.press('Control+k');
    await search.waitFor({ state: 'visible' });
    await search.getByRole('combobox', { name: '搜索关键词' }).fill('二分 Python');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await page.keyboard.press('Escape');
    await search.waitFor({ state: 'hidden' });
    await page.waitForFunction((previous) => document.body.style.overflow === previous, previousOverflow);
  });
});

test('article code, Mermaid controls and algorithm steps work in the static export', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] }, async (page) => {
    await page.goto('/blog/binary-search-field-notes/');
    await page.getByRole('button', { name: '复制代码', exact: true }).click();
    await page.getByRole('button', { name: '已复制 ✓', exact: true }).waitFor();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /def binary_search\(values/);

    await page.getByRole('button', { name: '放大图表', exact: true }).click();
    await page.getByText('125%', { exact: true }).waitFor();
    await page.getByRole('button', { name: '复位图表', exact: true }).click();
    await page.getByText('100%', { exact: true }).waitFor();
    await page.getByRole('button', { name: '复制源码', exact: true }).click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /flowchart TD/);

    const demo = page.getByRole('region', { name: '二分查找交互演示' });
    await demo.getByLabel('寻找').selectOption('20');
    const next = demo.getByRole('button', { name: '下一步 →', exact: true });
    for (let step = 0; step < 10 && await next.isEnabled(); step++) await next.click();
    assert.equal(await next.isEnabled(), false);
    assert.match(await demo.innerText(), /数组中没有 20/);
    await demo.getByRole('button', { name: '重新开始', exact: true }).click();
    assert.equal(await next.isEnabled(), true);
  });
});

test('mobile navigation and collapsible article contents fit 390 px and 320 px screens', { timeout: 60_000 }, async () => {
  for (const width of [390, 320]) {
    await journey({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true }, async (page) => {
      await page.goto('/');
      await assertFitsViewport(page);
      await page.getByRole('button', { name: '打开菜单', exact: true }).click();
      await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '博客 BLOG' }).click();
      await page.waitForURL('**/blog/');
      await page.getByRole('button', { name: '打开菜单', exact: true }).waitFor();
      await assertFitsViewport(page);

      await page.goto('/blog/binary-search-field-notes/');
      const contents = page.locator('details').filter({ has: page.locator('summary', { hasText: '本篇目录' }) });
      await contents.locator('summary').click();
      await contents.getByRole('link', { name: '留下可运行的实现', exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('details')?.open);
      assert.ok(new URL(page.url()).hash, 'A contents link must navigate to an article heading');
      await assertFitsViewport(page);
    });
  }
});

test('gallery lightbox supports keyboard switching, Escape and focus restoration', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 } }, async (page) => {
    await page.goto('/the-world/');
    const opener = page.getByRole('button', { name: /^放大查看：/ }).first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const firstTitle = await dialog.getByRole('heading', { level: 2 }).innerText();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await dialog.getByRole('heading', { level: 2 }).innerText(), firstTitle);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
    assert.equal(await opener.evaluate((element) => element === document.activeElement), true);
  });
});

test('normal motion keeps the sticky header and hovered text stationary', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference' }, async (page) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const frames = await page.evaluate(async () => {
      window.scrollTo({ top: 40, behavior: 'instant' });
      const samples = [];
      const start = performance.now();
      await new Promise((resolve) => {
        function sample() {
          samples.push({ scroll: window.scrollY, height: document.querySelector('.header-inner').getBoundingClientRect().height });
          if (performance.now() - start < 650) requestAnimationFrame(sample);
          else resolve();
        }
        requestAnimationFrame(sample);
      });
      return samples;
    });
    for (const frame of frames) {
      assert.equal(frame.height, frames[0].height, 'The header must not resize after the user stops scrolling');
      assert.equal(frame.scroll, 40, 'Changing the sticky header must not feed back into scroll position');
    }
    assert.equal(await page.evaluate(() => document.getAnimations().filter((animation) => animation.effect?.getTiming().iterations === Infinity).length), 0);

    const row = page.locator('.post-row').first();
    await row.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const before = await row.locator('.post-text').boundingBox();
    await row.hover();
    await page.waitForTimeout(250);
    assert.deepEqual(await row.locator('.post-text').boundingBox(), before, 'Hover feedback must not move or reflow article text');

    const project = page.locator('.project-card').first();
    await project.hover();
    assert.equal(await project.evaluate((element) => getComputedStyle(element).transform), 'none', 'The project card must not mix pointer-driven and CSS transforms');
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: /拾光/ }).click();
    await page.waitForURL('**/the-world/');
    assert.equal(await page.locator('.world-transition').count(), 0);
  });
});

test('theme changes honor rapid clicks, persist on reload and settle without an overlay', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference', colorScheme: 'light' }, async (page) => {
    await page.goto('/');
    const settled = () => page.waitForFunction(() => !document.getAnimations().some((animation) => animation.playState === 'running'));
    await page.getByRole('button', { name: '切换深色模式', exact: true }).click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await settled();
    assert.equal(await page.evaluate(() => localStorage.getItem('sethli-theme')), 'dark');
    await page.reload();
    await page.getByRole('button', { name: '切换浅色模式', exact: true }).click();
    await settled();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    await page.evaluate(async () => {
      const toggle = document.querySelector('button[aria-label="切换深色模式"]');
      for (let index = 0; index < 3; index++) {
        toggle.click();
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    });
    await settled();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('sethli-theme')), 'dark');
    assert.equal(await page.getByRole('button', { name: '切换浅色模式', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目 PROJECTS', exact: true }).click();
    await page.waitForURL('**/projects/');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
  });
});

test('theme switching works with reduced motion and without the View Transition API or storage', { timeout: 60_000 }, async () => {
  for (const fallback of [false, true]) {
    await journey({ viewport: { width: 390, height: 844 }, reducedMotion: fallback ? 'no-preference' : 'reduce', colorScheme: 'light' }, async (page) => {
      await page.addInitScript((withoutStorage) => {
        if (withoutStorage) {
          Object.defineProperty(document, 'startViewTransition', { value: undefined });
          Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
          Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
        } else {
          document.startViewTransition = () => {
            document.documentElement.dataset.unexpectedTransition = 'true';
            throw new Error('Reduced motion must not start a page transition');
          };
        }
      }, fallback);
      await page.goto('/');
      await page.getByRole('button', { name: '切换深色模式', exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      await page.getByRole('button', { name: '切换浅色模式', exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
      assert.equal(await page.locator('html').getAttribute('data-unexpected-transition'), null);
      await assertFitsViewport(page);
    });
  }
});

test('WeChat contact copies the public account and closes with Escape or outside click', { timeout: 60_000 }, async () => {
  for (const width of [1440, 320]) {
    await journey({ viewport: { width, height: 960 }, permissions: ['clipboard-read', 'clipboard-write'] }, async (page) => {
      await page.goto('/');
      const contacts = page.getByRole('navigation', { name: '社交与联系' });
      assert.equal(await contacts.locator('a[href*="x.com"]').count(), 0);
      const opener = contacts.getByRole('button', { name: '微信 · Quenching_raw', exact: true });
      await opener.click();
      const dialog = page.getByRole('dialog', { name: '微信联系', exact: true });
      await dialog.waitFor({ state: 'visible' });
      await assertFitsViewport(page);
      const panel = await dialog.boundingBox();
      assert.ok(panel && panel.x >= 0 && panel.x + panel.width <= width, 'WeChat panel must remain within the viewport');
      await dialog.locator('code').click();
      assert.equal(await dialog.isVisible(), true, 'Selecting the account for manual copying must keep the panel open');
      await dialog.getByRole('button', { name: '复制微信号', exact: true }).click();
      await dialog.getByRole('button', { name: '已复制 ✓', exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Quenching_raw');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate((element) => element === document.activeElement), true);
      await opener.click();
      await dialog.waitFor({ state: 'visible' });
      await page.locator('.footer-bottom').click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.getAttribute('aria-expanded'), 'false');
    });
  }
});

test('contribution calendar preserves every GitHub date, count and intensity and supports keyboard inspection', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 1000 } }, async (page) => {
    await page.goto('/');
    const calendar = page.getByRole('region', { name: 'GitHub Activity', exact: true });
    const graph = calendar.getByRole('group', { name: `过去一年 ${activitySnapshot.total} 次 GitHub 贡献`, exact: true });
    const renderedDays = await graph.locator('button[data-date]').evaluateAll((elements) => elements.map((element) => ({
      date: element.getAttribute('data-date'),
      count: Number(element.getAttribute('aria-label').match(/ · (\d+) 次贡献$/)[1]),
      level: Number(element.getAttribute('data-level')),
    })));
    assert.deepEqual(renderedDays, activitySnapshot.days, 'All activity, including anonymous private counts chosen for display, must survive rendering');
    assert.equal(renderedDays.reduce((total, day) => total + day.count, 0), activitySnapshot.total);
    assert.equal(await calendar.getByRole('link', { name: 'GitHub Activity', exact: true }).getAttribute('href'), `https://github.com/${activitySnapshot.username}`);
    const details = calendar.locator('[aria-live="polite"]');
    assert.match(await details.innerText(), new RegExp(`过去一年\\s+${activitySnapshot.total}\\s+次贡献`));
    const activeDay = activitySnapshot.days.find((day) => day.count > 0) ?? activitySnapshot.days[0];
    await graph.locator(`button[data-date="${activeDay.date}"]`).focus();
    assert.equal(await details.innerText(), `${activeDay.date} · ${activeDay.count} 次贡献`);
    await page.keyboard.press('ArrowRight');
    const nextDay = activitySnapshot.days[Math.min(activitySnapshot.days.length - 1, activitySnapshot.days.indexOf(activeDay) + 7)];
    assert.equal(await details.innerText(), `${nextDay.date} · ${nextDay.count} 次贡献`);
    await page.keyboard.press('Escape');
    assert.match(await details.innerText(), new RegExp(`过去一年\\s+${activitySnapshot.total}\\s+次贡献`));
  });
});

test('domain-independent branding and GitHub repository provenance are present without visitor API calls', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 1000 } }, async (page) => {
    const githubRequests = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname === 'api.github.com') githubRequests.push(request.url());
    });
    await page.goto('/');
    assert.equal(await page.title(), 'sethli');
    assert.equal(await page.locator('header.site-header .brand svg').count(), 1);
    assert.equal(await page.locator('.identity-letter img').getAttribute('src'), '/brand/avatar-512.png');
    const icons = await page.locator('link[rel="icon"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
    assert.ok(icons.includes('/icon.svg'));
    assert.ok(icons.includes('/brand/favicon-16.png'));
    await page.getByRole('link', { name: '浏览仓库' }).click();
    await page.waitForURL('**/projects/#github-repositories');
    const repositories = page.locator('#github-collection');
    await repositories.getByRole('heading', { name: 'GitHub 仓库.' }).waitFor();
    const groups = repositories.locator('h3');
    assert.match(await groups.nth(0).innerText(), /本人创建/);
    assert.match(await groups.nth(1).innerText(), /Fork/);
    assert.equal(await repositories.locator('h4 a').count(), githubSnapshot.repositories.length);
    for (const repository of githubSnapshot.repositories) {
      assert.equal(await repositories.locator(`h4 a[href="${repository.url}"]`).count(), 1);
      if (repository.parent) {
        assert.equal(await repositories.getByRole('link', { name: repository.parent.fullName, exact: true }).getAttribute('href'), repository.parent.url);
      }
    }
    for (const path of ['/', '/projects/', '/blog/', '/blog/binary-search-field-notes/', '/the-world/']) {
      await page.goto(path);
      assert.doesNotMatch(await page.locator('#main').innerText(), /sethli\.(tech|me)/i);
      assert.match(await page.locator('.footer-bottom').innerText(), /© \d{4} [^\s]+\.[^\s]+/);
      assert.doesNotMatch(await page.title(), /sethli\.(tech|me)/i);
      assert.ok((await page.locator('meta[property="og:image"]').getAttribute('content')).endsWith('/brand/social-card.png'));
      assert.ok((await page.locator('meta[name="twitter:image"]').getAttribute('content')).endsWith('/brand/social-card.png'));
    }
    assert.deepEqual(githubRequests, [], 'Visitors must receive static GitHub snapshots');
  });
});
