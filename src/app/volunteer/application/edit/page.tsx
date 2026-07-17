import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { VolunteerApplicationForm } from '@/features/volunteer/components/application-form';
import { getMyLatestVolunteerApplication } from '@/features/volunteer/api';

export const metadata: Metadata = {
  title: '가입 신청 수정',
};

export default async function VolunteerApplicationEditPage() {
  const application = await getMyLatestVolunteerApplication();
  if (!application || !application.capabilities.canEdit) notFound();

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-8 sm:py-20 lg:px-0">
      <PageHeading
        eyebrow="Edit application"
        title="가입 신청 수정"
        description="승인 전까지 신청 내용을 수정할 수 있습니다. 새 사진을 선택하지 않으면 기존 사진이 유지됩니다."
      />
      <div className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_35px_rgb(0_0_0/4%)] sm:p-8">
        <VolunteerApplicationForm
          mode="edit"
          applicationId={String(application.id)}
          initialValues={{
            name: application.name,
            phone: application.phone,
            birthDate: application.birthDate,
            gender: application.gender,
            neighborhood: application.neighborhood,
            preferredActivities: application.preferredActivities,
            motivation: application.motivation,
          }}
        />
      </div>
    </div>
  );
}
