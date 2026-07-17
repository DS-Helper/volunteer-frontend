import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeading } from '@/components/common/page-heading';
import { EventCard } from '@/features/volunteer/components/event-card';
import { getVolunteerEvents } from '@/features/volunteer/api';
import type { VolunteerEventStatus } from '@/features/volunteer/types';

export const metadata: Metadata = {
  title: '봉사 일정',
  description: 'DS Helper 봉사단의 모집 중인 일정과 내 참여 상태를 확인하세요.',
};

const filters: Array<{ label: string; value?: VolunteerEventStatus }> = [
  { label: '전체' },
  { label: '모집중', value: 'OPEN' },
  { label: '모집마감', value: 'CLOSED' },
  { label: '완료', value: 'COMPLETED' },
];

export default async function VolunteerEventsPage({
  searchParams,
}: PageProps<'/volunteer/events'>) {
  const params = await searchParams;
  const statusValue = typeof params.status === 'string' ? params.status : undefined;
  const status = filters.some((item) => item.value === statusValue)
    ? (statusValue as VolunteerEventStatus)
    : undefined;
  const pageValue = typeof params.page === 'string' ? Number(params.page) : 0;
  const page = Number.isInteger(pageValue) && pageValue >= 0 ? pageValue : 0;
  const result = await getVolunteerEvents({ status, page, size: 6 });

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20 lg:px-0">
      <PageHeading
        eyebrow="Volunteer events"
        title="봉사 일정"
        description="내 시간과 관심 분야에 맞는 활동을 찾아보세요. 참여 가능 여부는 서버가 전달한 최신 상태를 기준으로 표시합니다."
      />

      <div className="scrollbar-none mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="일정 상태 필터">
        {filters.map((filter) => {
          const active = filter.value === status || (!filter.value && !status);
          const href = filter.value
            ? `/volunteer/events?status=${filter.value}&page=0`
            : '/volunteer/events?page=0';
          return (
            <Link
              key={filter.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-extrabold transition-colors ${active ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[#d5d5d5] bg-white text-[#8a8a8a] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]'}`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          총 <strong className="font-extrabold text-[var(--text)]">{result.totalElements}</strong>개의 일정
        </p>
      </div>

      {result.content.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.content.map((event, index) => (
            <EventCard key={event.id} event={event} preload={index === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="등록된 봉사 일정이 없습니다."
            description="다른 상태 필터를 선택하거나 잠시 후 다시 확인해 주세요."
          />
        </div>
      )}

      {result.totalPages > 1 ? (
        <nav className="mt-10 flex justify-center gap-2" aria-label="일정 페이지">
          {Array.from({ length: result.totalPages }, (_, index) => (
            <Link
              key={index}
              href={`/volunteer/events?${status ? `status=${status}&` : ''}page=${index}`}
              aria-current={index === result.page ? 'page' : undefined}
              className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${index === result.page ? 'bg-[var(--brand)] text-white' : 'border border-[#d5d5d5] bg-white text-[var(--text-muted)]'}`}
            >
              {index + 1}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
