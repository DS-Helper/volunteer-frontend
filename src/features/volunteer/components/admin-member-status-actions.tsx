'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import {
  activateVolunteerMember,
  suspendVolunteerMember,
  withdrawVolunteerMember,
} from '@/features/volunteer/api';
import type { AdminVolunteerMemberDetail } from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';

type MemberAction = 'activate' | 'suspend' | 'withdraw';

const actionLabels = {
  activate: { button: '활동 재개', title: '단원의 활동을 재개할까요?', confirm: '활동 재개' },
  suspend: { button: '활동정지', title: '단원의 활동을 정지할까요?', confirm: '활동정지' },
  withdraw: { button: '탈퇴 처리', title: '단원을 탈퇴 처리할까요?', confirm: '탈퇴 처리' },
};

export function AdminMemberStatusActions({ member }: { member: AdminVolunteerMemberDetail }) {
  const [action, setAction] = useState<MemberAction | null>(null);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async (selected: MemberAction) => {
      if (!reason.trim()) throw new Error('처리 사유를 입력해 주세요.');
      const request = { reason: reason.trim() };
      if (selected === 'activate') return activateVolunteerMember(member.id, request);
      if (selected === 'suspend') return suspendVolunteerMember(member.id, request);
      return withdrawVolunteerMember(member.id, request);
    },
    onSuccess: (_, selected) => {
      setResult({ type: 'success', message: `${actionLabels[selected].confirm} 처리가 완료되었습니다.` });
      setAction(null);
      setReason('');
    },
    onError: (error) => {
      setResult({
        type: 'error',
        message: isApiError(error) || error instanceof Error ? error.message : '상태를 변경하지 못했습니다.',
      });
    },
  });

  return (
    <div className="space-y-4">
      {result ? <FeedbackBanner variant={result.type}>{result.message}</FeedbackBanner> : null}
      <div className="flex flex-wrap gap-3">
        {member.capabilities.canActivate ? (
          <button type="button" onClick={() => setAction('activate')} className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white">활동 재개</button>
        ) : null}
        {member.capabilities.canSuspend ? (
          <button type="button" onClick={() => setAction('suspend')} className="rounded-xl border border-[#edca93] bg-white px-5 py-3 text-sm font-extrabold text-[#9a5b00]">활동정지</button>
        ) : null}
        {member.capabilities.canWithdraw ? (
          <button type="button" onClick={() => setAction('withdraw')} className="rounded-xl border border-[#e8c5c5] bg-white px-5 py-3 text-sm font-extrabold text-[var(--danger)]">탈퇴 처리</button>
        ) : null}
      </div>
      <ConfirmModal
        open={action !== null}
        title={action ? actionLabels[action].title : ''}
        description={`${member.name}님은 참여 예정 봉사 ${member.upcomingEvents.length}건이 있습니다. 상태 변경 후 예정 봉사 처리 여부는 서버 응답과 운영 정책을 확인해 주세요.`}
        confirmLabel={action ? actionLabels[action].confirm : '확인'}
        danger={action === 'withdraw'}
        pending={mutation.isPending}
        onConfirm={() => {
          if (action) mutation.mutate(action);
        }}
        onClose={() => setAction(null)}
      >
        <label className="block">
          <span className="field-label">처리 사유 <span className="text-[var(--danger)]">*</span></span>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="field-input min-h-24" placeholder="감사 로그에 남길 처리 사유" />
        </label>
      </ConfirmModal>
    </div>
  );
}
