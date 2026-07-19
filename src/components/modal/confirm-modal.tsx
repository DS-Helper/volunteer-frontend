'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  pending = false,
  hideCancel = false,
  children,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  hideCancel?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousElement = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose();
      if (event.key === 'Tab') {
        const dialog = closeButtonRef.current?.closest('[role="dialog"]');
        const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')) : [];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousElement?.focus();
    };
  }, [onClose, open, pending]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={description ? 'confirm-modal-description' : undefined}
        className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="confirm-modal-title" className="text-xl font-extrabold text-[var(--text-strong)]">
              {title}
            </h2>
            {description ? (
              <p id="confirm-modal-description" className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="닫기"
            onClick={onClose}
            disabled={pending}
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface)] disabled:opacity-40"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        <div className={`mt-7 grid gap-3 ${hideCancel ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {!hideCancel ? (
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-xl border border-[#d5d5d5] px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55 ${danger ? 'bg-[var(--danger)] hover:bg-[#b52e2e]' : 'bg-[var(--brand)] hover:bg-[var(--brand-dark)]'}`}
          >
            {pending ? '처리 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
