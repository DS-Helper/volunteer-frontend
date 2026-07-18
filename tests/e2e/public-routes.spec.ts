import { expect, test } from '@playwright/test';

test.describe('봉사단 사용자 경로 smoke', () => {
  test('/volunteer 소개 화면을 접근 가능한 제목과 링크로 제공한다', async ({
    page,
  }) => {
    const response = await page.goto('/volunteer');

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole('heading', { level: 1, name: /작은 도움이 모여/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '봉사단 가입하기' }),
    ).toHaveAttribute('href', '/volunteer/application');
    await expect(
      page.getByRole('link', { name: '모집 중인 일정 보기' }),
    ).toHaveAttribute('href', '/volunteer/events');
  });

  test('/volunteer/events가 URL 필터를 유지하고 일정 제목을 제공한다', async ({
    page,
  }) => {
    const response = await page.goto('/volunteer/events?status=OPEN&page=0');

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/volunteer\/events\?status=OPEN&page=0$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /봉사 일정/ }),
    ).toBeVisible();
  });

  test('/volunteer/application이 가입 신청 폼의 이름 필드를 제공한다', async ({
    page,
  }) => {
    const response = await page.goto('/volunteer/application');

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole('heading', { level: 1, name: /가입 신청/ }),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: /이름/ })).toBeVisible();
  });
});
