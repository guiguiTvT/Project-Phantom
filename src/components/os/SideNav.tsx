import { ChevronRight, Info, Lock } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { GAME_META, NAV_ITEMS } from '@/data/gameConfig';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { NAV_ICONS } from './navIcons';

export function SideNav() {
  const activeView = useUiStore((state) => state.activeView);
  const setView = useUiStore((state) => state.setView);
  const openModal = useUiStore((state) => state.openModal);
  const player = useGameStore((state) => state.player);
  const collected = useGameStore((state) => state.collectedEvidenceIds.length);

  return (
    <aside className="hidden w-[228px] shrink-0 flex-col border-r border-line/70 bg-surface-2/25 lg:flex">
      <div className="border-b border-line/60 px-4 py-4">
        <p className="eyebrow">operator console</p>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.18em] text-secondary">
          PHANTOM / ACT I
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id];
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={cn(
                'relative flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors',
                active
                  ? 'border-primary bg-primary/[0.07]'
                  : 'border-transparent hover:bg-surface/60',
              )}
            >
              <Icon
                size={15}
                className={cn('mt-0.5 shrink-0', active ? 'text-primary' : 'text-muted')}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={cn('text-[12px]', active ? 'text-ink' : 'text-secondary')}>
                    {item.label}
                  </span>
                  {item.status === 'live' ? (
                    <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-primary/60">
                      live
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 border border-line/70 px-1 py-px font-mono text-[7px] uppercase tracking-[0.1em] text-muted">
                      <Lock size={7} />
                      {item.status === 'phase2' ? 'P2' : 'P4'}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                  {item.en}
                </span>
                <span className="mt-1 block text-[10px] leading-tight text-muted/80">{item.note}</span>
              </span>
              {active && <ChevronRight size={11} className="mt-0.5 shrink-0 text-primary/70" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-line/60 p-3">
        <div className="border border-line/70 bg-surface/50 p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">clearance</p>
          <div className="mt-2 flex items-center gap-2">
            <SigilAvatar avatarId={player?.avatarId ?? 'sigil-01'} size={30} />
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink">{player?.callsign ?? '未授权'}</p>
              <p className="truncate font-mono text-[7px] uppercase tracking-[0.1em] text-muted">
                RED TEAM / RT-07
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-line/50 pt-2 text-[9px]">
            <span className="text-muted">证据库</span>
            <button
              type="button"
              onClick={() => setView('intel')}
              className="font-mono text-secondary transition-colors hover:text-primary"
            >
              {collected} / 10 →
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal('briefing')}
          className="mt-2 flex w-full items-center gap-2 px-1 py-1.5 text-left text-[10px] text-muted transition-colors hover:text-ink"
        >
          <Info size={12} />
          演练说明与边界
        </button>
      </div>

      <div className="border-t border-line/50 px-4 py-2 font-mono text-[7px] uppercase tracking-[0.14em] text-muted/60">
        {GAME_META.chapter} · {GAME_META.version}
      </div>
    </aside>
  );
}
