'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import {
  createAdminVolunteerEvent,
  uploadAdminVolunteerEventImage,
  updateAdminVolunteerEvent,
} from '@/features/volunteer/api';
import {
  validateVolunteerPhoto,
  volunteerEventSchema,
  type VolunteerEventFormValues,
} from '@/features/volunteer/schemas';
import type { VolunteerEventInput } from '@/features/volunteer/types';
import { fromSeoulDateTimeLocalValue } from '@/lib/date';
import { isApiError } from '@/lib/errors';

const initialFormValues: VolunteerEventFormValues = {
  title: '',
  activityType: '',
  startAt: '',
  endAt: '',
  recruitmentDeadlineAt: '',
  location: '',
  capacity: 1,
  description: '',
  supplies: '',
  precautions: '',
  status: 'DRAFT',
  visibility: 'PUBLIC',
  image: undefined,
};

export function AdminEventForm({
  mode = 'create',
  eventId,
  currentParticipantCount = 0,
  currentImageFileId,
  initialValues,
}: {
  mode?: 'create' | 'edit';
  eventId?: string | number;
  currentParticipantCount?: number;
  currentImageFileId?: string;
  initialValues?: Partial<VolunteerEventFormValues>;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'failed'>('idle');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VolunteerEventFormValues>({
    resolver: zodResolver(volunteerEventSchema),
    defaultValues: { ...initialFormValues, ...initialValues },
  });

  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty, isSubmitting]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const image = values.image?.[0];
    const imageError = validateVolunteerPhoto(image, mode === 'create');
    if (imageError) {
      setError('image', { message: imageError.replace('본인 사진', '봉사 이미지').replace('사진', '이미지') });
      return;
    }
    const capacity = Number(values.capacity);
    if (capacity < currentParticipantCount) {
      setError('capacity', {
        message: `현재 참여 인원 ${currentParticipantCount}명보다 작게 설정할 수 없습니다.`,
      });
      return;
    }

    try {
      const uploadedImage = image
        ? (setUploadStatus('uploading'), await uploadAdminVolunteerEventImage(image).catch((error) => { setUploadStatus('failed'); throw error; }))
        : null;
      setUploadStatus('idle');
      const imageFileId = uploadedImage?.volunteerFileId ?? currentImageFileId;
      if (!imageFileId) {
        setError('image', { message: '일정 이미지를 선택해 주세요.' });
        return;
      }

      const event: VolunteerEventInput = {
      title: values.title.trim(),
      type: values.activityType,
      imageFileId,
      startAt: fromSeoulDateTimeLocalValue(values.startAt),
      endAt: fromSeoulDateTimeLocalValue(values.endAt),
      recruitmentDeadlineAt: fromSeoulDateTimeLocalValue(values.recruitmentDeadlineAt),
      location: values.location.trim(),
      capacity,
      description: values.description.trim(),
      supplies: values.supplies.trim() || null,
      precautions: values.precautions.trim() || null,
      status: values.status,
      visibility: values.visibility,
      };

      if (mode === 'edit') {
        if (!eventId) throw new Error('수정할 일정 ID가 없습니다.');
        await updateAdminVolunteerEvent(eventId, event);
        router.push(`/admin/volunteer/events/${eventId}`);
      } else {
        const created = await createAdminVolunteerEvent(event);
        router.push(`/admin/volunteer/events/${created.id}`);
      }
      router.refresh();
    } catch (error) {
      if (isApiError(error)) {
        error.fieldErrors.forEach((fieldError) => {
          if (fieldError.field in initialFormValues) {
            setError(fieldError.field as keyof VolunteerEventFormValues, {
              message: fieldError.message,
            });
          }
        });
        setSubmitError(error.message);
      } else {
        setSubmitError('일정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {mode === 'edit' ? (
        <FeedbackBanner variant="info">
          시간이나 장소를 변경하면 기존 참여자에게 일정 변경 알림이 발송됩니다.
        </FeedbackBanner>
      ) : null}
      {submitError ? <FeedbackBanner variant="error">{submitError}</FeedbackBanner> : null}
      <p className="sr-only" aria-live="polite">{uploadStatus === 'uploading' ? '이미지를 업로드하는 중입니다.' : uploadStatus === 'failed' ? '이미지 업로드에 실패했습니다. 다시 시도해 주세요.' : ''}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="봉사 제목" error={errors.title?.message} required>
            <input {...register('title')} className="field-input" placeholder="예: 송해공원 플로깅 봉사" aria-invalid={Boolean(errors.title)} />
          </Field>
        </div>
        <Field label="봉사 유형" error={errors.activityType?.message} required>
          <select {...register('activityType')} className="field-input" aria-invalid={Boolean(errors.activityType)}>
            <option value="">유형 선택</option>
            <option value="ENVIRONMENT">환경·플로깅</option>
            <option value="WELFARE">이웃 돌봄</option>
            <option value="EDUCATION">교육·디지털 지원</option>
            <option value="ANIMAL">동물 보호</option>
            <option value="SAFETY">지역 안전</option>
            <option value="COMMUNITY">봉사단 운영</option>
          </select>
        </Field>
        <Field label="모집 인원" error={errors.capacity?.message} required>
          <input {...register('capacity')} type="number" min={1} className="field-input" aria-invalid={Boolean(errors.capacity)} />
          {currentParticipantCount ? <p className="mt-2 text-xs text-[var(--text-muted)]">현재 참여 인원: {currentParticipantCount}명</p> : null}
        </Field>
        <Field label="시작 일시" error={errors.startAt?.message} required>
          <input {...register('startAt')} type="datetime-local" className="field-input" aria-invalid={Boolean(errors.startAt)} />
        </Field>
        <Field label="종료 일시" error={errors.endAt?.message} required>
          <input {...register('endAt')} type="datetime-local" className="field-input" aria-invalid={Boolean(errors.endAt)} />
        </Field>
        <Field label="모집 마감 일시" error={errors.recruitmentDeadlineAt?.message} required>
          <input {...register('recruitmentDeadlineAt')} type="datetime-local" className="field-input" aria-invalid={Boolean(errors.recruitmentDeadlineAt)} />
        </Field>
        <Field label="장소" error={errors.location?.message} required>
          <input {...register('location')} className="field-input" placeholder="집결 장소까지 구체적으로 입력" aria-invalid={Boolean(errors.location)} />
        </Field>
        <Field label="초기 상태" error={errors.status?.message} required>
          <select {...register('status')} className="field-input"><option value="DRAFT">작성중</option><option value="OPEN">모집중</option></select>
        </Field>
        <Field label="공개 여부" error={errors.visibility?.message} required>
          <select {...register('visibility')} className="field-input"><option value="PUBLIC">공개</option><option value="PRIVATE">비공개</option></select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="활동 내용" error={errors.description?.message} required>
            <textarea {...register('description')} className="field-input min-h-36" placeholder="참여자가 이해할 수 있도록 활동 내용을 작성해 주세요." aria-invalid={Boolean(errors.description)} />
          </Field>
        </div>
        <Field label="준비물" error={errors.supplies?.message}>
          <textarea {...register('supplies')} className="field-input min-h-28" placeholder={'한 줄에 하나씩 입력\n예: 편한 운동화'} />
        </Field>
        <Field label="유의사항" error={errors.precautions?.message}>
          <textarea {...register('precautions')} className="field-input min-h-28" placeholder={'한 줄에 하나씩 입력\n예: 우천 시 변경될 수 있습니다.'} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="봉사 이미지" error={errors.image?.message ? String(errors.image.message) : undefined} required={mode === 'create'}>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-[#c8c8c8] bg-[var(--surface)] px-5 py-8 text-sm font-extrabold text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">
              <ImagePlus size={21} aria-hidden="true" />
              이미지 선택 · JPG, PNG, WEBP · 최대 20MB
              <input {...register('image')} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" />
            </label>
          </Field>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-7 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.back()} className="min-h-12 rounded-xl border border-[#d5d5d5] px-6 text-sm font-extrabold text-[var(--text)]">취소</button>
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-7 text-sm font-extrabold text-white disabled:opacity-50">
          {isSubmitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : null}
          {isSubmitting ? '저장 중…' : mode === 'edit' ? '수정 내용 저장' : '일정 등록'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, required = false, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label} {required ? <span className="text-[var(--danger)]">*</span> : null}</span>
      {children}
      {error ? <span className="field-error block">{error}</span> : null}
    </label>
  );
}
