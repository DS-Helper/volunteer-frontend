'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { getAdminVolunteerApplications } from '@/features/volunteer/api';
import {
  VOLUNTEER_APPLICATION_STATUS_LABEL,
  type VolunteerApplicationStatus,
} from '@/features/volunteer/types';
import { formatVolunteerDateTime } from '@/lib/date';
import { ApiErrorState } from '@/components/common/api-error-state';

const statusTone = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELED: 'gray',
} as const;

export default function AdminVolunteerApplicationsPage() {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getAdminVolunteerApplications>> | null>(null);
  const [error, setError] = useState<unknown>(null);
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const nameValue = params.get('name');
  const phoneValue = params.get('phone');
  const statusValue = params.get('status');
  const name = nameValue || undefined;
  const phone = phoneValue || undefined;
  const status = statusValue && statusValue in VOLUNTEER_APPLICATION_STATUS_LABEL
    ? (statusValue as VolunteerApplicationStatus)
    : undefined;
  const pageValue = params.get('page');
  const page = pageValue && Number(pageValue) >= 0 ? Number(pageValue) : 0;
  useEffect(() => { void getAdminVolunteerApplications({ name, phone, status, page, size: 20 }).then(setResult).catch(setError); }, [name, phone, status, page]);
  if (error) return <main className="mx-auto max-w-[1240px] px-5 py-20"><ApiErrorState error={error} onRetry={() => window.location.reload()} /></main>;
  if (!result) return <main className="mx-auto max-w-[1240px] px-5 py-20 text-center" role="status">신청 목록을 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeading eyebrow="Admin · Applications" title="가입 신청 관리" description="신청자를 검색하고 가입 승인·반려 가능 상태를 확인합니다." />
      <form className="mt-8 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_1fr_180px_auto]" method="get">
        <label>
          <span className="sr-only">이름 검색</span>
          <input name="name" defaultValue={name} className="field-input" placeholder="이름 검색" />
        </label>
        <label>
          <span className="sr-only">연락처 검색</span>
          <input name="phone" defaultValue={phone} className="field-input" placeholder="연락처 검색" />
        </label>
        <label>
          <span className="sr-only">신청 상태</span>
          <select name="status" defaultValue={status ?? ''} className="field-input">
            <option value="">전체 상태</option>
            {Object.entries(VOLUNTEER_APPLICATION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit" className="min-h-12 rounded-xl bg-[#162019] px-5 text-sm font-extrabold text-white hover:bg-[var(--brand-dark)]">검색</button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">총 <strong className="text-[var(--text)]">{result.totalElements}</strong>건</p>
        <Link href="/admin/volunteer/applications" className="text-sm font-bold text-[var(--brand-dark)]">필터 초기화</Link>
      </div>

      {result.content.length ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-[var(--surface)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-4 font-extrabold">신청자</th>
                <th className="px-5 py-4 font-extrabold">연락처</th>
                <th className="px-5 py-4 font-extrabold">거주 동네</th>
                <th className="px-5 py-4 font-extrabold">상태</th>
                <th className="px-5 py-4 font-extrabold">신청일</th>
                <th className="px-5 py-4 font-extrabold"><span className="sr-only">상세</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {result.content.map((application) => (
                <tr key={application.id} className="hover:bg-[#fbfcfb]">
                  <td className="px-5 py-4 font-extrabold text-[var(--text-strong)]">{application.name}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{application.phone}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{application.neighborhood}</td>
                  <td className="px-5 py-4"><StatusBadge tone={statusTone[application.status]}>{VOLUNTEER_APPLICATION_STATUS_LABEL[application.status]}</StatusBadge></td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{formatVolunteerDateTime(application.createdAt)}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/admin/volunteer/applications/${application.id}`} className="font-extrabold text-[var(--brand-dark)] hover:underline">상세보기</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6"><EmptyState title="승인 대기 신청자가 없습니다." description="검색 조건을 변경해 다시 확인해 주세요." /></div>
      )}
      {result.totalPages > 1 ? <nav className="mt-6 flex items-center justify-center gap-2" aria-label="신청 목록 페이지">
        {Array.from({ length: result.totalPages }, (_, index) => {
          const query = new URLSearchParams(); if (name) query.set('name', name); if (phone) query.set('phone', phone); if (status) query.set('status', status); query.set('page', String(index));
          return <Link key={index} href={`/admin/volunteer/applications?${query.toString()}`} aria-current={index === page ? 'page' : undefined} className={`grid size-9 place-items-center rounded-lg text-sm font-bold ${index === page ? 'bg-[var(--brand)] text-white' : 'border border-[var(--line)]'}`}>{index + 1}</Link>
        })}
      </nav> : null}
    </div>
  );
}
