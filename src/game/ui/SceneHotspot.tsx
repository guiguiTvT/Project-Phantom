import { clsx } from 'clsx';
import { Check, ClipboardList, Laptop, Smartphone } from 'lucide-react';
import type { Hotspot } from '../types';

const ICONS = {
  phone: Smartphone,
  laptop: Laptop,
  board: ClipboardList,
};

interface SceneHotspotProps {
  hotspot: Hotspot;
  found: boolean;
  onOpen: (hotspot: Hotspot) => void;
}

export function SceneHotspot({ hotspot, found, onOpen }: SceneHotspotProps) {
  const Icon = ICONS[hotspot.icon];

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(hotspot);
      }}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
      aria-label={`调查${hotspot.label}，${hotspot.hint}`}
    >
      {!found && (
        <>
          <span className="pointer-events-none absolute inset-0 animate-vn-halo rounded-full border border-vn-amber/60" />
          <span className="pointer-events-none absolute inset-0 animate-vn-halo-delayed rounded-full border border-vn-paper/40" />
        </>
      )}
      <span
        className={clsx(
          'relative flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 sm:h-11 sm:w-11',
          found
            ? 'border-vn-sage/50 bg-vn-night/45 text-vn-sage'
            : 'border-vn-amber/70 bg-vn-night/50 text-vn-paper shadow-[0_0_20px_rgba(213,164,120,0.35)] group-hover:scale-110 group-hover:bg-vn-night/70 group-focus-visible:scale-110',
        )}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.7} />
        {found && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-vn-sage text-[#15221f]">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </span>

      <span
        className={clsx(
          'pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[180px] -translate-x-1/2 rounded-lg border border-vn-ink/10 bg-vn-paper px-2.5 py-1.5 text-center text-vn-ink shadow-md transition-all duration-200',
          'opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
        )}
      >
        <span className="block text-[11px] font-medium leading-tight">{found ? '已调查' : hotspot.label}</span>
        <span className="mt-0.5 block text-[9px] leading-tight text-vn-quiet">
          {found ? '材料在证据包里' : hotspot.hint}
        </span>
      </span>
    </button>
  );
}
