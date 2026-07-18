import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  HandHeart,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getVolunteerIntroduction } from '@/features/volunteer/api';

export const metadata: Metadata = {
  title: '봉사단 소개',
  description: 'DS Helper 봉사단의 활동 분야, 가입 조건, 참여 방법을 확인하세요.',
};

const activities = [
  {
    icon: HeartHandshake,
    title: '생활 돌봄 지원',
    description: '장보기, 병원 동행, 집안 정리처럼 이웃의 평범한 하루를 돕습니다.',
  },
  {
    icon: HandHeart,
    title: '정서적 돌봄',
    description: '말벗과 산책, 따뜻한 안부로 혼자가 아닌 시간을 만듭니다.',
  },
  {
    icon: Leaf,
    title: '지역 환경 활동',
    description: '플로깅과 마을 정비를 통해 우리가 사는 동네를 함께 가꿉니다.',
  },
  {
    icon: Users,
    title: '기관·단체 지원',
    description: '복지관, 마을회관과 연결해 지역에 꼭 필요한 활동을 이어갑니다.',
  },
];

const process = [
  { number: '01', title: '가입 신청', description: '기본 정보와 희망 활동을 작성해 주세요.' },
  { number: '02', title: '운영자 확인', description: '신청 내용을 확인한 뒤 결과를 알려드려요.' },
  { number: '03', title: '일정 참여', description: '열린 일정에서 원하는 봉사를 선택하세요.' },
  { number: '04', title: '활동 기록', description: '출석이 확인되면 내 활동에 자동 반영돼요.' },
];

export default async function VolunteerIntroductionPage() {
  const introduction = await getVolunteerIntroduction();
  return (
    <>
      <section className="relative isolate flex min-h-[650px] items-center justify-center overflow-hidden px-5 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-24 left-[8%] size-40 rounded-full bg-[#e7f8ed] blur-2xl" />
          <div className="absolute right-[6%] bottom-20 size-56 rounded-full bg-[#f4f4f4] blur-2xl" />
          <div className="absolute top-[28%] right-[20%] size-3 rounded-full bg-[var(--brand)]" />
          <div className="absolute bottom-[28%] left-[22%] size-2 rounded-full bg-[#b8e9c8]" />
        </div>
        <div className="mx-auto max-w-[940px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#cbead6] bg-white px-4 py-2 text-sm font-extrabold text-[var(--brand-dark)] shadow-sm">
            <MapPin size={16} aria-hidden="true" />
            달성군 이웃과 함께하는 지역 봉사
          </span>
          <h1 className="mt-8 text-[clamp(2.8rem,7.2vw,5.4rem)] leading-[1.14] font-extrabold tracking-[-0.065em] text-[var(--text-strong)]">
            작은 도움이 모여
            <br />
            <span className="text-[var(--brand)]">더 따뜻한 달성군</span>을 만듭니다
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-xl">
            {introduction.description}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/volunteer/application"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-7 text-base font-extrabold text-white shadow-[0_12px_30px_rgb(13_186_83/25%)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]"
            >
              봉사단 가입하기
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <Link
              href="/volunteer/events"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#d5d5d5] bg-white px-7 text-base font-extrabold text-[var(--text)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              모집 중인 일정 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface)] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold tracking-[0.14em] text-[var(--brand-dark)] uppercase">
              함께 만드는 변화
            </p>
            <h2 className="mt-4 text-[clamp(2.3rem,5vw,3.2rem)] leading-tight font-extrabold tracking-[-0.04em] text-black">
              일상 가까이에서 시작하는 봉사
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">
              거창한 준비보다 이웃을 향한 마음이 먼저입니다. 관심 분야에 맞는
              활동부터 천천히 시작할 수 있어요.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group rounded-2xl border border-black/[0.04] bg-white p-6 shadow-[0_8px_28px_rgb(0_0_0/4%)] transition-transform hover:-translate-y-1"
              >
                <span className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                  <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-8 text-xl font-extrabold text-[var(--text)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-extrabold text-white">
                가입 안내
              </span>
              <h2 className="mt-6 text-[clamp(2.2rem,5vw,3.1rem)] leading-tight font-extrabold tracking-[-0.04em] text-black">
                신청부터 활동 기록까지
                <br />한눈에 확인하세요
              </h2>
              <div className="mt-8 space-y-4 rounded-2xl bg-[var(--surface)] p-6">
                <p className="flex items-start gap-3 text-sm leading-6 text-[var(--text-muted)]">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[var(--brand)]" size={19} aria-hidden="true" />
                  가입 승인과 실제 참여 가능 여부는 서버에서 안전하게 확인합니다.
                </p>
                <p className="flex items-start gap-3 text-sm leading-6 text-[var(--text-muted)]">
                  <CalendarCheck2 className="mt-0.5 shrink-0 text-[var(--brand)]" size={19} aria-hidden="true" />
                  참여 일정과 누적 활동 시간은 내 봉사활동에서 바로 확인할 수 있어요.
                </p>
              </div>
            </div>
            <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {process.map((item) => (
                <li key={item.number} className="grid gap-3 py-7 sm:grid-cols-[72px_1fr] sm:items-start">
                  <span className="font-mono text-sm font-black text-[var(--brand)]">{item.number}</span>
                  <div>
                    <h3 className="text-xl font-extrabold text-[var(--text)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[28px] bg-[#151c17] px-7 py-10 text-white sm:px-11 sm:py-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold text-[#7be3a2]">지금, 함께할 수 있어요</p>
            <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-[-0.03em] sm:text-4xl">
              내 시간과 마음에 맞는 봉사를 찾아보세요.
            </h2>
          </div>
          <Link
            href="/volunteer/events?status=OPEN&page=0"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-4 font-extrabold text-[#151c17] hover:bg-[#e9f9ef]"
          >
            모집 일정 확인
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
