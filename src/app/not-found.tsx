import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-[720px] flex-col items-center justify-center px-5 text-center">
      <p className="text-7xl font-black tracking-[-0.05em] text-[var(--brand)]">404</p>
      <h1 className="mt-5 text-3xl font-extrabold text-[var(--text-strong)]">
        요청한 화면을 찾을 수 없습니다.
      </h1>
      <p className="mt-3 text-[var(--text-muted)]">
        주소를 확인하거나 봉사단 홈에서 다시 시작해 주세요.
      </p>
      <Link
        href="/volunteer"
        className="mt-8 rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white hover:bg-[var(--brand-dark)]"
      >
        봉사단 홈으로
      </Link>
    </section>
  );
}
