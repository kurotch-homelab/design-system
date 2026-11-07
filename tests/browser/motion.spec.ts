import { test, expect } from '@playwright/test';

test('native overlays animate, reopen without stale inert state, and return focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#guides/motion');
  for (const id of ['motion-dialog', 'motion-drawer']) {
    const trigger = page.locator(`[data-dialog="${id}"]`);
    const dialog = page.locator(`#${id}`);
    await trigger.focus();
    const transitions = await trigger.evaluate((el, id) => {
      (el as HTMLButtonElement).click();
      const dialog = document.getElementById(id)!;
      void getComputedStyle(dialog).opacity;
      return dialog.getAnimations().map((a) => a.effect!.getTiming().duration);
    }, id);
    expect(transitions.some((duration) => Number(duration) > 0)).toBe(true);
    for (let i = 0; i < 3; i++) {
      await expect(dialog).toHaveAttribute('open');
      await expect(dialog).not.toHaveAttribute('inert');
      await page.keyboard.press('Escape');
      await expect(dialog).not.toHaveAttribute('open');
      await expect(trigger).toBeFocused();
      if (i < 2) await trigger.press('Enter');
    }
  }
  await page.goto('/#components/Tooltip');
  await page.getByRole('button', { name: '表示設定', exact: true }).focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toBeHidden();
});

test('toast exit returns focus and cannot remove a replacement notification', async ({ page }) => {
  await page.goto('/#guides/motion');
  const trigger = page.getByRole('button', { name: '保存通知を試す' });
  await trigger.click();
  await expect(page.locator('.f-toast [role=status]')).toHaveText('変更を保存しました');
  await page.locator('.f-toast button').click();
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  // Let the previous exit's completion callback run after the new toast exists.
  await page.waitForTimeout(260);
  await expect(page.locator('.f-toast')).toHaveCount(1);
  await expect(page.locator('.f-toast')).not.toHaveAttribute('inert');
  await expect(page.locator('.f-toast [role=status]')).toHaveText('変更を保存しました');
});

test('reduced motion retains interaction and reacts to OS preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#guides/motion');
  await page.getByLabel('動きの設定', { exact: true }).selectOption('reduce');
  await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'reduce');
  await page.getByRole('button', { name: '切り替えを再生' }).click();
  await page.getByRole('button', { name: 'ドロワーを開く' }).click();
  await expect(page.locator('#motion-drawer')).toHaveAttribute('open');
  expect(
    await page.locator('.forma').evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'ドロワーを開く' })).toBeFocused();
  await page.getByRole('button', { name: '25%進める' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  const summary = page.locator('.f-accordion summary').first();
  await summary.click();
  await expect(page.locator('.f-accordion details').first()).toHaveAttribute('open');
  expect(
    await page.locator('.forma').evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.reload();
  await expect(page.getByLabel('動きの設定', { exact: true })).toHaveValue('reduce');
  await page.getByLabel('動きの設定', { exact: true }).selectOption('system');
  await page.getByRole('button', { name: 'ドロワーを開く' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'reduce');
  await expect(page.locator('#motion-drawer')).toHaveAttribute('open');
  expect(
    await page.locator('.forma').evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'full');
});
