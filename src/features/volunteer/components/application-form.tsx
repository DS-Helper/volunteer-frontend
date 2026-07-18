'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check, ImagePlus, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createVolunteerApplication,
  updateVolunteerApplication,
} from '@/features/volunteer/api';
import {
  validateVolunteerPhoto,
  volunteerApplicationSchema,
  type VolunteerApplicationFormValues,
} from '@/features/volunteer/schemas';
import type { VolunteerApplicationInput } from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';
import { FeedbackBanner } from '@/components/common/feedback-banner';

const activityOptions = [
  '생활 돌봄',
  '정서 지원',
  '아이 돌봄',
  '환경 정비',
  '기관·단체 지원',
] as const;

const defaultValues: VolunteerApplicationFormValues = {
  name: '',
  phone: '',
  birthDate: '',
  gender: 'OTHER',
  neighborhood: '',
  preferredActivities: [],
  motivation: '',
  photo: undefined,
};

export function VolunteerApplicationForm({
  mode = 'create',
  applicationId,
  initialValues,
}: {
  mode?: 'create' | 'edit';
  applicationId?: string | number;
  initialValues?: Partial<VolunteerApplicationFormValues>;
}) {
  const router = useRouter();
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerApplicationFormValues>({
    resolver: zodResolver(volunteerApplicationSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const photoRegistration = register('photo');

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const photo = values.photo?.[0];
    const photoError = validateVolunteerPhoto(photo, mode === 'create');
    if (photoError) {
      setError('photo', { message: photoError });
      return;
    }

    const application: VolunteerApplicationInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      birthDate: values.birthDate,
      gender: values.gender,
      neighborhood: values.neighborhood.trim(),
      preferredActivities: values.preferredActivities,
      motivation: values.motivation.trim(),
    };

    try {
      if (mode === 'edit') {
        if (!applicationId) throw new Error('수정할 신청 ID가 없습니다.');
        await updateVolunteerApplication(applicationId, { application, photo });
      } else {
        if (!photo) return;
        await createVolunteerApplication({ application, photo });
      }
      router.push('/volunteer/application-status');
      router.refresh();
    } catch (error) {
      if (isApiError(error)) {
        error.fieldErrors.forEach((fieldError) => {
          if (fieldError.field in defaultValues) {
            setError(fieldError.field as keyof VolunteerApplicationFormValues, {
              message: fieldError.message,
            });
          }
        });
        setSubmitError(error.message);
      } else {
        setSubmitError('신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      {submitError ? <FeedbackBanner variant="error">{submitError}</FeedbackBanner> : null}

      <section aria-labelledby="application-basic-heading">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">1</span>
          <h2 id="application-basic-heading" className="text-xl font-extrabold text-[var(--text-strong)]">
            기본 정보
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="이름" error={errors.name?.message} required>
            <input
              {...register('name')}
              className="field-input"
              placeholder="홍길동"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
            />
          </FormField>
          <FormField label="연락처" error={errors.phone?.message} required>
            <input
              {...register('phone')}
              className="field-input"
              placeholder="010-0000-0000"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
            />
          </FormField>
          <FormField label="생년월일" error={errors.birthDate?.message} required>
            <input
              {...register('birthDate')}
              type="date"
              className="field-input"
              aria-invalid={Boolean(errors.birthDate)}
            />
          </FormField>
          <FormField label="성별" error={errors.gender?.message} required>
            <select {...register('gender')} className="field-input" aria-invalid={Boolean(errors.gender)}>
              <option value="OTHER">선택 안 함</option>
              <option value="FEMALE">여성</option>
              <option value="MALE">남성</option>
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="거주 동네" error={errors.neighborhood?.message} required>
              <input
                {...register('neighborhood')}
                className="field-input"
                placeholder="예: 달성군 화원읍"
                autoComplete="address-level3"
                aria-invalid={Boolean(errors.neighborhood)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section aria-labelledby="application-interest-heading" className="border-t border-[var(--line)] pt-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">2</span>
          <h2 id="application-interest-heading" className="text-xl font-extrabold text-[var(--text-strong)]">
            활동 관심사
          </h2>
        </div>
        <fieldset>
          <legend className="field-label">
            희망 봉사활동 <span className="text-[var(--danger)]">*</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activityOptions.map((activity) => (
              <label key={activity} className="group relative cursor-pointer">
                <input
                  {...register('preferredActivities')}
                  type="checkbox"
                  value={activity}
                  className="peer sr-only"
                />
                <span className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d5d5d5] bg-white px-4 text-sm font-bold text-[var(--text-muted)] transition-colors peer-checked:border-[var(--brand)] peer-checked:bg-[var(--brand-soft)] peer-checked:text-[var(--brand-dark)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--brand)]">
                  <span className="grid size-5 place-items-center rounded border border-[#cfcfcf] bg-white peer-checked:border-[var(--brand)]">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  {activity}
                </span>
              </label>
            ))}
          </div>
          {errors.preferredActivities?.message ? (
            <p className="field-error">{errors.preferredActivities.message}</p>
          ) : null}
        </fieldset>
        <div className="mt-6">
          <FormField label="지원동기" error={errors.motivation?.message} required>
            <textarea
              {...register('motivation')}
              className="field-input min-h-40 resize-y"
              placeholder="함께하고 싶은 이유와 기대하는 활동을 20자 이상 작성해 주세요."
              aria-invalid={Boolean(errors.motivation)}
            />
          </FormField>
        </div>
      </section>

      <section aria-labelledby="application-photo-heading" className="border-t border-[var(--line)] pt-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">3</span>
          <h2 id="application-photo-heading" className="text-xl font-extrabold text-[var(--text-strong)]">
            본인 사진
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-[var(--surface)] text-[#a5a5a5]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 사용자가 선택한 로컬 Blob 미리보기입니다.
              <img src={previewUrl} alt="선택한 본인 사진 미리보기" className="size-full object-cover" />
            ) : (
              <Camera size={42} strokeWidth={1.4} aria-hidden="true" />
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d5d5d5] bg-white px-5 py-3 text-sm font-extrabold text-[var(--text)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">
              <ImagePlus size={18} aria-hidden="true" />
              {previewUrl ? '사진 바꾸기' : '사진 선택'}
              <input
                {...photoRegistration}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  void photoRegistration.onChange(event);
                  if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                  const nextPhoto = event.target.files?.[0];
                  const nextUrl = nextPhoto ? URL.createObjectURL(nextPhoto) : null;
                  previewUrlRef.current = nextUrl;
                  setPreviewUrl(nextUrl);
                }}
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              JPG, PNG, WEBP · 최대 20MB
              <br />
              사진은 본인과 관리자만 확인할 수 있도록 서버에서 비공개로 보관합니다.
            </p>
            {errors.photo?.message ? <p className="field-error">{String(errors.photo.message)}</p> : null}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-8 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-12 rounded-xl border border-[#d5d5d5] px-6 text-sm font-extrabold text-[var(--text)] hover:bg-[var(--surface)]"
        >
          이전으로
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-6 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : null}
          {isSubmitting ? '저장 중…' : mode === 'edit' ? '수정 내용 저장' : '가입 신청하기'}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label} {required ? <span className="text-[var(--danger)]">*</span> : null}
      </span>
      {children}
      {error ? <span className="field-error block">{error}</span> : null}
    </label>
  );
}
