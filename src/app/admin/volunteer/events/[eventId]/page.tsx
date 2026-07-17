import { CalendarDays, Eye, MapPin, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { AdminEventActions } from '@/features/volunteer/components/admin-event-actions';
import { getAdminVolunteerEvent } from '@/features/volunteer/api';
import { VOLUNTEER_EVENT_STATUS_LABEL, VOLUNTEER_EVENT_TYPE_LABEL, VOLUNTEER_EVENT_VISIBILITY_LABEL } from '@/features/volunteer/types';
import { formatVolunteerDateTime, formatVolunteerDateTimeRange } from '@/lib/date';
import { isApiError } from '@/lib/errors';

export const metadata: Metadata = { title: '관리자 · 일정 상세' };

export default async function AdminVolunteerEventDetailPage({ params }: PageProps<'/admin/volunteer/events/[eventId]'>) {
  const { eventId } = await params;
  const id = eventId;
  let event;
  try { event = await getAdminVolunteerEvent(id); } catch (error) { if (isApiError(error) && error.code === 'NOT_FOUND') notFound(); throw error; }
  const statusTone = event.status === 'OPEN' ? 'green' : event.status === 'CLOSED' ? 'amber' : event.status === 'COMPLETED' ? 'blue' : event.status === 'CANCELED' ? 'red' : 'gray';

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin/volunteer/events" className="text-sm font-bold text-[var(--text-muted)]">← 일정 목록</Link>
      <div className="mt-5"><PageHeading eyebrow="Event detail" title={event.title} description={VOLUNTEER_EVENT_TYPE_LABEL[event.type] ?? event.type} actions={<div className="flex gap-2"><StatusBadge tone={statusTone}>{VOLUNTEER_EVENT_STATUS_LABEL[event.status]}</StatusBadge><StatusBadge tone={event.visibility === 'PUBLIC' ? 'green' : 'gray'}>{VOLUNTEER_EVENT_VISIBILITY_LABEL[event.visibility]}</StatusBadge></div>} /></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-[var(--surface)]">{event.imageUrl ? <Image src={event.imageUrl} alt={`${event.title} 이미지`} fill sizes="800px" className="object-cover" /> : <span className="grid size-full place-items-center font-extrabold text-[var(--brand-dark)]">DS Helper</span>}</div>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">일정 정보</h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info icon={CalendarDays} label="활동 일시" value={formatVolunteerDateTimeRange(event.startAt, event.endAt)} />
              <Info icon={MapPin} label="장소" value={event.location} />
              <Info icon={Users} label="참여 인원" value={`${event.participantCount} / ${event.capacity}명`} />
              <Info icon={Eye} label="모집 마감" value={formatVolunteerDateTime(event.recruitmentDeadlineAt)} />
            </dl>
            <div className="mt-7 border-t border-[var(--line)] pt-6"><p className="text-xs font-bold text-[#929292]">활동 내용</p><p className="mt-2 text-sm leading-7 text-[var(--text)]">{event.description}</p></div>
            <div className="mt-7 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-2"><StringList title="준비물" items={event.supplies} /><StringList title="유의사항" items={event.precautions} /></div>
            {event.cancelReason ? <div className="mt-7 rounded-xl bg-[#fff0f0] p-4"><p className="text-xs font-extrabold text-[var(--danger)]">일정 취소 사유</p><p className="mt-2 text-sm">{event.cancelReason}</p></div> : null}
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">일정 관리</h2>
            <div className="mt-5 flex flex-col gap-3">
              {event.capabilities.canEdit ? <Link href={`/admin/volunteer/events/${event.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d5d5d5] text-sm font-extrabold text-[var(--text)]">일정 수정</Link> : null}
              {event.capabilities.canManageAttendance ? <Link href={`/admin/volunteer/events/${event.id}/attendance`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#162019] text-sm font-extrabold text-white">출석 관리</Link> : null}
            </div>
            <div className="mt-5"><AdminEventActions event={event} /></div>
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 text-sm leading-6 text-[var(--text-muted)]">
            <p className="font-extrabold text-[var(--text)]">운영 안내</p>
            <p className="mt-2">시간·장소 변경 시 참여자 알림이 발송됩니다. 정원 축소 가능 여부는 서버가 현재 인원을 기준으로 최종 판단합니다.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-[var(--brand)]" size={19} aria-hidden="true" /><div><dt className="text-xs font-bold text-[#929292]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</dd></div></div>; }
function StringList({ title, items }: { title: string; items: string[] }) { return <div><p className="text-xs font-bold text-[#929292]">{title}</p>{items.length ? <ul className="mt-2 space-y-1 text-sm text-[var(--text)]">{items.map((item) => <li key={item}>· {item}</li>)}</ul> : <p className="mt-2 text-sm text-[var(--text-muted)]">없음</p>}</div>; }
