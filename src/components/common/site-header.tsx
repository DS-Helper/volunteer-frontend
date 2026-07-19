import Image from 'next/image';
import Link from 'next/link';

const navigation = [
  { href: '/volunteer', label: '봉사단 소개' },
  { href: '/volunteer/events', label: '봉사 일정' },
  { href: '/volunteer/my', label: '내 봉사활동' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-7 px-5 sm:px-8 lg:px-12">
        <Link
          href="/volunteer"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
          aria-label="DS Helper 봉사단 홈"
        >
          <Image
            src="/logo.svg"
            alt="DS Helper"
            width={94}
            height={22}
            loading="eager"
          />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[15px] font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-[5px] border border-[#d5d5d5] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)] sm:inline-flex"
            >
              로그인
            </Link>
            <Link
            href="/admin/volunteer/applications"
            className="hidden rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-bold text-[var(--brand-dark)] transition-colors hover:bg-[#d9f6e4] sm:inline-flex"
          >
            관리자
          </Link>
          <Link
            href="/volunteer/application-status"
            className="inline-flex h-9 items-center justify-center rounded-[5px] border border-[#d5d5d5] px-4 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand-dark)]"
          >
            신청 현황
          </Link>
        </div>
      </div>
      <nav
        className="scrollbar-none flex gap-1 overflow-x-auto border-t border-black/5 px-4 py-2 md:hidden"
        aria-label="모바일 메뉴"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-[#d5d5d5] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/admin/volunteer/applications"
          className="shrink-0 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white"
        >
          관리자
        </Link>
      </nav>
    </header>
  );
}
