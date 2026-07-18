import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfcfcf] bg-[var(--surface)] px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-white text-[var(--brand)] shadow-sm">
        <Inbox aria-hidden="true" size={23} />
      </span>
      <h2 className="mt-5 text-lg font-extrabold text-[var(--text)]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
