const toneClasses = {
  green: 'bg-[#e6f8ed] text-[#087a36]',
  gray: 'bg-[#f0f0f0] text-[#666]',
  amber: 'bg-[#fff4dc] text-[#9a5b00]',
  red: 'bg-[#fff0f0] text-[#be2f2f]',
  blue: 'bg-[#edf4ff] text-[#315f9f]',
} as const;

export function StatusBadge({
  children,
  tone = 'gray',
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
