import { CalendarRange, ClipboardList, UsersRound } from 'lucide-react';
import Link from 'next/link';

const adminNavigation = [
  { href: '/admin/volunteer/applications', label: '가입 신청', icon: ClipboardList },
  { href: '/admin/volunteer/members', label: '봉사단원', icon: UsersRound },
  { href: '/admin/volunteer/events', label: '일정 관리', icon: CalendarRange },
];

export default function AdminVolunteerLayout({ children }: LayoutProps<'/admin/volunteer'>) {
  return (
    <div className="flex flex-1 bg-[#f7f8f7]">
      <aside className="hidden w-64 shrink-0 border-r border-black/5 bg-[#162019] px-5 py-8 text-white lg:block">
        <div className="sticky top-24">
          <p className="px-3 text-xs font-extrabold tracking-[0.16em] text-[#72d897] uppercase">Admin console</p>
          <p className="mt-3 px-3 text-xl font-extrabold">봉사단 관리</p>
          <nav className="mt-8 space-y-1" aria-label="봉사단 관리자 메뉴">
            {adminNavigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/75 transition-colors hover:bg-white/10 hover:text-white">
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 rounded-xl bg-white/5 p-4 text-xs leading-5 text-white/55">
            화면의 메뉴 노출은 편의를 위한 것이며, 실제 권한은 Spring Security가 최종 확인합니다.
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-black/5 bg-white px-4 py-3 lg:hidden" aria-label="모바일 관리자 메뉴">
          {adminNavigation.map(({ href, label }) => (
            <Link key={href} href={href} className="shrink-0 rounded-full bg-[var(--surface)] px-4 py-2 text-sm font-extrabold text-[var(--text-muted)]">{label}</Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
