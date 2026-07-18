'use client';

import { useMutation } from '@tanstack/react-query';
import { CheckCheck, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { FeedbackBanner } from '@/components/common/feedback-banner';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import { saveAdminVolunteerAttendance } from '@/features/volunteer/api';
import type {
  AdminVolunteerParticipationItem,
  VolunteerParticipationStatus,
} from '@/features/volunteer/types';
import { isApiError } from '@/lib/errors';

type AttendanceSelection = Record<string, VolunteerParticipationStatus>;

export function AttendanceManager({
  eventId,
  participations,
}: {
  eventId: string | number;
  participations: AdminVolunteerParticipationItem[];
}) {
  const [selection, setSelection] = useState<AttendanceSelection>(() =>
    Object.fromEntries(
      participations.map((item) => [String(item.participationId), item.participationStatus]),
    ),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const attendedIds = participations
    .filter((item) => selection[String(item.participationId)] === 'ATTENDED')
    .map((item) => item.participationId);
  const absentIds = participations
    .filter((item) => selection[String(item.participationId)] === 'ABSENT')
    .map((item) => item.participationId);
  const unprocessedCount = participations.length - attendedIds.length - absentIds.length;

  const mutation = useMutation({
    mutationFn: () =>
      saveAdminVolunteerAttendance(eventId, {
        attendedParticipationIds: attendedIds,
        absentParticipationIds: absentIds,
      }),
    onSuccess: (result) => {
      setFeedback({
        type: 'success',
        message: `출석 ${result.attendedCount}명, 불참 ${result.absentCount}명의 처리를 저장했습니다.`,
      });
      setConfirmOpen(false);
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        message: isApiError(error) ? error.message : '출석 결과를 저장하지 못했습니다.',
      });
      setConfirmOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {feedback ? <FeedbackBanner variant={feedback.type}>{feedback.message}</FeedbackBanner> : null}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[var(--brand-dark)]">출석 {attendedIds.length}</span>
          <span className="rounded-full bg-[#fff0f0] px-3 py-1.5 text-[var(--danger)]">불참 {absentIds.length}</span>
          <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-[var(--text-muted)]">미처리 {unprocessedCount}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setSelection(
                Object.fromEntries(
                  participations.map((item) => [String(item.participationId), 'ATTENDED']),
                ),
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#d5d5d5] px-4 py-2.5 text-sm font-extrabold text-[var(--text)]"
          >
            <CheckCheck size={17} aria-hidden="true" />
            전체 출석
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={mutation.isPending || !participations.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {mutation.isPending ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : null}
            일괄 저장
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--surface)] text-xs text-[var(--text-muted)]">
            <tr><th className="px-5 py-4">이름</th><th className="px-5 py-4">연락처</th><th className="px-5 py-4">신청 상태</th><th className="px-5 py-4">출석 결과</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {participations.map((participation) => (
              <tr key={participation.participationId}>
                <td className="px-5 py-4 font-extrabold text-[var(--text-strong)]">{participation.name}</td>
                <td className="px-5 py-4 text-[var(--text-muted)]">{participation.phone}</td>
                <td className="px-5 py-4 text-[var(--text-muted)]">참여 신청</td>
                <td className="px-5 py-4">
                  <fieldset>
                    <legend className="sr-only">{participation.name} 출석 결과</legend>
                    <div className="flex gap-2">
                      {(['ATTENDED', 'ABSENT', 'APPLIED'] as const).map((status) => (
                        <label key={status} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${participation.participationId}`}
                            value={status}
                            checked={selection[String(participation.participationId)] === status}
                            onChange={() =>
                              setSelection((current) => ({
                                ...current,
                                [String(participation.participationId)]: status,
                              }))
                            }
                            className="peer sr-only"
                          />
                          <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--brand)] ${status === 'ATTENDED' ? 'peer-checked:border-[var(--brand)] peer-checked:bg-[var(--brand-soft)] peer-checked:text-[var(--brand-dark)]' : status === 'ABSENT' ? 'peer-checked:border-[#e4a9a9] peer-checked:bg-[#fff0f0] peer-checked:text-[var(--danger)]' : 'peer-checked:border-[#bdbdbd] peer-checked:bg-[var(--surface)] peer-checked:text-[var(--text-muted)]'} border-[#e0e0e0] text-[#999]`}>
                            {status === 'ATTENDED' ? '출석' : status === 'ABSENT' ? '불참' : '미처리'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="출석 결과를 일괄 저장할까요?"
        description={`출석 ${attendedIds.length}명 · 불참 ${absentIds.length}명 · 미처리 ${unprocessedCount}명\n참여자 이름이 아닌 서버 participation ID로 저장합니다.`}
        confirmLabel="출석 저장"
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
