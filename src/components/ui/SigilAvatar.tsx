import { cn } from '@/utils/cn';
import { hashString } from '@/utils/random';

const ACCENTS = [
  '#52D6D0',
  '#E8B46A',
  '#9CA8E3',
  '#7ED7B0',
  '#C89AD6',
  '#7FA8E8',
  '#E39E9E',
  '#8CD6A4',
];

function glyphPath(variant: number, accent: string) {
  switch (variant) {
    case 0:
      return (
        <>
          <circle cx="32" cy="32" r="14" stroke={accent} strokeWidth="1.4" />
          <circle cx="32" cy="32" r="5" stroke={accent} strokeWidth="1.4" />
          <path d="M32 10v9M32 45v9M10 32h9M45 32h9" stroke={accent} strokeWidth="1" opacity="0.7" />
        </>
      );
    case 1:
      return (
        <>
          <path d="M32 14 48 44H16L32 14Z" stroke={accent} strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="32" cy="34" r="3.4" fill={accent} />
          <path d="M22 50h20" stroke={accent} strokeWidth="1" opacity="0.5" />
        </>
      );
    case 2:
      return (
        <>
          <path d="M32 12 49 22v20L32 52 15 42V22L32 12Z" stroke={accent} strokeWidth="1.3" />
          <circle cx="32" cy="32" r="4" fill={accent} />
          <circle cx="32" cy="16" r="1.7" fill={accent} opacity="0.7" />
          <circle cx="45" cy="39" r="1.7" fill={accent} opacity="0.7" />
          <circle cx="19" cy="39" r="1.7" fill={accent} opacity="0.7" />
        </>
      );
    case 3:
      return (
        <>
          <path d="M20 46V29c0-7.5 5.4-13 12-13s12 5.5 12 13v17l-4-3-4 3-4-4-4 4-4-3-4 3Z" stroke={accent} strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="27.5" cy="31" r="1.6" fill={accent} />
          <circle cx="36.5" cy="31" r="1.6" fill={accent} />
        </>
      );
    case 4:
      return (
        <>
          <path d="M32 13 51 32 32 51 13 32 32 13Z" stroke={accent} strokeWidth="1.2" />
          <path d="M32 21 43 32 32 43 21 32 32 21Z" stroke={accent} strokeWidth="1.2" opacity="0.7" />
          <circle cx="32" cy="32" r="2.2" fill={accent} />
        </>
      );
    case 5:
      return (
        <>
          <path d="M12 27c6-7 12-7 18 0s12 7 22 0" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 38c6-7 12-7 18 0s12 7 22 0" stroke={accent} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
          <circle cx="32" cy="32.5" r="2" fill={accent} />
        </>
      );
    case 6:
      return (
        <>
          <circle cx="32" cy="32" r="17" stroke={accent} strokeWidth="1" strokeDasharray="1 4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="32"
              y1="32"
              x2={32 + 17 * Math.cos((deg * Math.PI) / 180)}
              y2={32 + 17 * Math.sin((deg * Math.PI) / 180)}
              stroke={accent}
              strokeWidth="0.8"
              opacity="0.55"
            />
          ))}
          <circle cx="32" cy="32" r="4.2" stroke={accent} strokeWidth="1.3" />
        </>
      );
    default:
      return (
        <>
          <path d="M18 16h-4v32h4M46 16h4v32h-4" stroke={accent} strokeWidth="1.3" />
          <circle cx="32" cy="32" r="9" stroke={accent} strokeWidth="1.4" />
          <circle cx="32" cy="32" r="3" fill={accent} />
          <path d="M23 32h-5M41 32h5" stroke={accent} strokeWidth="1" opacity="0.6" />
        </>
      );
  }
}

export function SigilAvatar({
  avatarId,
  name,
  size = 40,
  className,
  muted = false,
}: {
  avatarId: string;
  name?: string;
  size?: number;
  className?: string;
  muted?: boolean;
}) {
  const hash = hashString(avatarId);
  const accent = ACCENTS[hash % ACCENTS.length];
  const variant = hash % 8;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border border-line/90 bg-surface-2',
        muted && 'opacity-70',
        className,
      )}
      style={{ width: size, height: size }}
      title={name ? `${name} 的虚拟身份符印` : '虚拟身份符印'}
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(138,156,181,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(138,156,181,.5) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />
      <svg viewBox="0 0 64 64" className="relative h-full w-full p-[12%]" fill="none" aria-hidden="true">
        {glyphPath(variant, accent)}
      </svg>
    </div>
  );
}
