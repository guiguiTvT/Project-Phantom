import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line/70 px-5 py-4 lg:px-6">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-1 flex items-baseline gap-3">
          <h1 className="text-lg font-medium tracking-[0.02em] text-ink">{title}</h1>
          {meta}
        </div>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-secondary/90">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function InlineTag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'warning' | 'danger' | 'muted';
  className?: string;
}) {
  const tones = {
    neutral: 'border-line text-secondary',
    primary: 'border-primary/40 text-primary',
    warning: 'border-warning/45 text-warning',
    danger: 'border-danger/45 text-danger',
    muted: 'border-line/60 text-muted',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
