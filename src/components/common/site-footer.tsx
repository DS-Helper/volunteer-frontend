import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--surface)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:px-0">
        <div>
          <p className="text-lg font-extrabold text-[var(--text)]">DS Helper</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
            달성군 이웃과 일상을 연결하는 생활밀착형 플랫폼입니다. 작은
            도움이 지역의 큰 변화를 만듭니다.
          </p>
          <p className="mt-6 text-xs text-[#8f8f8f]">
            © 2026 DS Helper. All rights reserved.
          </p>
        </div>
        <div>
          <p className="font-bold">운영자 정보</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <li>DS Helper 팀</li>
            <li>대표: 신인호</li>
            <li>이메일: dshelper77@gmail.com</li>
          </ul>
        </div>
        <div>
          <p className="font-bold">바로가기</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm text-[var(--text-muted)]">
            <Link href="/volunteer/events" className="hover:text-[var(--brand-dark)]">
              봉사 일정
            </Link>
            <Link href="/volunteer/application" className="hover:text-[var(--brand-dark)]">
              봉사단 가입
            </Link>
            <a href="https://dshelper.kr/privacy" className="hover:text-[var(--brand-dark)]">
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
