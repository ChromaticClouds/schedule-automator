import { expect, test } from '@playwright/test';

const addPlanningItem = async (
  page: import('@playwright/test').Page,
  placeholder: string,
  title: string,
) => {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(title);
  await input.locator('xpath=..').getByText('추가', { exact: true }).click();
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
};

test('creates planning records and reviews a schedule draft', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Google 계정 연결됨')).toBeVisible();

  await addPlanningItem(page, '주간 목표를 입력하세요', 'E2E weekly goal');
  await addPlanningItem(page, '작업을 입력하세요', 'E2E planning task');

  await page.getByText('초안 생성', { exact: true }).click();
  await expect(page.getByText(/초안 - Browser E2E schedule draft/)).toBeVisible();
  await expect(page.getByText(/E2E planning task/).first()).toBeVisible();

  await page.getByText('거절', { exact: true }).click();
  await expect(page.getByText(/거절됨 - Browser E2E schedule draft/)).toBeVisible();
});
