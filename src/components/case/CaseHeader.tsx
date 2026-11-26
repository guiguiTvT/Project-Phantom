import { BookOpen } from 'lucide-react';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { CASE_META } from '@/data/investigation';
import { useAiStatus } from '@/hooks/useAiStatus';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/utils/cn';

const MODE_LABEL = {
  checking: { text: '检测模型配置', dot: 'bg-muted' },
  demo: { text: '本地演示模式', dot: 'bg-primary' },
  live: { text: '模型已连接', dot: 'bg-primary' },
  offline: { text: '本地演示 · 离线', dot: 'bg-warning' },
} as const;

export function CaseHeader() {
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const completed = useGameStore((state) => state.investigation.completed);
  const beginBriefing = useGameStore((state) => state.beginBriefing);
  const ai = useAiStatus();
  const mode = MODE_LABEL[ai.mode];

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.055] bg-background/55 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-primary">
          <PhantomMark size={28} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
              {CASE_META.caseNo}
            </span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.08em]',
                completed
                  ? 'border-primary/35 bg-primary/[0.08] text-primary'
                  : 'border-warning/30 bg-warning/[0.07] text-warning',
              )}
            >
              {completed ? '调查完成' : '调查阶段'}
            </span>
          </div>
          <p className="truncate text-[13px] tracking-wide text-ink/90">{CASE_META.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-secondary lg:inline-flex">
          <span className={cn('h-1.5 w-1.5 rounded-full', mode.dot)} />
          {mode.text}
        </span>

        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">AP</span>
          <span className="text-[15px] font-medium leading-none text-primary">{actionPoints}</span>
          <span className="font-mono text-[10px] leading-none text-muted">/ {maxActionPoints}</span>
        </div>

        <button
          type="button"
          onClick={beginBriefing}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-secondary transition-colors hover:border-primary/30 hover:text-ink"
          title="重新阅读任务简报，不会清空进度"
        >
          <BookOpen size={12} />
          <span className="hidden sm:inline">任务简报</span>
        </button>
      </div>
    </header>
  );
}
