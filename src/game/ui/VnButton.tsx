import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'ink' | 'amber' | 'ghost' | 'darkGhost' | 'quiet';

interface VnButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  ink: 'border-vn-ink bg-vn-ink text-vn-paper hover:bg-[#33465C]',
  amber: 'border-vn-amber bg-vn-amber text-[#2E2318] shadow-vnAmber hover:bg-[#E0B387]',
  ghost: 'border-vn-ink/20 bg-white/40 text-vn-ink hover:border-vn-ink/40 hover:bg-white',
  darkGhost: 'border-white/20 bg-white/[0.06] text-vn-paper/85 hover:border-white/35 hover:bg-white/[0.12]',
  quiet: 'border-transparent bg-transparent text-vn-quiet hover:text-vn-ink',
};

export function VnButton({ variant = 'ghost', size = 'sm', className, children, ...props }: VnButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'inline-flex select-none items-center justify-center gap-1.5 rounded-full border font-medium tracking-[0.04em] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
        size === 'md' ? 'px-4 py-2 text-[12px]' : 'px-3 py-1.5 text-[11px]',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
