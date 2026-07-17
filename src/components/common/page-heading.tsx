import type { ReactNode } from 'react';

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-3 text-sm font-extrabold tracking-[0.12em] text-[var(--brand-dark)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.18] font-extrabold tracking-[-0.04em] text-[var(--text-strong)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
