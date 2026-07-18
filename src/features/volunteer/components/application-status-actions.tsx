'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import { cancelVolunteerApplication } from '@/features/volunteer/api';
import type { VolunteerApplication } from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';

export function ApplicationStatusActions({
  application,
}: {
  application: VolunteerApplication;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const capabilities = canceled
    ? { canEdit: false, canCancel: false, canReapply: true }
    : application.capabilities;

  const cancelMutation = useMutation({
    mutationFn: () => cancelVolunteerApplication(String(application.id)),
    onSuccess: () => {
      setCanceled(true);
      setCancelOpen(false);
    },
    onError: (error) => {
      setErrorMessage(
        isApiError(error)
          ? error.message
          : '신청을 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
      setCancelOpen(false);
    },
  });

  return (
    <div className="space-y-4">
      {canceled ? (
        <FeedbackBanner variant="success">
          가입 신청이 취소되었습니다. 원할 때 다시 신청할 수 있습니다.
        </FeedbackBanner>
      ) : null}
      {errorMessage ? <FeedbackBanner variant="error">{errorMessage}</FeedbackBanner> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {capabilities.canEdit ? (
          <Link href="/volunteer/application/edit" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d5d5d5] px-6 text-sm font-extrabold text-[var(--text)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">
            신청 내용 수정
          </Link>
        ) : null}
        {capabilities.canCancel ? (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="min-h-12 rounded-xl border border-[#e8c5c5] px-6 text-sm font-extrabold text-[var(--danger)] hover:bg-[#fff4f4]"
          >
            신청 취소
          </button>
        ) : null}
        {(capabilities.canReapply || canceled) ? (
          <Link href="/volunteer/application" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-6 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)]">
            다시 신청하기
          </Link>
        ) : null}
        {(application.status === 'APPROVED' && !canceled) ? (
          <Link href="/volunteer/events?status=OPEN&page=0" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-6 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)]">
            봉사 일정 보러가기
          </Link>
        ) : null}
      </div>

      <ConfirmModal
        open={cancelOpen}
        title="가입 신청을 취소하시겠어요?"
        description="취소 후에는 현재 신청을 수정할 수 없습니다. 다시 참여하고 싶다면 새 신청서를 작성해 주세요."
        confirmLabel="신청 취소"
        danger
        pending={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}
