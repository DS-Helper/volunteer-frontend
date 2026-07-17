import { CalendarDays, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from '@/components/common/status-badge';
import { EventActions } from '@/features/volunteer/components/event-actions';
import {
  VOLUNTEER_EVENT_STATUS_LABEL,
  VOLUNTEER_PARTICIPATION_STATUS_LABEL,
  type VolunteerEventListItem,
} from '@/features/volunteer/types';
import { formatVolunteerDateTimeRange } from '@/lib/date';

const statusTone = {
  DRAFT: 'gray',
  OPEN: 'green',
  CLOSED: 'amber',
  COMPLETED: 'blue',
  CANCELED: 'red',
} as const;

export function EventCard({
  event,
  preload = false,
}: {
  event: VolunteerEventListItem;
  preload?: boolean;
}) {
  const ratio = Math.min(100, Math.round((event.participantCount / event.capacity) * 100));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_28px_rgb(0_0_0/4%)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_34px_rgb(0_0_0/8%)]">
      <Link href={`/volunteer/events/${event.id}`} className="relative block aspect-[16/10] overflow-hidden bg-[#eaf6ee]">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={`${event.title} 활동 모습`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            preload={preload}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm font-bold text-[var(--brand-dark)]">DS Helper 봉사단</div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <StatusBadge tone={statusTone[event.status]}>{VOLUNTEER_EVENT_STATUS_LABEL[event.status]}</StatusBadge>
          {event.myParticipationStatus ? (
            <StatusBadge tone="blue">내 상태 · {VOLUNTEER_PARTICIPATION_STATUS_LABEL[event.myParticipationStatus]}</StatusBadge>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--brand-dark)] uppercase">{event.typeLabel}</p>
          <Link href={`/volunteer/events/${event.id}`}>
            <h2 className="mt-2 text-xl leading-7 font-extrabold tracking-[-0.02em] text-[var(--text-strong)] hover:text-[var(--brand-dark)]">{event.title}</h2>
          </Link>
          <div className="mt-5 space-y-2.5 text-sm leading-6 text-[var(--text-muted)]">
            <p className="flex items-start gap-2.5">
              <CalendarDays className="mt-1 shrink-0 text-[#979797]" size={17} aria-hidden="true" />
              {formatVolunteerDateTimeRange(event.startAt, event.endAt)}
            </p>
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-1 shrink-0 text-[#979797]" size={17} aria-hidden="true" />
              {event.location}
            </p>
            <p className="flex items-center gap-2.5">
              <Users className="shrink-0 text-[#979797]" size={17} aria-hidden="true" />
              {event.participantCount}명 참여 · 정원 {event.capacity}명
            </p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eeeeee]" aria-hidden="true">
            <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${ratio}%` }} />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <EventActions event={event} compact />
        </div>
      </div>
    </article>
  );
}
