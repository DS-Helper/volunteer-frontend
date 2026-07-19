'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { ApplicationStatusActions } from '@/features/volunteer/components/application-status-actions';
import { getMyLatestVolunteerApplication } from '@/features/volunteer/api';
import {
  VOLUNTEER_APPLICATION_STATUS_LABEL,
  VOLUNTEER_GENDER_LABEL,
} from '@/features/volunteer/types';
import { formatVolunteerDateTime } from '@/lib/date';

const statusContent = {
  PENDING: {
    icon: Clock3,
    title: '가입 승인을 기다리고 있어요',
    description: '운영자가 신청 내용을 확인하고 있습니다. 처리 결과는 알림으로 안내해 드립니다.',
    tone: 'amber' as const,
  },
  APPROVED: {
    icon: CheckCircle2,
    title: 'DS Helper 봉사단원이 되셨어요',
    description: '가입이 승인되었습니다. 모집 중인 일정에서 첫 활동을 시작해 보세요.',
    tone: 'green' as const,
  },
  REJECTED: {
    icon: XCircle,
    title: '가입 신청이 반려되었습니다',
    description: '공개된 반려 사유를 확인한 뒤 조건이 맞을 때 다시 신청할 수 있습니다.',
    tone: 'red' as const,
  },
  CANCELED: {
    icon: RotateCcw,
    title: '가입 신청이 취소되었습니다',
    description: '함께할 준비가 되면 언제든지 새로운 신청서를 작성해 주세요.',
    tone: 'gray' as const,
  },
};

export default function VolunteerApplicationStatusPage() {
  const [application, setApplication] = useState<Awaited<ReturnType<typeof getMyLatestVolunteerApplication>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void getMyLatestVolunteerApplication(controller.signal)
      .then((result) => {
        if (active) setApplication(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-8 sm:py-20 lg:px-0">
      <PageHeading
        eyebrow="Application status"
        title="가입 신청 현황"
        description="서버에서 확인한 최신 신청 상태와 가능한 다음 행동을 안내합니다."
      />
      {loading ? (
        <div className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-8 text-center text-sm text-[var(--text-muted)]" role="status">
          신청 현황을 불러오는 중입니다…
        </div>
      ) : !application ? (
        <div className="mt-10">
          <EmptyState
            title="아직 가입 신청 내역이 없습니다."
            description="DS Helper 봉사단의 활동 분야와 가입 조건을 확인하고 신청해 보세요."
            action={
              <Link href="/volunteer/application" className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white">
                가입 신청하기
              </Link>
            }
          />
        </div>
      ) : (
        <StatusContent application={application} />
      )}
    </div>
  );
}

function StatusContent({
  application,
}: {
  application: NonNullable<Awaited<ReturnType<typeof getMyLatestVolunteerApplication>>>;
}) {
  const content = statusContent[application.status];
  const Icon = content.icon;
  return (
    <div className="mt-10 space-y-6">
      <section className="rounded-[24px] bg-[var(--surface)] p-6 sm:p-9">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white text-[var(--brand)] shadow-sm">
            <Icon size={31} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <StatusBadge tone={content.tone}>{VOLUNTEER_APPLICATION_STATUS_LABEL[application.status]}</StatusBadge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-strong)] sm:text-3xl">{content.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)] sm:text-base">{content.description}</p>
          </div>
        </div>
        {application.status === 'REJECTED' && application.rejectionReason ? (
          <div className="mt-7 rounded-xl border border-[#efc5c5] bg-white p-5">
            <p className="text-xs font-extrabold text-[var(--danger)]">공개 반려 사유</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text)]">{application.rejectionReason}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-[var(--text-strong)]">신청 정보</h2>
        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Info label="이름" value={application.name} />
          <Info label="연락처" value={application.phone} />
          <Info label="생년월일" value={application.birthDate} />
          <Info label="성별" value={VOLUNTEER_GENDER_LABEL[application.gender]} />
          <Info label="거주 동네" value={application.neighborhood} />
          <Info label="신청일" value={formatVolunteerDateTime(application.createdAt)} />
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold text-[#929292]">희망 활동</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {application.preferredActivities.map((activity) => (
                <span key={activity} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-dark)]">{activity}</span>
              ))}
            </dd>
          </div>
        </dl>
        <div className="mt-8 border-t border-[var(--line)] pt-7">
          <ApplicationStatusActions application={application} />
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-[#929292]">{label}</dt>
      <dd className="mt-1.5 text-sm font-semibold text-[var(--text)]">{value}</dd>
    </div>
  );
}
