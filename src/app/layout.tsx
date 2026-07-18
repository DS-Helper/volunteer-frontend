import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { SiteFooter } from '@/components/common/site-footer';
import { SiteHeader } from '@/components/common/site-header';

export const metadata: Metadata = {
  title: {
    default: 'DS Helper 봉사단',
    template: '%s | DS Helper',
  },
  description:
    '달성군 이웃과 일상을 연결하는 DS Helper 봉사단의 가입, 일정 참여, 활동 관리 서비스입니다.',
  icons: {
    icon: '/logo.svg',
  },
};

// Volunteer pages read the Spring API at request time. Avoid build-time data
// snapshots so production never embeds mock or unauthenticated API results.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
