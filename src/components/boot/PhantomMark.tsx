import { cn } from '@/utils/cn';

export function PhantomMark({
  size = 40,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn(animated && 'animate-flicker', className)}
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeOpacity="0.16" />
      <circle cx="32" cy="32" r="24.5" stroke="currentColor" strokeOpacity="0.28" strokeDasharray="2 5" />
      <path
        d="M32 11c-10.4 0-17.6 8.2-17.6 20.4V49l5.6-4.4 4.6 4.4 6-5.5 6 5.5 4.6-4.4L47 49V31.4C47 19.2 42.4 11 32 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="25.6" cy="30.4" r="2" fill="currentColor" />
      <circle cx="38.4" cy="30.4" r="2" fill="currentColor" />
      <path d="M27.5 38.4h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M32 4v4M32 56v4M4 32h4M56 32h4" stroke="currentColor" strokeOpacity="0.35" />
    </svg>
  );
}
