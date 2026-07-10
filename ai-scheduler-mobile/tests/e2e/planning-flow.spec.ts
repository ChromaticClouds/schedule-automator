import { expect, test } from '@playwright/test';

const addPlanningItem = async (
  page: import('@playwright/test').Page,
  placeholder: string,
  title: string,
  buttonLabel = '추가',
) => {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(title);
  await page.getByText(buttonLabel, { exact: true }).click();
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
};

test('creates planning records and reviews a schedule draft', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('카테고리 메뉴 열기').click();
  await page.getByText('계획 관리', { exact: true }).click();
  await expect(page.getByText('Google 계정 연결됨')).toBeVisible();

  await addPlanningItem(page, '주간 목표를 입력하세요', 'E2E weekly goal');
  await addPlanningItem(
    page,
    '예: README 실행 방법 정리',
    'E2E planning task',
    '작업 추가',
  );

  await page.getByLabel('카테고리 메뉴 열기').click();
  await page.getByText('오늘 일정', { exact: true }).click();
  await page
    .getByPlaceholder('오늘 일정에 원하는 조건을 입력하세요')
    .fill('오전에는 E2E 작업에 집중하고 회의 전후 여유를 남겨줘');
  await page.getByText('전송', { exact: true }).click();
  await expect(page.getByText(/오전에는 E2E 작업에 집중/)).toBeVisible();
  await expect(page.getByText(/초안 - Browser E2E schedule draft/)).toBeVisible();
  await expect(page.getByText(/E2E planning task/).first()).toBeVisible();

  await page.getByText('거절', { exact: true }).click();
  await expect(page.getByText(/거절됨 - Browser E2E schedule draft/)).toBeVisible();
});
