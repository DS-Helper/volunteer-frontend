import type { Metadata } from 'next';
import { PageHeading } from '@/components/common/page-heading';
import { AdminEventForm } from '@/features/volunteer/components/admin-event-form';

export const metadata: Metadata = { title: '관리자 · 일정 등록' };

export default function NewAdminVolunteerEventPage() {
  return (
    <div className="mx-auto w-full max-w-[960px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeading eyebrow="New event" title="봉사 일정 등록" description="모집에 필요한 정보를 입력해 주세요. 저장 전 클라이언트 검증 후 서버가 동일한 규칙을 다시 확인합니다." />
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8"><AdminEventForm /></div>
    </div>
  );
}
