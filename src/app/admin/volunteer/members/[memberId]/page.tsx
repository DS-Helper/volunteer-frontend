'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { AdminMemberStatusActions } from '@/features/volunteer/components/admin-member-status-actions';
import { getAdminVolunteerMember } from '@/features/volunteer/api';
import {
  VOLUNTEER_GENDER_LABEL,
  VOLUNTEER_MEMBER_STATUS_LABEL,
  VOLUNTEER_PARTICIPATION_STATUS_LABEL,
  type VolunteerMemberParticipationHistoryItem,
} from '@/features/volunteer/types';
import { formatVolunteerDate, formatVolunteerDateTime, formatVolunteerDateTimeRange, formatVolunteerHours } from '@/lib/date';

export default function AdminVolunteerMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const id = memberId;
  const [member, setMember] = useState<Awaited<ReturnType<typeof getAdminVolunteerMember>> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { void getAdminVolunteerMember(id).then(setMember).catch(() => setError(true)); }, [id]);
  if (error) return <main className="mx-auto max-w-[1120px] px-5 py-20 text-center" role="alert">단원 정보를 불러오지 못했습니다.</main>;
  if (!member) return <main className="mx-auto max-w-[1120px] px-5 py-20 text-center" role="status">단원 정보를 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin/volunteer/members" className="text-sm font-bold text-[var(--text-muted)]">← 단원 목록</Link>
      <div className="mt-5">
        <PageHeading eyebrow="Member detail" title={member.name} description={`${formatVolunteerDate(member.joinedAt)} 가입 · ${member.phone}`} actions={<StatusBadge tone={member.status === 'ACTIVE' ? 'green' : member.status === 'SUSPENDED' ? 'amber' : 'gray'}>{VOLUNTEER_MEMBER_STATUS_LABEL[member.status]}</StatusBadge>} />
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="누적 참여" value={`${member.totalParticipationCount}회`} />
        <Metric label="총 참여 시간" value={formatVolunteerHours(member.totalHours)} />
        <Metric label="참여 예정" value={`${member.upcomingEvents.length}건`} />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">기본 정보</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2"><Info label="이름" value={member.name} /><Info label="성별" value={VOLUNTEER_GENDER_LABEL[member.gender]} /><Info label="연락처" value={member.phone} /><Info label="거주 동네" value={member.application.neighborhood} /></dl>
          </section>
          <HistorySection title="참여 예정 일정" items={member.upcomingEvents} empty="참여 예정인 일정이 없습니다." />
          <HistorySection title="출석 내역" items={member.attendanceHistory} empty="출석 내역이 없습니다." />
          <div className="grid gap-6 sm:grid-cols-2"><HistorySection title="불참 내역" items={member.absenceHistory} empty="불참 내역이 없습니다." compact /><HistorySection title="취소 내역" items={member.cancellationHistory} empty="취소 내역이 없습니다." compact /></div>
        </div>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">상태 변경</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">실제 변경 가능 여부와 예정 일정 영향은 서버가 최종 판단합니다.</p>
            <div className="mt-5"><AdminMemberStatusActions member={member} /></div>
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">관리자 메모</h2>
            <p className="mt-3 rounded-xl bg-[#fff9e8] p-4 text-sm leading-6 text-[var(--text)]">{member.adminMemo || '등록된 관리자 메모가 없습니다.'}</p>
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">상태 변경 이력</h2>
            {member.statusHistory.length ? <ol className="mt-4 space-y-4 border-l border-[var(--line)] pl-4">{member.statusHistory.map((history) => <li key={history.id}><p className="text-sm font-bold text-[var(--text)]">{VOLUNTEER_MEMBER_STATUS_LABEL[history.nextStatus]}</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{history.reason || '사유 없음'} · {formatVolunteerDateTime(history.changedAt)}</p></li>)}</ol> : <p className="mt-3 text-sm text-[var(--text-muted)]">변경 이력이 없습니다.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[var(--text-muted)]">{label}</p><p className="mt-2 text-3xl font-black text-[var(--text-strong)]">{value}</p></article>; }
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold text-[#929292]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</dd></div>; }

function HistorySection({ title, items, empty, compact = false }: { title: string; items: VolunteerMemberParticipationHistoryItem[]; empty: string; compact?: boolean }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
      <h2 className="text-lg font-extrabold text-[var(--text-strong)]">{title}</h2>
      {items.length ? <ul className="mt-4 divide-y divide-[var(--line)]">{items.map((item) => <li key={item.participationId} className="py-4 first:pt-0 last:pb-0"><Link href={`/admin/volunteer/events/${item.eventId}`} className="font-extrabold text-[var(--text)] hover:text-[var(--brand-dark)]">{item.title}</Link><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{formatVolunteerDateTimeRange(item.startAt, item.endAt)}{!compact ? ` · ${item.location}` : ''}</p><p className="mt-2 text-xs font-bold text-[var(--brand-dark)]">{VOLUNTEER_PARTICIPATION_STATUS_LABEL[item.status]}{item.recognizedHours !== null ? ` · ${formatVolunteerHours(item.recognizedHours)}` : ''}</p></li>)}</ul> : <p className="mt-3 text-sm text-[var(--text-muted)]">{empty}</p>}
    </section>
  );
}
