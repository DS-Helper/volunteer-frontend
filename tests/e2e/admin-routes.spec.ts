import { expect, test } from '@playwright/test';

test('관리자 가입 신청 경로가 접근 가능한 검색 화면을 제공한다', async ({ page }) => {
  const response = await page.goto('/admin/volunteer/applications');

  expect(response?.status()).toBeLessThan(500);
  await expect(
    page.getByRole('heading', { level: 1, name: '가입 신청 관리' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: '이름 검색' })).toBeVisible();
});

test('관리자 일정·단원 관리 경로가 접근 가능한 화면을 제공한다', async ({ page }) => {
  const eventsResponse = await page.goto('/admin/volunteer/events');
  expect(eventsResponse?.status()).toBeLessThan(500);
  await expect(page.getByRole('heading', { level: 1, name: '봉사 일정 관리' })).toBeVisible();

  const membersResponse = await page.goto('/admin/volunteer/members');
  expect(membersResponse?.status()).toBeLessThan(500);
  await expect(page.getByRole('heading', { level: 1, name: '봉사단원 관리' })).toBeVisible();
});
