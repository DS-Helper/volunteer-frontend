import type { Metadata } from 'next';
import { CalendarDays, Clock3, MapPin, PackageCheck, ShieldAlert, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/common/status-badge';
import { EventActions } from '@/features/volunteer/components/event-actions';
import { getVolunteerEvent } from '@/features/volunteer/api';
import {
  VOLUNTEER_EVENT_STATUS_LABEL,
  VOLUNTEER_PARTICIPATION_STATUS_LABEL,
} from '@/features/volunteer/types';
import {
  formatVolunteerDateTime,
  formatVolunteerDateTimeRange,
} from '@/lib/date';
import { isApiError } from '@/lib/errors';

const statusTone = {
  DRAFT: 'gray',
  OPEN: 'green',
  CLOSED: 'amber',
  COMPLETED: 'blue',
  CANCELED: 'red',
} as const;

export async function generateMetadata({
  params,
}: PageProps<'/volunteer/events/[eventId]'>): Promise<Metadata> {
  const { eventId } = await params;
  try {
    const event = await getVolunteerEvent(eventId);
    return { title: event.title, description: event.description };
  } catch {
    return { title: '봉사 일정 상세' };
  }
}

export default async function VolunteerEventDetailPage({
  params,
}: PageProps<'/volunteer/events/[eventId]'>) {
  const { eventId } = await params;
  if (!eventId.trim()) notFound();

  let event;
  try {
    event = await getVolunteerEvent(eventId);
  } catch (error) {
    if (isApiError(error) && error.code === 'NOT_FOUND') notFound();
    throw error;
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 sm:py-16 lg:px-0">
      <Link href="/volunteer/events" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand-dark)]">
        ← 일정 목록
      </Link>
      <div className="mt-6 overflow-hidden rounded-[28px] bg-[var(--surface)]">
        <div className="relative aspect-[16/8] min-h-[280px] w-full sm:aspect-[16/7]">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={`${event.title} 활동 이미지`}
              fill
              sizes="(max-width: 1180px) 100vw, 1180px"
              className="object-cover"
              preload
            />
          ) : (
            <div className="grid size-full place-items-center text-xl font-extrabold text-[var(--brand-dark)]">DS Helper 봉사단</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={statusTone[event.status]}>{VOLUNTEER_EVENT_STATUS_LABEL[event.status]}</StatusBadge>
              {event.myParticipationStatus ? (
                <StatusBadge tone="blue">내 상태 · {VOLUNTEER_PARTICIPATION_STATUS_LABEL[event.myParticipationStatus]}</StatusBadge>
              ) : null}
            </div>
            <p className="mt-5 text-sm font-bold text-white/80">{event.typeLabel}</p>
            <h1 className="mt-2 max-w-4xl text-[clamp(2rem,5vw,3.7rem)] leading-tight font-extrabold tracking-[-0.04em]">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-10">
          <section aria-labelledby="event-overview-heading">
            <h2 id="event-overview-heading" className="text-2xl font-extrabold text-[var(--text-strong)]">활동 안내</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[var(--text-muted)]">{event.description}</p>
          </section>
          <section className="grid gap-4 border-y border-[var(--line)] py-8 sm:grid-cols-2" aria-label="일정 정보">
            <InfoRow icon={CalendarDays} label="활동 일시" value={formatVolunteerDateTimeRange(event.startAt, event.endAt)} />
            <InfoRow icon={MapPin} label="모임 장소" value={event.location} />
            <InfoRow icon={Clock3} label="모집 마감" value={formatVolunteerDateTime(event.recruitmentDeadlineAt)} />
            <InfoRow icon={Users} label="모집 인원" value={`${event.participantCount}명 참여 / 정원 ${event.capacity}명`} />
          </section>
          <div className="grid gap-8 sm:grid-cols-2">
            <DetailList icon={PackageCheck} title="준비물" items={event.supplies} empty="별도 준비물이 없습니다." />
            <DetailList icon={ShieldAlert} title="유의사항" items={event.precautions} empty="별도 유의사항이 없습니다." />
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_38px_rgb(0_0_0/6%)] lg:sticky lg:top-28">
          <p className="text-sm font-bold text-[var(--text-muted)]">현재 참여 인원</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-4xl font-black tracking-[-0.04em] text-[var(--text-strong)]">
              {event.participantCount}
              <span className="ml-1 text-base font-bold text-[var(--text-muted)]">/ {event.capacity}명</span>
            </p>
            <StatusBadge tone={statusTone[event.status]}>{VOLUNTEER_EVENT_STATUS_LABEL[event.status]}</StatusBadge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eeeeee]">
            <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.min(100, (event.participantCount / event.capacity) * 100)}%` }} />
          </div>
          <div className="mt-6">
            <EventActions event={event} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[var(--surface)] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[var(--brand)]">
        <Icon size={19} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-bold text-[#929292]">{label}</p>
        <p className="mt-1 text-sm leading-6 font-semibold text-[var(--text)]">{value}</p>
      </div>
    </div>
  );
}

function DetailList({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: typeof PackageCheck;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-[var(--text-strong)]">
        <Icon size={21} className="text-[var(--brand)]" aria-hidden="true" />
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--text-muted)]">
          {items.map((item) => (
            <li key={item} className="flex gap-2 before:mt-2.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-[var(--brand)]">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--text-muted)]">{empty}</p>
      )}
    </section>
  );
}
