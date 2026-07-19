'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import {
  cancelAdminVolunteerEvent,
  closeAdminVolunteerEvent,
  openAdminVolunteerEvent,
} from '@/features/volunteer/api';
import type { AdminVolunteerEvent } from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';
import { volunteerQueryKeys } from '@/features/volunteer/query-keys';

type EventAdminAction = 'open' | 'close' | 'cancel';

export function AdminEventActions({ event }: { event: AdminVolunteerEvent }) {
  const [action, setAction] = useState<EventAdminAction | null>(null);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (selected: EventAdminAction) => {
      if (selected === 'open') return openAdminVolunteerEvent(event.id);
      if (selected === 'close') return closeAdminVolunteerEvent(event.id, { reason: reason.trim() || undefined });
      if (!reason.trim()) throw new Error('일정 취소 사유를 입력해 주세요.');
      return cancelAdminVolunteerEvent(event.id, { reason: reason.trim() });
    },
    onSuccess: (_, selected) => {
      void queryClient.invalidateQueries({ queryKey: volunteerQueryKeys.events() });
      void queryClient.invalidateQueries({ queryKey: volunteerQueryKeys.event(event.id) });
      const label = selected === 'open' ? '모집을 시작했습니다.' : selected === 'close' ? '모집을 마감했습니다.' : '일정을 취소했습니다.';
      setResult({ type: 'success', message: label });
      setAction(null);
      setReason('');
    },
    onError: (error) => {
      setResult({ type: 'error', message: isApiError(error) || error instanceof Error ? error.message : '요청을 처리하지 못했습니다.' });
    },
  });

  return (
    <div className="space-y-4">
      {result ? <FeedbackBanner variant={result.type}>{result.message}</FeedbackBanner> : null}
      <div className="flex flex-wrap gap-2">
        {event.capabilities.canOpen ? <button type="button" onClick={() => setAction('open')} className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white">모집 시작</button> : null}
        {event.capabilities.canClose ? <button type="button" onClick={() => setAction('close')} className="rounded-xl border border-[#edca93] bg-white px-5 py-3 text-sm font-extrabold text-[#9a5b00]">모집 마감</button> : null}
        {event.capabilities.canCancel ? <button type="button" onClick={() => setAction('cancel')} className="rounded-xl border border-[#e8c5c5] bg-white px-5 py-3 text-sm font-extrabold text-[var(--danger)]">일정 취소</button> : null}
      </div>
      <ConfirmModal
        open={action !== null}
        title={action === 'open' ? '봉사 모집을 시작할까요?' : action === 'close' ? '봉사 모집을 마감할까요?' : '봉사 일정을 취소할까요?'}
        description={action === 'cancel' ? '일정을 취소하면 참여자에게 변경 알림이 발송됩니다.' : '현재 상태와 참여 인원을 서버에서 다시 확인한 뒤 처리합니다.'}
        confirmLabel={action === 'open' ? '모집 시작' : action === 'close' ? '모집 마감' : '일정 취소'}
        danger={action === 'cancel'}
        pending={mutation.isPending}
        onConfirm={() => { if (action) mutation.mutate(action); }}
        onClose={() => setAction(null)}
      >
        {action !== 'open' ? (
          <label className="block">
            <span className="field-label">처리 사유 {action === 'cancel' ? <span className="text-[var(--danger)]">*</span> : null}</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="field-input min-h-24" placeholder={action === 'cancel' ? '참여자에게 안내할 취소 사유' : '선택 입력'} />
          </label>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
