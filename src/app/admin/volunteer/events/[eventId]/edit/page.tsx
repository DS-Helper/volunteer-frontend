import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { AdminEventForm } from '@/features/volunteer/components/admin-event-form';
import { getAdminVolunteerEvent } from '@/features/volunteer/api';
import { toSeoulDateTimeLocalValue } from '@/lib/date';
import { isApiError } from '@/lib/errors';

export const metadata: Metadata = { title: '관리자 · 일정 수정' };

export default async function EditAdminVolunteerEventPage({ params }: PageProps<'/admin/volunteer/events/[eventId]/edit'>) {
  const { eventId } = await params;
  const id = eventId;
  let event;
  try { event = await getAdminVolunteerEvent(id); } catch (error) { if (isApiError(error) && error.code === 'NOT_FOUND') notFound(); throw error; }
  if (!event.capabilities.canEdit) notFound();
  return (
    <div className="mx-auto w-full max-w-[960px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeading eyebrow="Edit event" title="봉사 일정 수정" description={event.title} />
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
        <AdminEventForm
          mode="edit"
          eventId={event.id}
          currentParticipantCount={event.participantCount}
          currentImageFileId={event.imageFileId}
          initialValues={{
            title: event.title,
            activityType: event.type,
            startAt: toSeoulDateTimeLocalValue(event.startAt),
            endAt: toSeoulDateTimeLocalValue(event.endAt),
            recruitmentDeadlineAt: toSeoulDateTimeLocalValue(event.recruitmentDeadlineAt),
            location: event.location,
            capacity: event.capacity,
            description: event.description,
            supplies: event.supplies.join('\n'),
            precautions: event.precautions.join('\n'),
            status: event.status === 'DRAFT' ? 'DRAFT' : 'OPEN',
            visibility: event.visibility,
          }}
        />
      </div>
    </div>
  );
}
