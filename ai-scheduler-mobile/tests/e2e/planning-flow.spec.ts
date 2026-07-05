import { expect, test } from '@playwright/test';

const addPlanningItem = async (
  page: import('@playwright/test').Page,
  placeholder: string,
  title: string,
) => {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(title);
  await input.locator('xpath=..').getByText('Add', { exact: true }).click();
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
};

test('creates planning records and reviews a schedule draft', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Google account connected')).toBeVisible();

  await addPlanningItem(page, 'Add a weekly goal', 'E2E weekly goal');
  await addPlanningItem(page, 'Add a task', 'E2E planning task');

  await page.getByText('Generate draft', { exact: true }).click();
  await expect(page.getByText(/DRAFT - Browser E2E schedule draft/)).toBeVisible();
  await expect(page.getByText(/E2E planning task/).first()).toBeVisible();

  await page.getByText('Reject', { exact: true }).click();
  await expect(page.getByText(/REJECTED - Browser E2E schedule draft/)).toBeVisible();
});
