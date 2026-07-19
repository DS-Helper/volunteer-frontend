'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { getAdminVolunteerEvents } from '@/features/volunteer/api';
import {
  VOLUNTEER_EVENT_STATUS_LABEL,
  VOLUNTEER_EVENT_VISIBILITY_LABEL,
  type VolunteerEventStatus,
  type VolunteerEventVisibility,
} from '@/features/volunteer/types';
import { formatVolunteerDateTimeRange } from '@/lib/date';

const statusTone = {
  DRAFT: 'gray', OPEN: 'green', CLOSED: 'amber', COMPLETED: 'blue', CANCELED: 'red',
} as const;

export default function AdminVolunteerEventsPage() {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getAdminVolunteerEvents>> | null>(null);
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const keyword = params.get('keyword') || undefined;
  const statusValue = params.get('status');
  const visibilityValue = params.get('visibility');
  const status = statusValue && statusValue in VOLUNTEER_EVENT_STATUS_LABEL ? statusValue as VolunteerEventStatus : undefined;
  const visibility = visibilityValue && visibilityValue in VOLUNTEER_EVENT_VISIBILITY_LABEL ? visibilityValue as VolunteerEventVisibility : undefined;
  useEffect(() => {
    const controller = new AbortController();
    void getAdminVolunteerEvents({ keyword, status, visibility, page: 0, size: 20 }, controller.signal).then(setResult).catch(() => undefined);
    return () => controller.abort();
  }, [keyword, status, visibility]);
  if (!result) return <main className="mx-auto max-w-[1240px] px-5 py-20 text-center" role="status">일정 목록을 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeading
        eyebrow="Admin · Events"
        title="봉사 일정 관리"
        description="봉사 일정을 등록하고 모집·완료 상태와 참여 인원을 관리합니다."
        actions={
          <Link href="/admin/volunteer/events/new" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-extrabold text-white">
            <Plus size={18} aria-hidden="true" /> 일정 등록
          </Link>
        }
      />
      <form method="get" className="mt-8 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_180px_160px_auto]">
        <label><span className="sr-only">일정 검색</span><input name="keyword" defaultValue={keyword} className="field-input" placeholder="제목 또는 장소 검색" /></label>
        <label><span className="sr-only">일정 상태</span><select name="status" defaultValue={status ?? ''} className="field-input"><option value="">전체 상태</option>{Object.entries(VOLUNTEER_EVENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">공개 여부</span><select name="visibility" defaultValue={visibility ?? ''} className="field-input"><option value="">전체 공개 여부</option>{Object.entries(VOLUNTEER_EVENT_VISIBILITY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="submit" className="min-h-12 rounded-xl bg-[#162019] px-5 text-sm font-extrabold text-white">검색</button>
      </form>
      {result.content.length ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <caption className="sr-only">봉사 일정 목록</caption>
            <thead className="bg-[var(--surface)] text-xs text-[var(--text-muted)]"><tr><th className="px-5 py-4">일정</th><th className="px-5 py-4">일시</th><th className="px-5 py-4">상태</th><th className="px-5 py-4">공개</th><th className="px-5 py-4">참여 인원</th><th className="px-5 py-4"><span className="sr-only">상세</span></th></tr></thead>
            <tbody className="divide-y divide-[var(--line)]">{result.content.map((event) => (
              <tr key={event.id} className="hover:bg-[#fbfcfb]">
                <td className="px-5 py-4"><p className="font-extrabold text-[var(--text-strong)]">{event.title}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{event.location}</p></td>
                <td className="px-5 py-4 text-[var(--text-muted)]">{formatVolunteerDateTimeRange(event.startAt, event.endAt)}</td>
                <td className="px-5 py-4"><StatusBadge tone={statusTone[event.status]}>{VOLUNTEER_EVENT_STATUS_LABEL[event.status]}</StatusBadge></td>
                <td className="px-5 py-4"><StatusBadge tone={event.visibility === 'PUBLIC' ? 'green' : 'gray'}>{VOLUNTEER_EVENT_VISIBILITY_LABEL[event.visibility]}</StatusBadge></td>
                <td className="px-5 py-4 font-semibold text-[var(--text)]">{event.participantCount} / {event.capacity}명</td>
                <td className="px-5 py-4 text-right"><Link href={`/admin/volunteer/events/${event.id}`} className="font-extrabold text-[var(--brand-dark)]">상세보기</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="mt-6"><EmptyState title="등록된 봉사 일정이 없습니다." description="새 일정을 등록하거나 검색 조건을 변경해 주세요." /></div>}
    </div>
  );
}
