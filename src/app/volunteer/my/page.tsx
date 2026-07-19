'use client';

import { useEffect, useState } from 'react';
import { PageHeading } from '@/components/common/page-heading';
import { MyActivityTabs } from '@/features/volunteer/components/my-activity-tabs';
import {
  getMyCompletedVolunteerEvents,
  getMyUpcomingVolunteerEvents,
  getMyVolunteerSummary,
} from '@/features/volunteer/api';

export default function MyVolunteerActivityPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadActivity>> | null>(null);
  useEffect(() => { void loadActivity().then(setData); }, []);

  if (!data) return <main className="mx-auto max-w-[1000px] px-5 py-20 text-center" role="status">내 봉사활동을 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-14 sm:px-8 sm:py-20 lg:px-0">
      <PageHeading
        eyebrow="My volunteering"
        title="내 봉사활동"
        description="참여 예정 일정과 출석이 인정된 활동 기록을 확인할 수 있습니다. 누적 통계는 서버에서 계산한 값을 표시합니다."
      />
      <MyActivityTabs upcoming={data.upcoming} completed={data.completed} summary={data.summary} />
    </div>
  );
}

async function loadActivity() {
  const [upcoming, completed, summary] = await Promise.all([
    getMyUpcomingVolunteerEvents(), getMyCompletedVolunteerEvents(), getMyVolunteerSummary(),
  ]);
  return { upcoming, completed, summary };
}
