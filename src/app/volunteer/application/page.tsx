import type { Metadata } from 'next';
import { PageHeading } from '@/components/common/page-heading';
import { VolunteerApplicationForm } from '@/features/volunteer/components/application-form';

export const metadata: Metadata = {
  title: '봉사단 가입 신청',
};

export default function VolunteerApplicationPage() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-8 sm:py-20 lg:px-0">
      <PageHeading
        eyebrow="Volunteer application"
        title="봉사단 가입 신청"
        description="함께하고 싶은 활동과 기본 정보를 알려주세요. 신청 내용은 봉사단 운영자만 확인합니다."
      />
      <div className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_35px_rgb(0_0_0/4%)] sm:p-8">
        <VolunteerApplicationForm />
      </div>
    </div>
  );
}
