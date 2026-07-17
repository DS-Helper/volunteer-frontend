'use client';

import { Award, CalendarClock, Clock3, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { EventActions } from '@/features/volunteer/components/event-actions';
import type {
  MyCompletedVolunteerEvent,
  MyUpcomingVolunteerEvent,
  MyVolunteerSummary,
} from '@/features/volunteer/types';
import {
  formatVolunteerDateTimeRange,
  formatVolunteerHours,
} from '@/lib/date';

export function MyActivityTabs({
  upcoming,
  completed,
  summary,
}: {
  upcoming: MyUpcomingVolunteerEvent[];
  completed: MyCompletedVolunteerEvent[];
  summary: MyVolunteerSummary;
}) {
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="봉사활동 요약">
        <SummaryCard
          icon={Award}
          label="누적 참여 횟수"
          value={`${summary.totalParticipationCount}회`}
          description="서버에서 출석 완료로 확인한 활동"
        />
        <SummaryCard
          icon={Clock3}
          label="총 참여 시간"
          value={formatVolunteerHours(summary.totalHours)}
          description="인정된 활동 시간의 누적 합계"
        />
      </section>

      <div className="mt-12 flex gap-2 border-b border-[var(--line)]" role="tablist" aria-label="봉사활동 구분">
        <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')} controls="upcoming-panel">
          참여 예정 <span className="ml-1 text-xs opacity-70">{upcoming.length}</span>
        </TabButton>
        <TabButton active={tab === 'completed'} onClick={() => setTab('completed')} controls="completed-panel">
          참여 완료 <span className="ml-1 text-xs opacity-70">{completed.length}</span>
        </TabButton>
      </div>

      <div id="upcoming-panel" role="tabpanel" hidden={tab !== 'upcoming'} className="mt-7">
        {upcoming.length ? (
          <div className="space-y-4">
            {upcoming.map((event) => (
              <ActivityRow key={event.participationId} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="참여 예정인 봉사가 없습니다."
            description="모집 중인 봉사 일정에서 새로운 활동을 찾아보세요."
            action={
              <Link href="/volunteer/events?status=OPEN&page=0" className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white">
                일정 보러가기
              </Link>
            }
          />
        )}
      </div>

      <div id="completed-panel" role="tabpanel" hidden={tab !== 'completed'} className="mt-7">
        {completed.length ? (
          <div className="space-y-4">
            {completed.map((event) => (
              <ActivityRow key={event.participationId} event={event} completed />
            ))}
          </div>
        ) : (
          <EmptyState title="아직 완료한 봉사가 없습니다." description="참여한 일정의 출석 처리가 완료되면 여기에 기록됩니다." />
        )}
      </div>
    </>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="flex items-center gap-5 rounded-2xl bg-[var(--surface)] p-6 sm:p-7">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-[var(--brand)] shadow-sm">
        <Icon size={25} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold text-[var(--text-muted)]">{label}</p>
        <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-[var(--text-strong)]">{value}</p>
        <p className="mt-1 text-xs text-[#929292]">{description}</p>
      </div>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  controls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`border-b-2 px-5 py-4 text-sm font-extrabold ${active ? 'border-[var(--brand)] text-[var(--brand-dark)]' : 'border-transparent text-[#999]'}`}
    >
      {children}
    </button>
  );
}

function ActivityRow({
  event,
  completed = false,
}: {
  event: MyUpcomingVolunteerEvent | MyCompletedVolunteerEvent;
  completed?: boolean;
}) {
  return (
    <article className="grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-4 sm:grid-cols-[180px_1fr] sm:p-5 lg:grid-cols-[200px_1fr_auto] lg:items-center">
      <Link href={`/volunteer/events/${event.id}`} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--surface)]">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt="" fill sizes="200px" className="object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-sm font-bold text-[var(--brand-dark)]">DS Helper</span>
        )}
      </Link>
      <div>
        <p className="text-xs font-extrabold text-[var(--brand-dark)]">{event.typeLabel}</p>
        <Link href={`/volunteer/events/${event.id}`} className="mt-1 block text-xl font-extrabold text-[var(--text-strong)] hover:text-[var(--brand-dark)]">
          {event.title}
        </Link>
        <div className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
          <p className="flex items-start gap-2"><CalendarClock className="mt-0.5 shrink-0" size={16} aria-hidden="true" />{formatVolunteerDateTimeRange(event.startAt, event.endAt)}</p>
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" size={16} aria-hidden="true" />{event.location}</p>
        </div>
        {completed && 'recognizedHours' in event ? (
          <p className="mt-4 inline-flex rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-extrabold text-[var(--brand-dark)]">
            인정 시간 {formatVolunteerHours(event.recognizedHours)}
          </p>
        ) : null}
      </div>
      {!completed ? (
        <div className="lg:w-52">
          <EventActions event={event} compact />
        </div>
      ) : null}
    </article>
  );
}
