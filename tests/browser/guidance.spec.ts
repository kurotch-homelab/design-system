import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { decisions } from '../../apps/catalog/src/guidance-content.js';

test('task selector, state specimens and real state behavior', async ({ page }) => {
  await page.goto('/#guides/selection');
  for (const item of decisions) {
    await page.getByLabel('やりたいこと', { exact: true }).selectOption(item.id);
    await expect(page.locator('#pattern-recommendation h2')).toHaveText(item.pick);
    await expect(page.locator('#pattern-recommendation')).toContainText(item.boundary[0]);
  }
  await page.goto('/#guides/states');
  await expect(page.locator('.state-specimen')).toHaveCount(7);
  await page.getByLabel('見比べる対象', { exact: true }).selectOption('input');
  await expect(page.locator('.state-specimen')).toHaveCount(6);
  await expect(page.locator('#state-matrix')).toContainText('読み取り専用');
  const live = page.locator('#guide-save');
  await live.focus();
  expect(await live.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('2px');
  await live.press('Enter');
  await expect(live).toHaveAttribute('aria-busy', 'true');
  await expect(live).toBeFocused();
  await live.dispatchEvent('click');
  await expect(page.locator('#guide-live-status')).toHaveText('保存のデモが完了しました。');
  await expect(live).not.toHaveAttribute('aria-disabled');
  const toggle = page.getByRole('button', { name: 'ピン留め', exact: true });
  await toggle.focus();
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toBeFocused();
  await page.goto('/#components/Button');
  const disabled = page.getByRole('button', { name: '操作できません', exact: true });
  const before = await disabled.evaluate((e) => getComputedStyle(e).backgroundColor);
  await disabled.hover();
  expect(await disabled.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(before);
});

for (const locale of ['ja', 'en'])
  for (const theme of ['light', 'dark'])
    test(`guidance readability and accessibility ${locale}/${theme}`, async ({ page }) => {
      await page.addInitScript(
        ({ locale, theme }) => {
          localStorage.setItem('forma-locale', locale);
          localStorage.setItem('forma-theme', theme);
        },
        { locale, theme },
      );
      for (const width of [1440, 768, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const route of ['selection', 'states', 'examples', 'motion']) {
          await page.goto(`/#guides/${route}`);
          await expect(page.locator('main h1')).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          await page
            .locator('main')
            .evaluate((el) =>
              Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))),
            );
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${route}/${width}`,
          ).toBe(true);
          if (locale === 'en')
            expect(await page.locator('main').innerText()).not.toMatch(
              /[\u3040-\u30ff\u4e00-\u9fff]/,
            );
          if (width === 1440) {
            const result = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze();
            expect(
              result.violations.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
              })),
            ).toEqual([]);
          }
          await page.screenshot({
            path: `output/playwright/guides-${route}-${locale}-${theme}-${width}.png`,
            fullPage: true,
          });
          if (width === 320 || width === 1440) {
            await page.screenshot({
              path: `output/playwright/guides-${route}-${locale}-${theme}-${width}-viewport.png`,
            });
          }
        }
      }
    });
