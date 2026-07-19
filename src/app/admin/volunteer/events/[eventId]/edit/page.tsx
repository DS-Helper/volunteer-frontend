'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeading } from '@/components/common/page-heading';
import { AdminEventForm } from '@/features/volunteer/components/admin-event-form';
import { getAdminVolunteerEvent } from '@/features/volunteer/api';
import { toSeoulDateTimeLocalValue } from '@/lib/date';

export default function EditAdminVolunteerEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const id = eventId;
  const [event, setEvent] = useState<Awaited<ReturnType<typeof getAdminVolunteerEvent>> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { const controller = new AbortController(); void getAdminVolunteerEvent(id, controller.signal).then(setEvent).catch(() => setError(true)); return () => controller.abort(); }, [id]);
  if (error) return <main className="mx-auto max-w-[960px] px-5 py-20 text-center" role="alert">일정 정보를 불러오지 못했습니다.</main>;
  if (!event) return <main className="mx-auto max-w-[960px] px-5 py-20 text-center" role="status">일정 정보를 불러오는 중입니다…</main>;
  if (!event.capabilities.canEdit) return <main className="mx-auto max-w-[960px] px-5 py-20 text-center">수정할 수 없는 일정입니다.</main>;
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
