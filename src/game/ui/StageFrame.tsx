import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface StageFrameProps {
  bg: string;
  children: ReactNode;
  className?: string;
  bgClassName?: string;
  impact?: boolean;
  push?: boolean;
  onBackgroundClick?: () => void;
}

export function StageFrame({
  bg,
  children,
  className,
  bgClassName,
  impact = false,
  push = false,
  onBackgroundClick,
}: StageFrameProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[20px] border border-white/10 bg-vn-stage shadow-vn',
        impact && 'vn-impact',
        className,
      )}
    >
      <img
        src={bg}
        alt=""
        aria-hidden
        draggable={false}
        className={clsx(
          'absolute inset-0 h-full w-full select-none object-cover',
          push && 'vn-push',
          bgClassName,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-vn-night/80 via-vn-night/10 to-vn-night/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_45%,rgba(13,20,28,0.35)_100%)]" />
      <div className="vn-grain pointer-events-none absolute inset-0 opacity-30" />
      {onBackgroundClick && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={onBackgroundClick}
          className="absolute inset-0 h-full w-full cursor-default"
        />
      )}
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
