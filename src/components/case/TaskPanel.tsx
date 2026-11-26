import { ArrowRight, Check, Circle, RotateCcw, Sparkles } from 'lucide-react';
import { CASE_META, GUIDE_STEPS } from '@/data/investigation';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

const TASKS = [
  { key: 'view', label: '打开 E2，读完这条异常通知' },
  { key: 'contact', label: '联系周宁，拿到一条可用提示' },
  { key: 'pin', label: '把至少两条线索放进情报板' },
] as const;

export function TaskPanel({
  guideIndex,
  onOpenEvidence,
  onOpenHypothesis,
  onReviewCompletion,
  onReset,
}: {
  guideIndex: number;
  onOpenEvidence: (evidenceId: string) => void;
  onOpenHypothesis: () => void;
  onReviewCompletion: () => void;
  onReset: () => void;
}) {
  const investigation = useGameStore((state) => state.investigation);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const contactCaseNpc = useGameStore((state) => state.contactCaseNpc);
  const pushToast = useUiStore((state) => state.pushToast);

  const step = GUIDE_STEPS[guideIndex] ?? GUIDE_STEPS[0];
  const viewedE2 = investigation.viewedEvidenceIds.includes('ke-02');
  const contactedZhou = investigation.contactedNpcIds.includes('npc_zhouning');
  const pinnedEnough = investigation.pinnedEvidenceIds.length >= 2;
  const doneMap: Record<(typeof TASKS)[number]['key'], boolean> = {
    view: viewedE2,
    contact: contactedZhou,
    pin: pinnedEnough,
  };
  const completedCount = Object.values(doneMap).filter(Boolean).length;

  function handlePrimary() {
    switch (step.id) {
      case 'open-evidence':
        onOpenEvidence('ke-02');
        return;
      case 'contact': {
        const result = contactCaseNpc('npc_zhouning');
        pushToast({
          tone: result.ok ? 'success' : 'warning',
          title: result.message,
          description: result.ok ? '行动点已扣除，右侧对话与提示已更新。' : '先整理一下已有线索。',
        });
        return;
      }
      case 'pin-evidence':
        if (!investigation.viewedEvidenceIds.includes('ke-07')) {
          onOpenEvidence('ke-07');
          return;
        }
        document.getElementById('intel-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pushToast({
          tone: 'info',
          title: '把两张卡片拖进情报板',
          description: 'E2 和 E7 并排放在一起，矛盾就清楚了。',
        });
        return;
      case 'hypothesis':
        onOpenHypothesis();
        return;
      default:
        onReviewCompletion();
    }
  }

  return (
    <div className="space-y-3">
      <section className="case-card p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">当前任务</p>
          <span className="chip border-white/[0.06] px-2 py-0.5 text-[9px]">
            {completedCount} / 3
          </span>
        </div>
        <h2 className="mt-2 text-[16px] font-medium leading-snug tracking-wide text-ink">
          找出通知里的破绽
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary/75">
          {CASE_META.objective}
        </p>

        <div className="mt-4 border-t border-white/[0.06] pt-3.5">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-light leading-none text-ink">{actionPoints}</span>
              <span className="font-mono text-[10px] text-muted">/ {maxActionPoints} 行动点</span>
            </div>
            <span className="font-mono text-[9px] text-muted">由程序扣除</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1" aria-label={`剩余行动点 ${actionPoints}`}>
            {Array.from({ length: maxActionPoints }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-1.5 w-3 rounded-full transition-colors',
                  index < actionPoints ? 'bg-primary/80' : 'bg-white/[0.08]',
                )}
              />
            ))}
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {TASKS.map((task) => {
            const done = doneMap[task.key];
            return (
              <li key={task.key} className="flex items-center gap-2.5">
                {done ? (
                  <Check size={13} className="shrink-0 text-primary" />
                ) : (
                  <Circle size={13} className="shrink-0 text-muted/60" />
                )}
                <span
                  className={cn(
                    'text-[11.5px] leading-snug',
                    done ? 'text-secondary/55 line-through' : 'text-secondary',
                  )}
                >
                  {task.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className={cn(
          'case-card overflow-hidden p-4',
          step.id === 'done' ? 'border-primary/25' : 'border-primary/15',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-primary">
            <Sparkles size={10} />
            {step.kicker}
          </span>
          <div className="flex items-center gap-1">
            {GUIDE_STEPS.slice(0, 4).map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  'h-1 w-4 rounded-full',
                  index < guideIndex ? 'bg-primary/70' : index === guideIndex ? 'bg-primary' : 'bg-white/[0.09]',
                )}
              />
            ))}
          </div>
        </div>
        <h3 className="mt-2.5 text-[15px] font-medium leading-snug text-ink">{step.title}</h3>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary/80">{step.body}</p>

        <button
          type="button"
          onClick={handlePrimary}
          className="cta mt-3.5 w-full py-3 text-[13px]"
        >
          {step.id === 'done' ? '查看调查结论' : step.actionLabel ?? '继续'}
          <ArrowRight size={15} />
        </button>
        <p className="mt-2 text-center font-mono text-[9px] text-muted">
          引导会随进度自动前进
        </p>
      </section>

      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[9px] text-muted">进度自动保存在本机</span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[9px] text-muted transition-colors hover:text-danger"
        >
          <RotateCcw size={10} />
          重开本案
        </button>
      </div>
    </div>
  );
}
