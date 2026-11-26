import { NAV_ITEMS } from '@/data/gameConfig';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { NAV_ICONS } from './navIcons';

export function MobileNav() {
  const activeView = useUiStore((state) => state.activeView);
  const setView = useUiStore((state) => state.setView);

  return (
    <nav className="flex shrink-0 items-stretch overflow-x-auto border-b border-line/70 bg-surface-2/50 lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.id];
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 transition-colors',
              active
                ? 'border-primary bg-primary/[0.06] text-primary'
                : 'border-transparent text-secondary hover:text-ink',
            )}
          >
            <Icon size={14} />
            <span className="whitespace-nowrap text-[10px]">{item.label}</span>
            {item.status !== 'live' && (
              <span className="font-mono text-[7px] text-muted">
                {item.status === 'phase2' ? 'P2' : 'P4'}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
