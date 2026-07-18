import { describe, expect, it } from 'vitest';

import {
  MAX_VOLUNTEER_PHOTO_SIZE,
  validateVolunteerPhoto,
  volunteerApplicationSchema,
} from '@/features/volunteer/schemas';

const validApplication = {
  name: '홍길동',
  phone: '010-1234-5678',
  birthDate: '1990-01-01',
  gender: 'MALE' as const,
  neighborhood: '화원읍',
  preferredActivities: ['생활 돌봄 지원'],
  motivation: '이웃과 꾸준히 시간을 나누며 도움이 되고 싶습니다.',
};

function createPhoto(type: string, size: number, name = 'profile.png'): File {
  const file = new File(['photo'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('volunteerApplicationSchema', () => {
  it('유효한 가입 신청을 검증하고 문자열 양끝 공백을 제거한다', () => {
    const result = volunteerApplicationSchema.safeParse({
      ...validApplication,
      name: '  홍길동  ',
      neighborhood: '  화원읍  ',
      motivation: `  ${'가'.repeat(20)}  `,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      name: '홍길동',
      neighborhood: '화원읍',
      motivation: '가'.repeat(20),
    });
  });

  it.each([
    ['name', '', '이름을 입력해 주세요.'],
    ['phone', '010123456', '연락처는 10자 이상 입력해 주세요.'],
    ['birthDate', '', '생년월일을 입력해 주세요.'],
    ['neighborhood', '', '거주 동네를 입력해 주세요.'],
    ['preferredActivities', [], '희망 활동을 하나 이상 선택해 주세요.'],
    ['motivation', '가'.repeat(19), '지원동기를 20자 이상 입력해 주세요.'],
  ] as const)('%s 필드의 경계 오류를 제공한다', (field, value, message) => {
    const result = volunteerApplicationSchema.safeParse({
      ...validApplication,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors[field]).toContain(message);
  });

  it('지원동기 20자와 2,000자를 허용하고 2,001자를 거부한다', () => {
    expect(
      volunteerApplicationSchema.safeParse({
        ...validApplication,
        motivation: '가'.repeat(20),
      }).success,
    ).toBe(true);
    expect(
      volunteerApplicationSchema.safeParse({
        ...validApplication,
        motivation: '가'.repeat(2_000),
      }).success,
    ).toBe(true);

    const overLimit = volunteerApplicationSchema.safeParse({
      ...validApplication,
      motivation: '가'.repeat(2_001),
    });
    expect(overLimit.success).toBe(false);
    if (overLimit.success) return;
    expect(overLimit.error.flatten().fieldErrors.motivation).toContain(
      '지원동기는 2,000자 이하로 입력해 주세요.',
    );
  });
});

describe('validateVolunteerPhoto', () => {
  it('필수 사진 누락과 선택 입력을 구분한다', () => {
    expect(validateVolunteerPhoto(undefined)).toBe('본인 사진을 선택해 주세요.');
    expect(validateVolunteerPhoto(undefined, false)).toBeUndefined();
  });

  it('허용된 이미지 MIME 타입과 확장자의 조합만 허용한다', () => {
    expect(validateVolunteerPhoto(createPhoto('text/plain', 1_024))).toBe(
      'JPG, PNG, WEBP 이미지 파일만 선택할 수 있습니다.',
    );
    expect(
      validateVolunteerPhoto(
        createPhoto('image/png', 1_024, 'profile.exe'),
      ),
    ).toBe(
      'JPG, PNG, WEBP 이미지 파일만 선택할 수 있습니다.',
    );
  });

  it('정확히 20MB인 이미지는 허용하고 초과한 이미지는 거부한다', () => {
    expect(
      validateVolunteerPhoto(
        createPhoto('image/png', MAX_VOLUNTEER_PHOTO_SIZE),
      ),
    ).toBeUndefined();
    expect(
      validateVolunteerPhoto(
        createPhoto('image/png', MAX_VOLUNTEER_PHOTO_SIZE + 1),
      ),
    ).toBe('사진은 20MB 이하로 선택해 주세요.');
  });
});
