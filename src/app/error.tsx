'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-[720px] flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--brand-dark)] uppercase">
        잠시 문제가 생겼어요
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-[var(--text-strong)]">
        데이터를 불러오지 못했습니다.
      </h1>
      <p className="mt-3 text-[var(--text-muted)]">다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-8 rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white hover:bg-[var(--brand-dark)]"
      >
        다시 시도
      </button>
    </section>
  );
}
