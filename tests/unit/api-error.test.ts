import { describe, expect, it } from 'vitest';

import {
  ApiError,
  getFieldErrorMap,
  isApiError,
  toApiError,
} from '@/lib/errors';

describe('ApiError', () => {
  it('서버 오류 코드, 상태, 필드 오류를 보존한다', () => {
    const error = new ApiError({
      code: 'INVALID_REQUEST',
      message: '입력값을 확인해 주세요.',
      status: 400,
      fieldErrors: [
        { field: 'motivation', message: '지원동기를 확인해 주세요.' },
      ],
    });

    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({
      name: 'ApiError',
      code: 'INVALID_REQUEST',
      message: '입력값을 확인해 주세요.',
      status: 400,
    });
    expect(getFieldErrorMap(error)).toEqual({
      motivation: '지원동기를 확인해 주세요.',
    });
  });

  it('이미 정규화된 ApiError는 그대로 반환한다', () => {
    const error = new ApiError({ code: 'FORBIDDEN', message: '권한이 없습니다.' });
    expect(toApiError(error)).toBe(error);
  });

  it('일반 오류와 알 수 없는 값을 네트워크 오류로 정규화한다', () => {
    const original = new Error('연결이 끊어졌습니다.');
    expect(toApiError(original)).toMatchObject({
      code: 'NETWORK_ERROR',
      message: '연결이 끊어졌습니다.',
      originalCause: original,
    });

    expect(toApiError(null, '잠시 후 다시 시도해 주세요.')).toMatchObject({
      code: 'NETWORK_ERROR',
      message: '잠시 후 다시 시도해 주세요.',
      originalCause: null,
    });
  });
});
