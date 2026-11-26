import { AlertTriangle, ArrowUpRight, Info, ShieldAlert } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { DEMO_NOTICES, NPC_MOOD_META } from '@/data/gameConfig';
import { NPCS } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { worldBand } from '@/utils/format';
import type { WorldState } from '@/types';

const NOTICE_ICON = {
  info: Info,
  warning: AlertTriangle,
  danger: ShieldAlert,
};

const NOTICE_TONE = {
  info: 'text-primary/80',
  warning: 'text-warning',
  danger: 'text-danger',
};

const DOT_TONE = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const WORLD_KEYS: (keyof WorldState)[] = ['security', 'operation', 'relations', 'repair'];

export function RightRail() {
  const world = useGameStore((state) => state.world);
  const collected = useGameStore((state) => state.collectedEvidenceIds.length);
  const openDossier = useUiStore((state) => state.openDossier);
  const setView = useUiStore((state) => state.setView);

  return (
    <aside className="hidden w-[328px] shrink-0 flex-col overflow-y-auto border-l border-line/70 bg-surface-2/25 xl:flex">
      <section className="border-b border-line/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="eyebrow">contacts</p>
            <p className="mt-1 text-[12px] text-ink">通讯录</p>
          </div>
          <span className="font-mono text-[9px] tracking-[0.12em] text-muted">{NPCS.length} / 05</span>
        </div>
        <div className="px-2 pb-2">
          {NPCS.map((npc) => {
            const mood = NPC_MOOD_META[npc.currentMood];
            return (
              <button
                key={npc.id}
                type="button"
                onClick={() => openDossier(npc.id)}
                className="group flex w-full items-center gap-3 border border-transparent px-2 py-2.5 text-left transition-colors hover:border-line/70 hover:bg-surface/50"
              >
                <SigilAvatar avatarId={npc.avatarId} size={34} name={npc.name} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[12px] text-ink">{npc.name}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                      {npc.codename}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className={cn('h-1 w-1 rounded-full', DOT_TONE[mood.tone])} />
                    <span className="truncate text-[10px] text-secondary/85">{npc.role}</span>
                  </span>
                </span>
                <ArrowUpRight
                  size={12}
                  className="shrink-0 text-muted/50 transition-colors group-hover:text-primary"
                />
              </button>
            );
          })}
        </div>
        <p className="border-t border-line/40 px-4 py-2 text-[9px] leading-relaxed text-muted/80">
          当前为档案只读模式。NPC 自由对话与上下文记忆将在 Phase 3 接通。
        </p>
      </section>

      <section className="border-b border-line/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="eyebrow">notices</p>
            <p className="mt-1 text-[12px] text-ink">系统通知</p>
          </div>
          <span className="font-mono text-[9px] tracking-[0.12em] text-warning/80">
            {DEMO_NOTICES.length} NEW
          </span>
        </div>
        <div className="space-y-1 px-3 pb-3">
          {DEMO_NOTICES.map((notice) => {
            const Icon = NOTICE_ICON[notice.tone];
            return (
              <div key={notice.id} className="border border-line/50 bg-surface/40 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-ink">
                    <Icon size={11} className={NOTICE_TONE[notice.tone]} />
                    {notice.title}
                  </span>
                  <span className="font-mono text-[8px] text-muted">{notice.at}</span>
                </div>
                <p className="mt-1 pl-[18px] text-[10px] leading-relaxed text-secondary/80">
                  {notice.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-b border-line/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow">campus status</p>
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">qualitative</span>
        </div>
        <div className="mt-2">
          {WORLD_KEYS.map((key) => {
            const band = worldBand(key, world[key]);
            return (
              <div key={key} className="flex items-center justify-between border-b border-line/30 py-1.5 last:border-b-0">
                <span className="text-[10px] text-secondary/90">{band.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className={cn('h-1 w-1 rounded-full', DOT_TONE[band.tone])} />
                  <span className="text-[10px] text-ink/85">{band.text}</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-muted/70">
          具体数值由规则引擎管理，仅通过动态、事件与人物反馈间接体现。
        </p>
      </section>

      <div className="mt-auto px-4 py-3">
        <button
          type="button"
          onClick={() => setView('intel')}
          className="flex w-full items-center justify-between border border-line/60 px-3 py-2 text-[10px] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          <span>查看证据库</span>
          <span className="font-mono text-[9px]">{collected} / 10 →</span>
        </button>
      </div>
    </aside>
  );
}
