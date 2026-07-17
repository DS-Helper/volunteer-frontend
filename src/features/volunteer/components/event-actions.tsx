'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import {
  applyVolunteerEvent,
  cancelVolunteerEventParticipation,
  getVolunteerEventParticipants,
} from '@/features/volunteer/api';
import type { VolunteerEventListItem } from '@/features/volunteer/types';
import { VOLUNTEER_API_ERROR_MESSAGE } from '@/features/volunteer/types';
import { formatVolunteerDateTimeRange } from '@/lib/date';
import { isApiError } from '@/lib/errors';

export function EventActions({
  event,
  compact = false,
}: {
  event: VolunteerEventListItem;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'apply' | 'cancel' | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [state, setState] = useState({
    participantCount: event.participantCount,
    participationStatus: event.myParticipationStatus,
    canApply: event.capabilities.canApply,
    canCancel: event.capabilities.canCancel,
  });

  const participantQuery = useQuery({
    queryKey: ['volunteer', 'events', event.id, 'participants'],
    queryFn: () => getVolunteerEventParticipants(String(event.id)),
    enabled: participantsOpen && event.capabilities.canViewParticipants,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: async (action: 'apply' | 'cancel') =>
      action === 'apply'
        ? applyVolunteerEvent(String(event.id))
        : cancelVolunteerEventParticipation(String(event.id)),
    onSuccess: (_, action) => {
      const applied = action === 'apply';
      setState((current) => ({
        participantCount: Math.max(0, current.participantCount + (applied ? 1 : -1)),
        participationStatus: applied ? 'APPLIED' : null,
        canApply: !applied,
        canCancel: applied,
      }));
      setFeedback({
        type: 'success',
        message: applied ? '봉사 참여 신청이 완료되었습니다.' : '봉사 참여가 취소되었습니다.',
      });
      void queryClient.invalidateQueries({ queryKey: ['volunteer', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['volunteer', 'my'] });
      setConfirmAction(null);
    },
    onError: (error) => {
      const message = isApiError(error)
        ? VOLUNTEER_API_ERROR_MESSAGE[
            error.code as keyof typeof VOLUNTEER_API_ERROR_MESSAGE
          ] ?? error.message
        : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
      setFeedback({ type: 'error', message });
      setConfirmAction(null);
    },
  });

  return (
    <div className="space-y-3">
      {feedback ? (
        <FeedbackBanner variant={feedback.type}>{feedback.message}</FeedbackBanner>
      ) : null}
      <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        {state.canApply ? (
          <button
            type="button"
            onClick={() => setConfirmAction('apply')}
            disabled={mutation.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)] disabled:opacity-50"
          >
            {mutation.isPending ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : null}
            참여하기
          </button>
        ) : null}
        {state.canCancel ? (
          <button
            type="button"
            onClick={() => setConfirmAction('cancel')}
            disabled={mutation.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d5d5d5] bg-white px-5 text-sm font-extrabold text-[var(--text)] hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-50"
          >
            참여 취소
          </button>
        ) : null}
        {event.capabilities.canViewParticipants ? (
          <button
            type="button"
            onClick={() => setParticipantsOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d5d5d5] bg-white px-5 text-sm font-extrabold text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]"
          >
            <Users size={17} aria-hidden="true" />
            참여자 {state.participantCount}명
          </button>
        ) : null}
      </div>

      {!state.canApply && !state.canCancel && state.participationStatus === null ? (
        <p className="rounded-xl bg-[var(--surface)] px-4 py-3 text-center text-sm text-[var(--text-muted)]">
          현재 참여 신청을 받을 수 없는 일정입니다.
        </p>
      ) : null}

      <ConfirmModal
        open={confirmAction !== null}
        title={confirmAction === 'apply' ? '이 일정에 참여하시겠어요?' : '봉사 참여를 취소하시겠어요?'}
        description={
          confirmAction === 'apply'
            ? `${event.title}\n\n일시: ${formatVolunteerDateTimeRange(event.startAt, event.endAt)}\n장소: ${event.location}`
            : '봉사 시작 2시간 전까지만 직접 취소할 수 있습니다. 실제 취소 가능 여부는 서버에서 다시 확인합니다.'
        }
        confirmLabel={confirmAction === 'apply' ? '참여 신청' : '참여 취소'}
        danger={confirmAction === 'cancel'}
        pending={mutation.isPending}
        onConfirm={() => {
          if (confirmAction) mutation.mutate(confirmAction);
        }}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={participantsOpen}
        title="함께하는 참여자"
        description="개인정보 보호를 위해 이름 일부만 표시합니다."
        confirmLabel="확인"
        hideCancel
        onConfirm={() => setParticipantsOpen(false)}
        onClose={() => setParticipantsOpen(false)}
      >
        {participantQuery.isLoading ? (
          <p className="py-5 text-center text-sm text-[var(--text-muted)]">참여자를 불러오는 중…</p>
        ) : participantQuery.isError ? (
          <FeedbackBanner variant="error">참여자 목록을 불러오지 못했습니다.</FeedbackBanner>
        ) : participantQuery.data?.participants.length ? (
          <ul className="grid grid-cols-2 gap-2">
            {participantQuery.data.participants.map((participant, index) => (
              <li key={`${participant.maskedName}-${index}`} className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
                {participant.maskedName}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-5 text-center text-sm text-[var(--text-muted)]">아직 참여자가 없습니다.</p>
        )}
      </ConfirmModal>
    </div>
  );
}
