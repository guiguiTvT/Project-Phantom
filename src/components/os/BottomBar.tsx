import { Activity, BookOpen, LogOut, ScrollText } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { formatStamp } from '@/utils/format';

export function BottomBar() {
  const log = useGameStore((state) => state.log);
  const updatedAt = useGameStore((state) => state.updatedAt);
  const openModal = useUiStore((state) => state.openModal);
  const latest = log[log.length - 1];

  return (
    <footer className="flex h-9 shrink-0 items-stretch border-t border-line/70 bg-surface-2/80">
      <button
        type="button"
        onClick={() => openModal('log')}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 text-left transition-colors hover:bg-surface/50"
        title="打开完整系统日志"
      >
        <Activity size={12} className="shrink-0 text-primary/70" />
        <span className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-muted sm:inline">
          syslog
        </span>
        {latest ? (
          <>
            <span className="shrink-0 font-mono text-[8px] tabular-nums text-muted">
              {formatStamp(latest.at).slice(-5)}
            </span>
            <span className="truncate text-[10px] text-secondary/90">
              <span className="text-ink/80">{latest.actionLabel}</span>
              <span className="mx-1.5 text-muted">·</span>
              {latest.detail}
            </span>
          </>
        ) : (
          <span className="text-[10px] text-muted">暂无系统日志</span>
        )}
      </button>

      <div className="flex shrink-0 items-stretch border-l border-line/60">
        <span className="hidden items-center px-3 font-mono text-[8px] uppercase tracking-[0.1em] text-muted md:flex">
          AUTO-SAVE {updatedAt ? formatStamp(updatedAt) : '—'}
        </span>
        <button
          type="button"
          onClick={() => openModal('log')}
          className="flex items-center gap-1.5 border-l border-line/50 px-3 text-[10px] text-secondary transition-colors hover:bg-surface/60 hover:text-ink"
          title="系统日志"
        >
          <ScrollText size={12} />
          <span className="hidden sm:inline">日志</span>
        </button>
        <button
          type="button"
          onClick={() => openModal('briefing')}
          className="flex items-center gap-1.5 border-l border-line/50 px-3 text-[10px] text-secondary transition-colors hover:bg-surface/60 hover:text-ink"
          title="演练说明"
        >
          <BookOpen size={12} />
          <span className="hidden sm:inline">说明</span>
        </button>
        <button
          type="button"
          onClick={() => openModal('return-title')}
          className="flex items-center gap-1.5 border-l border-line/50 px-3 text-[10px] text-secondary transition-colors hover:bg-surface/60 hover:text-danger"
          title="返回标题"
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">退出</span>
        </button>
      </div>
    </footer>
  );
}
