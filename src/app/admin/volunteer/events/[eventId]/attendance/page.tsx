'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { EmptyState } from '@/components/common/empty-state';
import { AttendanceManager } from '@/features/volunteer/components/attendance-manager';
import { getAdminVolunteerEventParticipations } from '@/features/volunteer/api';
import { formatVolunteerDateTimeRange } from '@/lib/date';

export default function AdminVolunteerAttendancePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const id = eventId;
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminVolunteerEventParticipations>> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { void getAdminVolunteerEventParticipations(id).then(setData).catch(() => setError(true)); }, [id]);
  if (error) return <main className="mx-auto max-w-[1120px] px-5 py-20 text-center" role="alert">출석 정보를 불러오지 못했습니다.</main>;
  if (!data) return <main className="mx-auto max-w-[1120px] px-5 py-20 text-center" role="status">출석 정보를 불러오는 중입니다…</main>;
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <Link href={`/admin/volunteer/events/${id}`} className="text-sm font-bold text-[var(--text-muted)]">← 일정 상세</Link>
      <div className="mt-5"><PageHeading eyebrow="Attendance" title="출석 관리" description={`${data.event.title} · ${formatVolunteerDateTimeRange(data.event.startAt, data.event.endAt)}`} /></div>
      <div className="mt-8">
        {data.participations.length ? <AttendanceManager eventId={id} participations={data.participations} /> : <EmptyState title="출석 처리할 참여자가 없습니다." />}
      </div>
    </div>
  );
}
