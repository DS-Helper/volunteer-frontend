import { z } from 'zod';

export const volunteerApplicationSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해 주세요.').max(50, '이름은 50자 이하로 입력해 주세요.'),
  phone: z.string().trim().min(10, '연락처는 10자 이상 입력해 주세요.').max(20, '연락처는 20자 이하로 입력해 주세요.'),
  birthDate: z.string().min(1, '생년월일을 입력해 주세요.'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: '성별을 선택해 주세요.',
  }),
  neighborhood: z.string().trim().min(1, '거주 동네를 입력해 주세요.').max(100, '거주 동네는 100자 이하로 입력해 주세요.'),
  preferredActivities: z.array(z.string()).min(1, '희망 활동을 하나 이상 선택해 주세요.'),
  motivation: z.string().trim().min(20, '지원동기를 20자 이상 입력해 주세요.').max(2000, '지원동기는 2,000자 이하로 입력해 주세요.'),
  photo: z.custom<FileList>().optional(),
});

export type VolunteerApplicationFormValues = z.infer<
  typeof volunteerApplicationSchema
>;

export const MAX_VOLUNTEER_PHOTO_SIZE = 20 * 1024 * 1024;

export function validateVolunteerPhoto(file: File | undefined, required = true) {
  if (!file) return required ? '본인 사진을 선택해 주세요.' : undefined;
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!extension || !allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type)) {
    return 'JPG, PNG, WEBP 이미지 파일만 선택할 수 있습니다.';
  }
  if (file.size > MAX_VOLUNTEER_PHOTO_SIZE) return '사진은 20MB 이하로 선택해 주세요.';
  return undefined;
}
