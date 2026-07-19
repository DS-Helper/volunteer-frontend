'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeading } from '@/components/common/page-heading';
import { StatusBadge } from '@/components/common/status-badge';
import { getAdminVolunteerMembers } from '@/features/volunteer/api';
import {
  VOLUNTEER_GENDER_LABEL,
  VOLUNTEER_MEMBER_STATUS_LABEL,
  type VolunteerGender,
  type VolunteerMemberStatus,
} from '@/features/volunteer/types';
import { formatVolunteerDate } from '@/lib/date';

export default function AdminVolunteerMembersPage() {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getAdminVolunteerMembers>> | null>(null);
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const keywordValue = params.get('keyword');
  const statusValue = params.get('status');
  const genderValue = params.get('gender');
  const keyword = keywordValue || undefined;
  const status = statusValue && statusValue in VOLUNTEER_MEMBER_STATUS_LABEL
    ? (statusValue as VolunteerMemberStatus)
    : undefined;
  const gender = genderValue && genderValue in VOLUNTEER_GENDER_LABEL
    ? (genderValue as VolunteerGender)
    : undefined;
  useEffect(() => { void getAdminVolunteerMembers({ keyword, status, gender, page: 0, size: 20 }).then(setResult); }, [keyword, status, gender]);
  if (!result) return <main className="mx-auto max-w-[1240px] px-5 py-20 text-center" role="status">단원 목록을 불러오는 중입니다…</main>;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14">
      <PageHeading eyebrow="Admin · Members" title="봉사단원 관리" description="단원의 활동 상태와 서버에서 계산한 누적 참여 통계를 확인합니다." />
      <form method="get" className="mt-8 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_180px_160px_auto]">
        <label><span className="sr-only">이름 또는 연락처 검색</span><input name="keyword" defaultValue={keyword} className="field-input" placeholder="이름 또는 연락처" /></label>
        <label><span className="sr-only">활동 상태</span><select name="status" defaultValue={status ?? ''} className="field-input"><option value="">전체 상태</option>{Object.entries(VOLUNTEER_MEMBER_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">성별</span><select name="gender" defaultValue={gender ?? ''} className="field-input"><option value="">전체 성별</option>{Object.entries(VOLUNTEER_GENDER_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="submit" className="min-h-12 rounded-xl bg-[#162019] px-5 text-sm font-extrabold text-white">검색</button>
      </form>
      {result.content.length ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--surface)] text-xs text-[var(--text-muted)]"><tr><th className="px-5 py-4">이름</th><th className="px-5 py-4">성별</th><th className="px-5 py-4">연락처</th><th className="px-5 py-4">가입일</th><th className="px-5 py-4">활동 상태</th><th className="px-5 py-4">누적 참여</th><th className="px-5 py-4"><span className="sr-only">상세</span></th></tr></thead>
            <tbody className="divide-y divide-[var(--line)]">
              {result.content.map((member) => (
                <tr key={member.id} className="hover:bg-[#fbfcfb]">
                  <td className="px-5 py-4 font-extrabold text-[var(--text-strong)]">{member.name}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{VOLUNTEER_GENDER_LABEL[member.gender]}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{member.phone}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{formatVolunteerDate(member.joinedAt)}</td>
                  <td className="px-5 py-4"><StatusBadge tone={member.status === 'ACTIVE' ? 'green' : member.status === 'SUSPENDED' ? 'amber' : 'gray'}>{VOLUNTEER_MEMBER_STATUS_LABEL[member.status]}</StatusBadge></td>
                  <td className="px-5 py-4 font-semibold text-[var(--text)]">{member.totalParticipationCount}회 · {member.totalHours}시간</td>
                  <td className="px-5 py-4 text-right"><Link href={`/admin/volunteer/members/${member.id}`} className="font-extrabold text-[var(--brand-dark)]">상세보기</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6"><EmptyState title="조건에 맞는 봉사단원이 없습니다." /></div>
      )}
    </div>
  );
}
