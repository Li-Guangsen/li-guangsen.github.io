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
    assert.equal(await page.locator('.site-search-dialog').evaluate(dialog => dialog.open), false, 'Navigation releases the native modal immediately');
    await search.waitFor({ state: 'hidden' });
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
      await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '博客', exact: true }).click();
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

    await page.goto('/blog/');
    const row = page.locator('.post-row').first();
    await row.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const before = await row.locator('.post-text').boundingBox();
    await row.hover();
    await page.waitForTimeout(250);
    assert.deepEqual(await row.locator('.post-text').boundingBox(), before, 'Hover feedback must not move or reflow article text');

    await page.goto('/projects/');
    const project = page.locator('.project-card').first();
    await project.hover();
    assert.equal(await project.evaluate((element) => getComputedStyle(element).transform), 'none', 'The project card must not mix pointer-driven and CSS transforms');
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '拾光', exact: true }).click();
    await page.waitForURL('**/the-world/');
    assert.equal(await page.locator('.world-transition').count(), 0);

    const handle = page.getByRole('button', { name: /^移动“/ }).first();
    await handle.waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('button[aria-label^="移动“"]')?.disabled);
    const card = handle.locator('xpath=ancestor::article');
    const initial = await card.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-the-world-page] article')).transform).m41 === 12);
    await page.keyboard.press('Home');
    await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-the-world-page] article')).transform).m41 === 0);
    assert.equal(await card.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41), initial);
    const bounds = await handle.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 32, bounds.y + bounds.height / 2 + 20, { steps: 8 });
    await page.mouse.up();
    assert.ok(Math.abs(await card.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41) - initial) > 8, 'Dragging the photo handle must move its card');
    await page.getByRole('button', { name: '重新摆好Digital World的卡片', exact: true }).click();
    await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-the-world-page] article')).transform).m41 === 0);
  });
});

test('theme changes honor rapid clicks, persist on reload and settle without an overlay', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference', colorScheme: 'light' }, async (page) => {
    await page.goto('/');
    const settled = () => page.waitForFunction(() => !document.getAnimations().some((animation) => animation.playState === 'running'));
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'First visits use the reference design’s dark theme');
    await page.getByRole('button', { name: '切换浅色模式', exact: true }).click();
    await settled();
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
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目', exact: true }).click();
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
      await page.getByRole('button', { name: '切换浅色模式', exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
      await page.getByRole('button', { name: '切换深色模式', exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
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
    const graph = calendar.getByRole('group', { name: `${activitySnapshot.total} contributions in the last year`, exact: true });
    const renderedDays = await graph.locator('button[data-date]').evaluateAll((elements) => elements.map((element) => ({
      date: element.getAttribute('data-date'),
      count: Number(element.getAttribute('aria-label').match(/ · (\d+) contributions?$/)[1]),
      level: Number(element.getAttribute('data-level')),
    })));
    assert.deepEqual(renderedDays, activitySnapshot.days, 'All activity, including anonymous private counts chosen for display, must survive rendering');
    assert.equal(renderedDays.reduce((total, day) => total + day.count, 0), activitySnapshot.total);
    assert.equal(await calendar.getByRole('link', { name: 'GitHub Activity', exact: true }).getAttribute('href'), `https://github.com/${activitySnapshot.username}`);
    const details = calendar.locator('[aria-live="polite"]');
    assert.match(await details.innerText(), new RegExp(`${activitySnapshot.total}\\s+contributions in the last year`));
    const activeDay = activitySnapshot.days.find((day) => day.count > 0) ?? activitySnapshot.days[0];
    await graph.locator(`button[data-date="${activeDay.date}"]`).focus();
    assert.equal(await details.innerText(), `${activeDay.date} · ${activeDay.count} ${activeDay.count === 1 ? 'contribution' : 'contributions'}`);
    await page.keyboard.press('ArrowRight');
    const nextDay = activitySnapshot.days[Math.min(activitySnapshot.days.length - 1, activitySnapshot.days.indexOf(activeDay) + 7)];
    assert.equal(await details.innerText(), `${nextDay.date} · ${nextDay.count} ${nextDay.count === 1 ? 'contribution' : 'contributions'}`);
    await page.keyboard.press('Escape');
    assert.match(await details.innerText(), new RegExp(`${activitySnapshot.total}\\s+contributions in the last year`));
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
    assert.equal(await page.locator('.profile-avatar img').getAttribute('src'), '/images/github-avatar.png');
    const icons = await page.locator('link[rel="icon"]').evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute('href'), type: element.type, sizes: element.sizes.value })));
    assert.ok(icons.some((icon) => icon.href.startsWith('/icon.svg') && icon.type === 'image/svg+xml' && icon.sizes === 'any'));
    assert.ok(icons.some((icon) => icon.href === '/brand/favicon-16.png'));
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目', exact: true }).click();
    await page.waitForURL('**/projects/');
    const repositories = page.locator('#github-collection');
    await repositories.getByRole('heading', { name: 'GitHub', exact: true }).waitFor();
    const groups = repositories.locator('h3');
    assert.match(await groups.nth(0).innerText(), /Original/);
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

test('reference layout and Contact work on desktop and narrow mobile screens', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] }, async (page) => {
    await page.goto('/');
    const layout = await page.locator('.home-page').boundingBox();
    const avatar = await page.locator('.profile-avatar').boundingBox();
    assert.equal(layout.width, 576);
    assert.ok(Math.abs(avatar.x + avatar.width / 2 - (layout.x + layout.width / 2)) < 1, 'The profile avatar must stay centered');
    assert.equal(await page.locator('.home-page .project-card, .home-page .post-row').count(), 0, 'Project and article collections belong on their own routes');
    const opener = page.getByRole('button', { name: 'Contact', exact: true });
    await opener.click();
    const contact = page.getByRole('region', { name: '联系方式', exact: true });
    await contact.getByRole('button', { name: '复制微信号', exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Quenching_raw');
    assert.equal(await contact.getByRole('link', { name: /Email/ }).getAttribute('href'), 'mailto:liguangsen60@qq.com');
    await page.keyboard.press('Escape');
    assert.equal(await contact.isVisible(), false);
    assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    await opener.click();
    await page.locator('h1').click();
    assert.equal(await contact.isVisible(), false);

    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ['/', '/projects/', '/blog/', '/the-world/']) {
        await page.goto(route);
        await assertFitsViewport(page);
      }
      await page.getByRole('button', { name: '打开菜单', exact: true }).click();
      const mobileContacts = page.getByRole('region', { name: '移动端联系方式', exact: true });
      await mobileContacts.getByRole('button', { name: '复制微信号', exact: true }).click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Quenching_raw');
      await assertFitsViewport(page);
      await page.keyboard.press('Escape');
      assert.equal(await mobileContacts.isVisible(), false);
    }
  });
});

test('visible search works on every main route and restores focus on desktop and touch screens', { timeout: 60_000 }, async () => {
  for (const mobile of [false, true]) {
    await journey({ viewport: { width: mobile ? 320 : 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'no-preference' }, async (page) => {
      for (const route of ['/', '/projects/', '/blog/', '/the-world/']) {
        await page.goto(route);
        const opener = page.getByRole('button', { name: '搜索文章（Ctrl 或 Command K）', exact: true });
        await opener.click();
        const dialog = page.getByRole('dialog', { name: '搜索文章', exact: true });
        await dialog.waitFor({ state: 'visible' });
        const input = dialog.getByRole('combobox');
        await input.fill('二分 Python');
        assert.ok(await dialog.getByRole('option').count() > 0);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.equal(await opener.evaluate(element => document.activeElement === element), true);
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
        await assertFitsViewport(page);
      }
      await page.getByRole('button', { name: '搜索文章（Ctrl 或 Command K）', exact: true }).click();
      const input = page.getByRole('combobox', { name: '搜索关键词' });
      await input.fill('no-matching-article-82931');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      assert.equal(await input.getAttribute('aria-activedescendant'), null);
      await input.fill('二分 Python');
      await page.keyboard.press('Enter');
      await page.waitForURL('**/blog/binary-search-field-notes/');
      await page.getByRole('dialog', { name: '搜索文章', exact: true }).waitFor({ state: 'hidden' });
    });
  }
});

test('floating navigation and pointer effects settle, preserve hit targets and respect reduced motion', { timeout: 60_000 }, async () => {
  await journey({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference' }, async (page) => {
    await page.goto('/');
    await page.getByText('苦命研究生，CS 在读', { exact: true }).waitFor();
    const full = await page.locator('.header-inner').boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.site-header')?.classList.contains('is-floating'));
    await page.waitForFunction(() => document.querySelector('.header-inner').getBoundingClientRect().width === 960);
    const compact = await page.locator('.header-inner').boundingBox();
    assert.ok(compact.width < full.width);
    assert.ok(Math.abs(compact.height - full.height) < .05, 'Floating must preserve the header height, allowing only subpixel rounding');
    assert.equal(await page.evaluate(() => window.scrollY), 160);
    for (const width of [1440, 1024]) {
      await page.setViewportSize({ width, height: 960 });
      const world = await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '拾光', exact: true }).boundingBox();
      const search = await page.getByRole('button', { name: '搜索文章（Ctrl 或 Command K）', exact: true }).boundingBox();
      assert.ok(world.x + world.width + 8 <= search.x, 'The dock must leave space for the global search control');
    }
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目', exact: true }).click();
    await page.waitForURL('**/projects/');
    const card = page.locator('.project-card').first();
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const textBefore = await card.locator('.project-description').boundingBox();
    await card.hover({ position: { x: 80, y: 110 } });
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.project-card [data-pointer-glow]')).opacity) > .9);
    const glow = card.locator('[data-pointer-glow]');
    const firstPosition = await glow.evaluate(element => getComputedStyle(element).transform);
    await card.hover({ position: { x: 160, y: 160 } });
    await page.waitForFunction(previous => getComputedStyle(document.querySelector('.project-card [data-pointer-glow]')).transform !== previous, firstPosition);
    assert.deepEqual(await card.locator('.project-description').boundingBox(), textBefore);
    await page.mouse.move(0, 0);
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.project-card [data-pointer-glow]')).opacity) < .01);
    await page.goto('/the-world/');
    const photo = page.getByRole('button', { name: /^放大查看：/ }).first();
    await photo.click();
    const lightbox = page.locator('.gallery-lightbox');
    await lightbox.waitFor({ state: 'visible' });
    const image = await lightbox.locator('img').getAttribute('src');
    await lightbox.getByRole('button', { name: '关闭图片预览', exact: true }).click();
    assert.equal(await lightbox.locator('img').getAttribute('src'), image, 'Closing must retain the photo through its exit animation');
    await lightbox.waitFor({ state: 'hidden' });
    await photo.click();
    await lightbox.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await lightbox.waitFor({ state: 'hidden' });
    await page.goto('/projects/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await card.hover();
    assert.equal(await glow.evaluate(element => getComputedStyle(element).display), 'none');
    await page.goto('/the-world/');
    assert.equal(await page.locator('[data-the-world-page] article').first().evaluate(element => getComputedStyle(element).transform), 'none');
  });
});
