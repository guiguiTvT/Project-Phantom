import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, LogOut, Signal, Users } from 'lucide-react';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { GAME_META, PHASE_META } from '@/data/gameConfig';
import { useAiStatus } from '@/hooks/useAiStatus';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { formatClock } from '@/utils/format';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

const AI_LABEL = {
  checking: { text: 'SYNC', className: 'text-muted' },
  live: { text: 'MODEL ONLINE', className: 'text-primary' },
  demo: { text: 'LOCAL DEMO', className: 'text-warning' },
  offline: { text: 'LOCAL ONLY', className: 'text-secondary' },
} as const;

export function TopBar() {
  const player = useGameStore((state) => state.player);
  const phase = useGameStore((state) => state.phase);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const openModal = useUiStore((state) => state.openModal);
  const now = useClock();
  const ai = useAiStatus();
  const phaseMeta = PHASE_META[phase];
  const aiLabel = AI_LABEL[ai.mode];

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line/80 bg-surface-2/70 px-3 backdrop-blur-sm lg:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-line/80 bg-surface text-primary">
          <PhantomMark size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-ink">
              PROJECT PHANTOM
            </span>
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-muted md:inline">
              / {GAME_META.chapter}
            </span>
          </div>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
            PHANTOM OS · ISOLATED MIRROR
          </p>
        </div>

        <span className="mx-1 hidden h-6 w-px bg-line/70 sm:block" />

        <span className="hidden items-center gap-2 border border-primary/35 bg-primary/[0.06] px-2.5 py-1 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[9px] tracking-[0.14em] text-primary">{phaseMeta.label}</span>
          <span className="hidden font-mono text-[8px] tracking-[0.1em] text-secondary/70 lg:inline">
            {phaseMeta.sub}
          </span>
        </span>

        <div className="ml-2 hidden items-center gap-2 md:flex" title="行动点由规则引擎扣除">
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
            AP
          </span>
          <div className="flex gap-[3px]">
            {Array.from({ length: maxActionPoints }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-3 w-[5px] border',
                  index < actionPoints
                    ? 'border-primary/60 bg-primary/70'
                    : 'border-line/70 bg-surface-2',
                )}
              />
            ))}
          </div>
          <span className="font-mono text-[11px] tabular-nums text-primary">
            {actionPoints}
            <span className="text-muted">/{maxActionPoints}</span>
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span
          className={cn('hidden items-center gap-1.5 font-mono text-[8px] tracking-[0.14em] xl:flex', aiLabel.className)}
          title={
            ai.mode === 'live'
              ? `服务端模型模式 · ${ai.model ?? 'unknown'}`
              : '未配置服务端模型，使用本地规则演示'
          }
        >
          <Signal size={11} />
          {aiLabel.text}
        </span>

        <span className="hidden font-mono text-[10px] tabular-nums tracking-[0.1em] text-secondary sm:block">
          {formatClock(now)}
        </span>

        <span className="hidden h-6 w-px bg-line/70 sm:block" />

        <button
          type="button"
          onClick={() => openModal('contacts')}
          className="flex h-8 w-8 items-center justify-center border border-transparent text-secondary transition-colors hover:border-line hover:text-ink xl:hidden"
          aria-label="打开通讯录与通知"
          title="通讯录 / 通知"
        >
          <Users size={15} />
        </button>

        <button
          type="button"
          onClick={() => openModal('briefing')}
          className="hidden h-8 w-8 items-center justify-center border border-transparent text-secondary transition-colors hover:border-line hover:text-ink sm:flex"
          aria-label="演练说明"
          title="演练说明"
        >
          <BookOpen size={15} />
        </button>

        <button
          type="button"
          onClick={() => openModal('return-title')}
          className="hidden h-8 w-8 items-center justify-center border border-transparent text-secondary transition-colors hover:border-line hover:text-danger sm:flex"
          aria-label="返回标题"
          title="返回标题"
        >
          <LogOut size={15} />
        </button>

        <button
          type="button"
          onClick={() => openModal('dossier')}
          className="flex items-center gap-2 border border-line/70 bg-surface px-1.5 py-1 transition-colors hover:border-secondary/50"
          title="当前操作员"
          aria-label="当前操作员"
        >
          <SigilAvatar avatarId={player?.avatarId ?? 'sigil-01'} size={24} />
          <span className="hidden text-left sm:block">
            <span className="block text-[10px] leading-tight text-ink">{player?.callsign ?? '未知'}</span>
            <span className="block font-mono text-[7px] uppercase tracking-[0.12em] text-muted">
              OPERATOR
            </span>
          </span>
          <ChevronDown size={11} className="text-muted" />
        </button>
      </div>
    </header>
  );
}
