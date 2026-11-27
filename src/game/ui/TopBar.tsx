import { clsx } from 'clsx';
import { Archive, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { CASE_META } from '../data/evidence';
import { useVnStore } from '../store/vnStore';
import { useVnSettings } from '../store/settingsStore';
import type { VnScene } from '../types';

const STEPS: { scenes: VnScene[]; label: string }[] = [
  { scenes: ['prologue', 'investigation', 'npc'], label: '调查' },
  { scenes: ['testimony', 'simulation'], label: '质询' },
  { scenes: ['reversal'], label: '反转' },
  { scenes: ['defense', 'complete'], label: '防御' },
];

function ApMeter({ ap, max, label }: { ap: number; max: number; label: string }) {
  return (
    <div className="flex items-center gap-2" title={`${label} ${ap} / ${max}`}>
      <span className="hidden text-[11px] tracking-[0.18em] text-vn-paper/55 sm:inline">{label}</span>
      <div className="flex items-center gap-[5px]">
        {Array.from({ length: max }).map((_, index) => (
          <span
            key={index}
            className={clsx(
              'h-2 w-2 rotate-45 rounded-[1px] transition-colors duration-300',
              index < ap ? 'bg-vn-amber shadow-[0_0_8px_rgba(213,164,120,0.55)]' : 'bg-vn-paper/15',
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] text-vn-paper/60">{ap}</span>
    </div>
  );
}

export function TopBar({ onOpenBag }: { onOpenBag: () => void }) {
  const scene = useVnStore((state) => state.scene);
  const ap = useVnStore((state) => state.ap);
  const maxAp = useVnStore((state) => state.maxAp);
  const redteamAccess = useVnStore((state) => state.redteamAccess);
  const evidenceCount = useVnStore((state) => state.collectedEvidenceIds.length);
  const resetVn = useVnStore((state) => state.resetVn);
  const muted = useVnSettings((state) => state.muted);
  const setMuted = useVnSettings((state) => state.setMuted);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);
  const setReduceMotion = useVnSettings((state) => state.setReduceMotion);

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.scenes.includes(scene)),
  );
  const act = redteamAccess ? 'redteam' : 'student';
  const apLabel = act === 'student' ? '应急资源' : '行动点';

  const restart = () => {
    if (window.confirm('重新开始本次体验？当前进度会清空。')) resetVn();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-vn-night/85 backdrop-blur-md">
      <div className="vn-frame flex h-14 items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rotate-45 rounded-[3px] border border-vn-amber/70" />
            <span className="h-1.5 w-1.5 rotate-45 bg-vn-amber" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-baseline gap-2">
              <span className="truncate text-[13px] font-semibold tracking-[0.14em] text-vn-paper">
                破壁行动
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-vn-paper/40 sm:inline">
                Phantom
              </span>
            </div>
            <div className="hidden truncate text-[10px] tracking-[0.12em] text-vn-paper/50 sm:flex sm:items-center sm:gap-1.5">
              <span>{CASE_META.chapter} · {CASE_META.title}</span>
              <span className="rounded-full border border-white/15 px-1.5 py-px text-[9px] text-vn-paper/55">
                {act === 'redteam' ? '红队' : '学生'}
              </span>
            </div>
          </div>
        </div>

        <ol className="hidden items-center gap-1 md:flex" aria-label="章节进度">
          {STEPS.map((step, index) => (
            <li key={step.label} className="flex items-center gap-1">
              <span
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.14em] transition-colors',
                  index === activeIndex
                    ? 'bg-vn-amber/15 text-vn-amber'
                    : index < activeIndex
                      ? 'text-vn-paper/55'
                      : 'text-vn-paper/25',
                )}
              >
                <span
                  className={clsx(
                    'h-1 w-1 rounded-full',
                    index === activeIndex
                      ? 'bg-vn-amber'
                      : index < activeIndex
                        ? 'bg-vn-sage'
                        : 'bg-vn-paper/25',
                  )}
                />
                {step.label}
              </span>
              {index < STEPS.length - 1 && <span className="h-px w-4 bg-vn-paper/10" />}
            </li>
          ))}
        </ol>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ApMeter ap={ap} max={maxAp} label={apLabel} />
          <button
            type="button"
            onClick={onOpenBag}
            className="flex items-center gap-1.5 rounded-full border border-vn-paper/15 bg-vn-paper/[0.06] px-3 py-1.5 text-[11px] text-vn-paper/85 transition hover:border-vn-amber/50 hover:bg-vn-amber/10 hover:text-vn-paper"
            aria-label={`打开证据包，已有 ${evidenceCount} 份材料${act === 'student' ? '，归档副本' : ''}`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">证据包</span>
            <span className="font-mono text-[11px] text-vn-amber">{evidenceCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="rounded-full p-2 text-vn-paper/55 transition hover:bg-white/[0.06] hover:text-vn-paper"
            aria-label={muted ? '开启音效' : '关闭音效'}
            title={muted ? '开启音效' : '关闭音效'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            className="hidden rounded-full p-2 text-vn-paper/45 transition hover:bg-white/[0.06] hover:text-vn-paper sm:inline-flex"
            aria-label={reduceMotion ? '开启动态效果' : '减少动态效果'}
            aria-pressed={reduceMotion}
            title={reduceMotion ? '开启动态效果' : '减少动态效果'}
          >
            <Sparkles className={clsx('h-4 w-4', reduceMotion && 'opacity-40')} />
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-full p-2 text-vn-paper/45 transition hover:bg-white/[0.06] hover:text-vn-paper"
            aria-label="重新开始"
            title="重新开始"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
