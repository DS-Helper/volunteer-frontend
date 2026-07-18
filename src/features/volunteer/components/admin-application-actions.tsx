'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import {
  approveVolunteerApplication,
  rejectVolunteerApplication,
} from '@/features/volunteer/api';
import type { AdminVolunteerApplication } from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';

export function AdminApplicationActions({
  application,
}: {
  application: AdminVolunteerApplication;
}) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminMemo, setAdminMemo] = useState(application.adminMemo ?? '');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async (selected: 'approve' | 'reject') => {
      if (selected === 'approve') return approveVolunteerApplication(application.id);
      if (!rejectionReason.trim()) throw new Error('사용자 공개용 반려 사유를 입력해 주세요.');
      return rejectVolunteerApplication(application.id, {
        rejectionReason: rejectionReason.trim(),
        adminMemo: adminMemo.trim() || undefined,
      });
    },
    onSuccess: (_, selected) => {
      setResult({
        type: 'success',
        message: selected === 'approve' ? '가입 신청을 승인했습니다.' : '가입 신청을 반려했습니다.',
      });
      setAction(null);
    },
    onError: (error) => {
      setResult({
        type: 'error',
        message: isApiError(error) || error instanceof Error ? error.message : '처리하지 못했습니다.',
      });
      if (!(error instanceof Error && error.message.includes('입력'))) setAction(null);
    },
  });

  if (!application.capabilities.canApprove && !application.capabilities.canReject && !result) {
    return <p className="text-sm text-[var(--text-muted)]">현재 상태에서는 승인 또는 반려할 수 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {result ? <FeedbackBanner variant={result.type}>{result.message}</FeedbackBanner> : null}
      <div className="flex flex-wrap gap-3">
        {application.capabilities.canApprove ? (
          <button type="button" onClick={() => setAction('approve')} className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)]">
            가입 승인
          </button>
        ) : null}
        {application.capabilities.canReject ? (
          <button type="button" onClick={() => setAction('reject')} className="rounded-xl border border-[#e8c5c5] bg-white px-5 py-3 text-sm font-extrabold text-[var(--danger)] hover:bg-[#fff5f5]">
            가입 반려
          </button>
        ) : null}
      </div>
      <ConfirmModal
        open={action !== null}
        title={action === 'approve' ? `${application.name}님의 가입을 승인할까요?` : `${application.name}님의 가입을 반려할까요?`}
        description={action === 'approve' ? '승인하면 ACTIVE 상태의 봉사단원이 생성됩니다.' : '사용자에게 공개되는 사유와 관리자 내부 메모를 명확히 분리해 작성해 주세요.'}
        confirmLabel={action === 'approve' ? '승인하기' : '반려하기'}
        danger={action === 'reject'}
        pending={mutation.isPending}
        onConfirm={() => {
          if (action) mutation.mutate(action);
        }}
        onClose={() => setAction(null)}
      >
        {action === 'reject' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="field-label">사용자 공개용 반려 사유 <span className="text-[var(--danger)]">*</span></span>
              <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="field-input min-h-24" placeholder="사용자가 확인할 수 있는 사유" />
            </label>
            <label className="block">
              <span className="field-label">관리자 내부 메모</span>
              <textarea value={adminMemo} onChange={(event) => setAdminMemo(event.target.value)} className="field-input min-h-20" placeholder="사용자에게 공개되지 않는 내부 기록" />
            </label>
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
