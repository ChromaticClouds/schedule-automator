import { expect, test } from '@playwright/test';

const addPlanningItem = async (
  page: import('@playwright/test').Page,
  placeholder: string,
  title: string,
  buttonLabel = '추가',
) => {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(title);
  await input.locator('xpath=..').getByText(buttonLabel, { exact: true }).click();
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
};

test('creates planning records and reviews a schedule draft', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Google 계정 연결됨')).toBeVisible();

  await addPlanningItem(page, '주간 목표를 입력하세요', 'E2E weekly goal');
  await addPlanningItem(
    page,
    '예: README 실행 방법 정리',
    'E2E planning task',
    '작업 추가',
  );

  await page.getByText('초안 생성', { exact: true }).click();
  await expect(page.getByText(/초안 - Browser E2E schedule draft/)).toBeVisible();
  await expect(page.getByText(/E2E planning task/).first()).toBeVisible();

  await page.getByText('거절', { exact: true }).click();
  await expect(page.getByText(/거절됨 - Browser E2E schedule draft/)).toBeVisible();
});
