import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiClient } from '@/lib/api';
import { ApiError } from '@/lib/errors';

import { server } from '../mocks/server';

const API_BASE_URL = 'https://api.dshelper.test';

describe('ApiClient와 MSW 통합', () => {
  it('쿼리를 직렬화하고 성공 응답의 data를 해제한다', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/volunteer-events`, ({ request }) => {
        const url = new URL(request.url);
        const queryIsValid =
          url.searchParams.get('status') === 'OPEN' &&
          url.searchParams.get('page') === '0' &&
          url.searchParams.get('empty') === null &&
          url.searchParams.getAll('sort').join(',') === 'startAt,asc';

        if (!queryIsValid) {
          return HttpResponse.json(
            { code: 'INVALID_REQUEST', message: '쿼리 계약이 올바르지 않습니다.' },
            { status: 400 },
          );
        }

        return HttpResponse.json({
          data: {
            content: [],
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
          },
        });
      }),
    );

    const client = new ApiClient(API_BASE_URL);
    const result = await client.get('/api/v1/volunteer-events', {
      query: {
        status: 'OPEN',
        page: 0,
        empty: '',
        sort: ['startAt', 'asc'],
      },
    });

    expect(result).toEqual({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('서버 오류 본문의 코드와 필드 오류를 ApiError로 보존한다', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/volunteer-applications`, () =>
        HttpResponse.json(
          {
            code: 'INVALID_REQUEST',
            message: '입력값을 확인해 주세요.',
            fieldErrors: [
              {
                field: 'motivation',
                message: '지원동기를 20자 이상 입력해 주세요.',
              },
            ],
          },
          { status: 400 },
        ),
      ),
    );

    const client = new ApiClient(API_BASE_URL);
    const request = client.post('/api/v1/volunteer-applications', {
      motivation: '짧음',
    });

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      status: 400,
      fieldErrors: [
        {
          field: 'motivation',
          message: '지원동기를 20자 이상 입력해 주세요.',
        },
      ],
    });
  });

  it('API 주소가 없을 때 명시적으로 제공한 mock 응답을 사용한다', async () => {
    const client = new ApiClient('');

    await expect(
      client.get('/api/v1/volunteer/introduction', {
        mock: ({ method, path }) => ({ method, path, source: 'mock' }),
      }),
    ).resolves.toEqual({
      method: 'GET',
      path: '/api/v1/volunteer/introduction',
      source: 'mock',
    });
  });
});
