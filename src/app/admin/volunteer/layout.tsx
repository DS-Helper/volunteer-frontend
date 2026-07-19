import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '관리자 · 봉사단',
    template: '%s | DS Helper',
  },
}

export default function AdminVolunteerLayout({ children }: LayoutProps<'/admin/volunteer'>) {
  return children
}
