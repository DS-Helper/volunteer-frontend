import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { EmptyState } from '@/components/common/empty-state';
import { AttendanceManager } from '@/features/volunteer/components/attendance-manager';
import { getAdminVolunteerEventParticipations } from '@/features/volunteer/api';
import { formatVolunteerDateTimeRange } from '@/lib/date';
import { isApiError } from '@/lib/errors';

export const metadata: Metadata = { title: '관리자 · 출석 관리' };

export default async function AdminVolunteerAttendancePage({ params }: PageProps<'/admin/volunteer/events/[eventId]/attendance'>) {
  const { eventId } = await params;
  const id = eventId;
  let data;
  try { data = await getAdminVolunteerEventParticipations(id); } catch (error) { if (isApiError(error) && error.code === 'NOT_FOUND') notFound(); throw error; }
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
