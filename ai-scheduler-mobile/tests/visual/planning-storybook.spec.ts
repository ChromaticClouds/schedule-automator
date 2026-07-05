import { expect, test } from '@playwright/test';

const stories = [
  ['catalog', 'Planning state preview'],
  ['daily-review', 'Daily review'],
  ['task-summary', 'Task summary'],
  ['planning-create', 'Planning create row'],
  ['schedule-draft', 'Schedule draft'],
  ['weekly-reschedule', 'Weekly reschedule'],
  ['goal-breakdown', 'Goal breakdown'],
  ['planning-copy', 'Planning section copy'],
] as const;

test.describe('planning Storybook screenshots', () => {
  for (const [storyId, expectedText] of stories) {
    test(storyId, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page
        .locator(`#planning-state-preview--${storyId}`)
        .click();
      await expect
        .poll(() => page.locator('#root').textContent())
        .toContain(expectedText);
      await page.evaluate(() => document.fonts.ready);

      if (process.env.VISUAL_MODE === 'capture') {
        await page.screenshot({
          animations: 'disabled',
          path: testInfo.outputPath(`${storyId}.png`),
        });
        return;
      }

      await expect(page).toHaveScreenshot(`${storyId}.png`, {
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
});
