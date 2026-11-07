import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('forma-locale', 'ja');
    localStorage.setItem('forma-theme', 'light');
    localStorage.setItem('forma-motion', 'system');
  });
});
test('React fields retain native form behavior, validate ranges and reject invalid files', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/react/index.html');
  const form = page.locator('#TextField');
  await form.getByRole('button', { name: '入力を確認' }).click();
  await expect(form.getByRole('alert')).toHaveText('案件名を入力してください。');
  await expect(form.getByLabel('案件名', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await form.getByLabel('案件名', { exact: true }).fill('Forma project');
  await form.getByLabel('所属チーム（非制御）').fill('Operations');
  await form.getByRole('button', { name: '入力を確認' }).click();
  await expect(form.getByRole('status')).toContainText('確認しました');
  await form.getByRole('button', { name: 'リセット', exact: true }).click();
  await expect(form.getByLabel('案件名', { exact: true })).toHaveValue('');
  await expect(form.getByLabel('所属チーム（非制御）')).toHaveValue('Design');
  const range = page.locator('#DateRangePicker');
  await range.getByLabel('終了日', { exact: true }).fill('2026-11-01');
  await expect(range.getByRole('alert')).toContainText('開始日以降');
  expect(
    await range
      .getByLabel('終了日', { exact: true })
      .evaluate((el: HTMLInputElement) => el.checkValidity()),
  ).toBe(false);
  await range.getByLabel('終了日', { exact: true }).fill('2026-11-30');
  await expect(range.getByRole('alert')).toHaveCount(0);
  const upload = page.locator('#FileUpload');
  await upload
    .getByLabel('添付ファイル')
    .setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(upload.getByRole('alert')).toContainText('選択できない形式');
  await upload
    .getByLabel('添付ファイル')
    .setInputFiles({
      name: 'brief.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });
  await expect(upload.getByRole('alert')).toHaveCount(0);
  await expect(upload.getByText('brief.pdf', { exact: false }).first()).toBeVisible();
  await upload.getByRole('button', { name: 'brief.pdfを解除' }).click();
  await expect(upload.locator('li')).toHaveCount(0);
  await page.locator('#NumberField input').fill('');
  await expect(page.locator('#NumberField input')).toHaveValue('');
  expect(errors).toEqual([]);
});
test('React navigation supports keyboard operation and native overlay focus recovery', async ({
  page,
}) => {
  await page.goto('/react/index.html');
  const tabs = page.locator('#Tabs');
  await tabs.getByRole('tab', { name: '概要' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: '履歴' })).toBeFocused();
  await expect(tabs.getByRole('tabpanel')).toContainText('最近の変更');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: '概要' })).toBeFocused();
  const menu = page.locator('#Menu');
  await menu.getByRole('button', { name: '操作', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: '複製' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'アーカイブ' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(menu.getByRole('menuitem', { name: 'アーカイブ' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu.getByRole('button', { name: '操作', exact: true })).toBeFocused();
  await expect(menu.getByRole('status')).toHaveText('1回実行');
  for (const name of ['Dialog', 'Drawer']) {
    const section = page.locator(`#${name}`),
      trigger = section.getByRole('button').first();
    for (let i = 0; i < 3; i++) {
      await trigger.press('Enter');
      await expect(section.getByRole('dialog')).toBeVisible();
      expect(
        await section.locator('dialog').evaluate((el) => el.contains(document.activeElement)),
      ).toBe(true);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(section.locator('dialog')).not.toHaveAttribute('open');
    }
  }
  const popover = page.locator('#Popover');
  await popover.getByRole('button', { name: '表示設定', exact: true }).click();
  await expect(popover.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(popover.getByRole('checkbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popover.getByRole('button', { name: '表示設定', exact: true })).toBeFocused();
  const tooltip = page.locator('#Tooltip');
  await tooltip.getByRole('button').focus();
  await expect(tooltip.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip.getByRole('tooltip')).toBeHidden();
});
test('React table filters, sorts, paginates, preserves selection and saves an edited row', async ({
  page,
}) => {
  await page.goto('/react/index.html#DataTable');
  const table = page.locator('#DataTable');
  await table.getByRole('checkbox', { name: 'このページをすべて選択' }).check();
  await expect(table.getByText('5件選択', { exact: true })).toBeVisible();
  await table.getByRole('button', { name: '次のページ' }).click();
  await expect(table.getByRole('button', { name: 'Project 06', exact: true })).toBeVisible();
  await expect(table.getByText('5件選択', { exact: true })).toBeVisible();
  await table.getByRole('searchbox').fill('Project 24');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.getByRole('button', { name: 'Project 24', exact: true })).toBeVisible();
  await table.getByRole('searchbox').fill('');
  await table.getByRole('button', { name: '予算', exact: false }).click();
  await expect(table.getByRole('columnheader', { name: '予算' })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  await table.getByRole('button', { name: '予算', exact: false }).click();
  await expect(table.getByRole('columnheader', { name: '予算' })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  await table.getByLabel('ステータスで絞り込み').selectOption('done');
  await expect(table.locator('.f-table-footer')).toContainText('8件中');
  await table.getByRole('button', { name: '表示する列' }).click();
  await table
    .getByRole('dialog', { name: '表示する列' })
    .getByLabel('予算', { exact: true })
    .uncheck();
  await page.keyboard.press('Escape');
  await expect(table.getByRole('columnheader', { name: '予算' })).toHaveCount(0);
  await table.getByLabel('ステータスで絞り込み').selectOption('all');
  await table.getByRole('searchbox').fill('Project 24');
  await table.getByRole('button', { name: 'Project 24', exact: true }).click();
  const dialog = table.getByRole('dialog', { name: '案件を編集' });
  await dialog.getByLabel('案件名', { exact: true }).fill('Project 24 updated');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(
    table.getByRole('button', { name: 'Project 24 updated', exact: true }),
  ).toBeFocused();
  await expect(table.getByRole('status').filter({ hasText: '変更を保存しました' })).toHaveText(
    '変更を保存しました',
  );
});
test('React provider updates theme, density and reduced motion without discarding form state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.goto('/react/index.html');
  await page.locator('#TextField').getByLabel('案件名', { exact: true }).fill('Keep this');
  await page.getByLabel('テーマ', { exact: true }).selectOption('dark');
  await page.getByLabel('密度', { exact: true }).selectOption('compact');
  await page.getByLabel('動き', { exact: true }).selectOption('reduce');
  await expect(page.locator('.forma')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.forma')).toHaveAttribute('data-density', 'compact');
  await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'reduce');
  await expect(page.locator('#TextField').getByLabel('案件名', { exact: true })).toHaveValue(
    'Keep this',
  );
  await page.locator('#Drawer').getByRole('button').first().click();
  expect(await page.locator('#Drawer dialog').evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.keyboard.press('Escape');
  const toast = page.locator('#Toast');
  await toast.getByRole('button', { name: '保存通知を表示' }).click();
  await expect(toast.getByRole('status')).toHaveText('変更を保存しました');
  await toast.getByRole('button', { name: '通知を閉じる' }).click();
  await expect(toast.getByRole('button', { name: '保存通知を表示' })).toBeFocused();
  await expect(toast.locator('.f-toast')).toHaveCount(0);
  await page.getByLabel('動き', { exact: true }).selectOption('system');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'reduce');
});
for (const locale of ['ja', 'en'])
  for (const theme of ['light', 'dark']) {
    test(`React 35 components: accessibility and responsive layout ${locale}/${theme}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/react/index.html');
      await page.getByLabel('言語', { exact: true }).selectOption(locale);
      await page
        .getByLabel(locale === 'ja' ? 'テーマ' : 'Theme', { exact: true })
        .selectOption(theme);
      await expect(page.locator('[data-component]')).toHaveCount(35);
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        if (width === 1440) {
          const report = await new AxeBuilder({ page }).analyze();
          expect(report.violations).toEqual([]);
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `output/playwright/react-${locale}-${theme}-${width}.png` });
        await page
          .locator('#DataTable')
          .screenshot({ path: `output/playwright/react-table-${locale}-${theme}-${width}.png` });
      }
      if (locale === 'en')
        expect(await page.locator('main').innerText()).not.toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
      expect(errors).toEqual([]);
    });
  }
