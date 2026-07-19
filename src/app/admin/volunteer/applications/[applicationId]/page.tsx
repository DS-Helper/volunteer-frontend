'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Camera, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { AdminApplicationActions } from '@/features/volunteer/components/admin-application-actions';
import { getAdminVolunteerApplication } from '@/features/volunteer/api';
import {
  VOLUNTEER_APPLICATION_STATUS_LABEL,
  VOLUNTEER_GENDER_LABEL,
} from '@/features/volunteer/types';
import { formatVolunteerDateTime } from '@/lib/date';

export default function AdminVolunteerApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const id = applicationId;
  const [application, setApplication] = useState<Awaited<ReturnType<typeof getAdminVolunteerApplication>> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { void getAdminVolunteerApplication(id).then(setApplication).catch(() => setError(true)); }, [id]);
  if (error) return <main className="mx-auto max-w-[1100px] px-5 py-20 text-center" role="alert">신청 정보를 불러오지 못했습니다.</main>;
  if (!application) return <main className="mx-auto max-w-[1100px] px-5 py-20 text-center" role="status">신청 정보를 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin/volunteer/applications" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand-dark)]">← 신청 목록</Link>
      <div className="mt-5">
        <PageHeading
          eyebrow="Application detail"
          title={`${application.name}님의 가입 신청`}
          description={`신청일 ${formatVolunteerDateTime(application.createdAt)}`}
          actions={<StatusBadge tone={application.status === 'PENDING' ? 'amber' : application.status === 'APPROVED' ? 'green' : application.status === 'REJECTED' ? 'red' : 'gray'}>{VOLUNTEER_APPLICATION_STATUS_LABEL[application.status]}</StatusBadge>}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="grid aspect-[4/5] place-items-center rounded-xl bg-[var(--surface)] text-center text-[var(--text-muted)]">
            <div>
              <Camera className="mx-auto text-[var(--brand)]" size={36} strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-3 text-sm font-extrabold">보호된 본인 사진</p>
              <p className="mt-1 text-xs">관리자 인증 API로만 조회</p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--text-muted)]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[var(--brand)]" size={16} aria-hidden="true" />
            원본 경로는 화면과 사용자 API에 포함하지 않습니다.
          </p>
        </aside>
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">신청자 정보</h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info label="이름" value={application.name} />
              <Info label="연락처" value={application.phone} />
              <Info label="생년월일" value={application.birthDate} />
              <Info label="성별" value={VOLUNTEER_GENDER_LABEL[application.gender]} />
              <Info label="거주 동네" value={application.neighborhood} />
              <Info label="처리일" value={application.reviewedAt ? formatVolunteerDateTime(application.reviewedAt) : '미처리'} />
            </dl>
            <div className="mt-7 border-t border-[var(--line)] pt-6">
              <p className="text-xs font-bold text-[#929292]">희망 활동</p>
              <div className="mt-2 flex flex-wrap gap-2">{application.preferredActivities.map((activity) => <span key={activity} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-dark)]">{activity}</span>)}</div>
            </div>
            <div className="mt-7 border-t border-[var(--line)] pt-6">
              <p className="text-xs font-bold text-[#929292]">지원동기</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text)]">{application.motivation}</p>
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[var(--text-strong)]">관리자 처리</h2>
            {application.adminMemo ? (
              <div className="mt-5 rounded-xl bg-[#fff9e8] p-4">
                <p className="text-xs font-extrabold text-[#9a5b00]">관리자 내부 메모 · 사용자 비공개</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text)]">{application.adminMemo}</p>
              </div>
            ) : null}
            {application.rejectionReason ? (
              <div className="mt-4 rounded-xl bg-[#fff2f2] p-4">
                <p className="text-xs font-extrabold text-[var(--danger)]">사용자 공개 반려 사유</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text)]">{application.rejectionReason}</p>
              </div>
            ) : null}
            <div className="mt-6"><AdminApplicationActions application={application} /></div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold text-[#929292]">{label}</dt><dd className="mt-1.5 text-sm font-semibold text-[var(--text)]">{value}</dd></div>;
}
