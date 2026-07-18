import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const variants = {
  success: {
    className: 'border-[#bfe8ce] bg-[#eefaf2] text-[#176b35]',
    icon: CheckCircle2,
  },
  error: {
    className: 'border-[#efc5c5] bg-[#fff4f4] text-[#a72d2d]',
    icon: AlertCircle,
  },
  info: {
    className: 'border-[#cbdcf5] bg-[#f3f7fd] text-[#315f9f]',
    icon: Info,
  },
} as const;

export function FeedbackBanner({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}) {
  const selected = variants[variant];
  const Icon = selected.icon;
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${selected.className}`}
    >
      <Icon className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
