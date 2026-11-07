import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { docs } from '../../apps/catalog/src/content.js';

test('native menu, tabs and local file validation', async ({ page }) => {
  await page.goto('/#components/Menu');
  const trigger = page.getByRole('button', { name: 'その他の操作', exact: true });
  await trigger.click();
  await expect(page.getByRole('menuitem', { name: '複製する' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'アーカイブする' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.goto('/#components/Tabs');
  await page.getByRole('tab', { name: '概要' }).focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'ファイル' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toContainText('ファイルはまだありません');
  await page.goto('/#components/FileUpload');
  const file = page.locator('input[type=file]');
  await file.setInputFiles({
    name: 'invalid.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('test'),
  });
  await expect(page.getByRole('alert')).toContainText('PDF形式');
  await file.setInputFiles({
    name: 'report.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-test'),
  });
  await expect(page.locator('#file-list')).toContainText('report.pdf');
  await page.getByRole('button', { name: '削除 report.pdf' }).click();
  await expect(page.locator('#file-list')).toBeEmpty();
});
test('project workflow: search, sorting, selection, columns, pagination and editing', async ({
  page,
}) => {
  await page.goto('/#patterns/projects');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(6);
  await page.getByRole('searchbox', { name: '案件を検索' }).fill('三原');
  await expect(table.getByRole('row')).toHaveCount(3);
  await page.getByRole('searchbox').fill('no-such-project');
  await expect(page.getByText('該当する項目がありません', { exact: true })).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await page.getByRole('button', { name: '金額 並べ替え' }).click();
  await expect(table.getByRole('row').nth(1)).toContainText('サービス紹介資料');
  await table.locator('.f-check').nth(1).click();
  await expect(page.getByText('1 件を選択中')).toBeVisible();
  await page.getByRole('button', { name: '次へ', exact: true }).click();
  await expect(table.getByRole('row')).toHaveCount(4);
  await page.getByRole('button', { name: '表示列', exact: true }).click();
  await page.locator('.f-popover .f-check').filter({ hasText: 'クライアント' }).click();
  await page.keyboard.press('Escape');
  await expect(table.getByRole('columnheader', { name: 'クライアント 並べ替え' })).toHaveCount(0);
  await page.getByRole('button', { name: '詳細', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: '案件名' }).fill('検証済み案件');
  await dialog.getByRole('button', { name: '変更を保存' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('案件を保存しました')).toBeVisible();
  await expect(table).toContainText('検証済み案件');
});
test('input validation and dialog keyboard focus restoration', async ({ page }) => {
  await page.goto('/#components/TextField');
  await page.getByRole('button', { name: '入力を確認' }).click();
  await expect(page.getByRole('textbox', { name: '会社名' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.getByText('会社名を入力してください', { exact: true })).toBeVisible();
  await page.goto('/#components/Dialog');
  const trigger = page.getByRole('button', { name: 'ダイアログを開く' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test('native date ranges, validation and theme persistence', async ({ page }) => {
  await page.goto('/#components/DateRangePicker');
  await page.getByRole('button', { name: 'ダークテーマ', exact: true }).click();
  await page.getByLabel('開始日', { exact: true }).fill('2026-11-20');
  await page.getByLabel('終了日', { exact: true }).fill('2026-11-10');
  await expect(page.getByLabel('終了日', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('終了日は開始日以降にしてください', { exact: true })).toBeVisible();
  await page.getByLabel('終了日', { exact: true }).fill('2026-11-30');
  await expect(page.getByLabel('終了日', { exact: true })).toHaveAttribute('aria-invalid', 'false');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.forma')).toHaveAttribute('data-theme', 'dark');
});
for (const locale of ['ja', 'en'] as const)
  for (const theme of ['light', 'dark'] as const) {
    test(`responsive patterns and accessibility: ${locale}/${theme}`, async ({ page }) => {
      await page.addInitScript(
        ({ locale, theme }) => {
          localStorage.setItem('forma-locale', locale);
          localStorage.setItem('forma-theme', theme);
        },
        { locale, theme },
      );
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const route of ['intro', 'foundations', 'patterns/projects', 'patterns/company']) {
          await page.goto(`/#${route}`);
          await expect(page.locator('main h1')).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          await page
            .locator('main')
            .evaluate((el) =>
              Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))),
            );
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${route} at ${width}`,
          ).toBe(true);
          if (width === 1440) {
            const result = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze();
            expect(
              result.violations.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  html: n.html,
                  summary: n.failureSummary,
                })),
              })),
            ).toEqual([]);
          }
          await page.screenshot({
            path: `output/playwright/${locale}-${theme}-${width}-${route.replace('/', '-')}.png`,
            fullPage: true,
          });
        }
      }
    });
  }
for (const locale of ['ja', 'en'] as const)
  for (const theme of ['light', 'dark'] as const)
    test(`all 35 component pages render with accessible controls: ${locale}/${theme}`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ locale, theme }) => {
          localStorage.setItem('forma-locale', locale);
          localStorage.setItem('forma-theme', theme);
        },
        { locale, theme },
      );
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      for (const doc of docs) {
        await page.goto(`/#components/${doc.name}`);
        await expect(page.getByRole('heading', { name: doc.name, exact: true })).toBeVisible();
        await page
          .locator('main')
          .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))));
        if (locale === 'en') {
          expect(await page.locator('main').innerText(), doc.name).not.toMatch(
            /[\u3040-\u30ff\u4e00-\u9fff]/,
          );
        }
        const result = await new AxeBuilder({ page })
          .include('main')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              html: n.html,
              summary: n.failureSummary,
            })),
          })),
          doc.name,
        ).toEqual([]);
      }
      expect(errors).toEqual([]);
    });

test('mobile navigation, skip link, selection controls and density', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Button', exact: true })).not.toBeVisible();
  const toggle = page.getByRole('button', { name: 'ナビゲーション', exact: true });
  await toggle.click();
  await expect(page.getByRole('textbox', { name: 'UIパターンを検索' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('textbox', { name: 'UIパターンを検索' }).fill('ComboBox');
  await page.getByRole('link', { name: 'ComboBox', exact: true }).click();
  const combo = page.getByRole('combobox', { name: '部署を検索' });
  await combo.fill('開発');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(combo).toHaveValue('開発');
  await page.goto('/#components/Select');
  await page.locator('.component-playground .f-select-button').selectOption({ label: 'サポート' });

  await expect(page.locator('.component-playground .f-select-button')).toContainText('サポート');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel('表示密度', { exact: true }).selectOption('compact');
  expect(
    await page
      .locator('.forma')
      .evaluate((e) => getComputedStyle(e).getPropertyValue('--f-control-height')),
  ).toBe('32px');
  await page.goto('/#intro');
  await page.getByRole('link', { name: '本文へ移動' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page.locator('main h1')).toContainText('使いやすさに');
});
