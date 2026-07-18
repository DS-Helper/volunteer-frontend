import { z } from 'zod';

const dateTimeLocalSchema = z
  .string()
  .min(1, '날짜와 시간을 입력해 주세요.')
  .refine((value) => Number.isFinite(new Date(value).getTime()), '올바른 날짜와 시간을 입력해 주세요.');

export const volunteerEventSchema = z
  .object({
    title: z.string().trim().min(1, '봉사 제목을 입력해 주세요.').max(120, '제목은 120자 이하로 입력해 주세요.'),
    activityType: z.string().min(1, '봉사 유형을 선택해 주세요.'),
    startAt: dateTimeLocalSchema,
    endAt: dateTimeLocalSchema,
    recruitmentDeadlineAt: dateTimeLocalSchema,
    location: z.string().trim().min(1, '장소를 입력해 주세요.').max(200, '장소는 200자 이하로 입력해 주세요.'),
    capacity: z.coerce.number().int('모집 인원은 정수로 입력해 주세요.').min(1, '모집 인원은 1명 이상이어야 합니다.'),
    description: z.string().trim().min(10, '활동 내용을 10자 이상 입력해 주세요.').max(3000, '활동 내용은 3,000자 이하로 입력해 주세요.'),
    supplies: z.string().trim().max(1000, '준비물은 1,000자 이하로 입력해 주세요.'),
    precautions: z.string().trim().max(1000, '유의사항은 1,000자 이하로 입력해 주세요.'),
    status: z.enum(['DRAFT', 'OPEN']),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
    image: z.custom<FileList>().optional(),
  })
  .superRefine((value, context) => {
    const startAt = new Date(value.startAt).getTime();
    const endAt = new Date(value.endAt).getTime();
    const deadlineAt = new Date(value.recruitmentDeadlineAt).getTime();

    if (Number.isFinite(startAt) && Number.isFinite(endAt) && endAt <= startAt) {
      context.addIssue({
        code: 'custom',
        path: ['endAt'],
        message: '종료 일시는 시작 일시보다 늦어야 합니다.',
      });
    }
    if (Number.isFinite(startAt) && Number.isFinite(deadlineAt) && deadlineAt > startAt) {
      context.addIssue({
        code: 'custom',
        path: ['recruitmentDeadlineAt'],
        message: '모집 마감 일시는 시작 일시보다 늦을 수 없습니다.',
      });
    }
  });

export type VolunteerEventFormValues = z.input<typeof volunteerEventSchema>;
