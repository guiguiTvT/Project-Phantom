import { useState, type DragEvent } from 'react';
import { ArrowRight, Check, Layers, Lightbulb } from 'lucide-react';
import {
  CASE_EVIDENCE_BY_ID,
  isHypothesisReady,
} from '@/data/investigation';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

function contradictionLine(ids: string[]): string {
  const has = (id: string) => ids.includes(id);
  if (has('ke-02') && has('ke-07')) return '「今晚 23:59 截止」 ✕ 「已延长至 11-27 21:00」';
  if (has('ke-04') && has('ke-07')) return '「私人账号催办」 ✕ 「官方未审批补录入口」';
  if (has('ke-02') && has('ke-04')) return '两个来源都在催 ✕ 都没有可核实的落款';
  return '再放入一条材料，让时间或来源并排出现。';
}

export function IntelBoard({
  highlighted,
  onOpenHypothesis,
  onReviewCompletion,
}: {
  highlighted?: boolean;
  onOpenHypothesis: () => void;
  onReviewCompletion: () => void;
}) {
  const investigation = useGameStore((state) => state.investigation);
  const pinCaseEvidence = useGameStore((state) => state.pinCaseEvidence);
  const pushToast = useUiStore((state) => state.pushToast);
  const [dragOver, setDragOver] = useState(false);

  const pinned = investigation.pinnedEvidenceIds.flatMap((id) => {
    const item = CASE_EVIDENCE_BY_ID[id];
    return item ? [item] : [];
  });
  const ready = isHypothesisReady(
    investigation.viewedEvidenceIds,
    investigation.pinnedEvidenceIds,
    investigation.contactedNpcIds,
  );

  function missingHint() {
    if (!investigation.viewedEvidenceIds.includes('ke-02')) return '先打开 E2，弄清这条通知说了什么。';
    if (!investigation.contactedNpcIds.includes('npc_zhouning')) return '先问问周宁，她见过这条消息。';
    return '再把两条线索拖进情报板，让矛盾并排出现。';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const evidenceId = event.dataTransfer.getData('text/plain');
    if (!CASE_EVIDENCE_BY_ID[evidenceId]) {
      pushToast({ tone: 'warning', title: '这张卡不能放进情报板', description: '试试 E2、E4 或 E7 这三张关键材料。' });
      return;
    }
    const result = pinCaseEvidence(evidenceId);
    pushToast({
      tone: result.ok ? 'success' : 'warning',
      title: result.message,
      description: result.ok ? '线索已并排，注意它们在来源和时间上的冲突。' : undefined,
    });
  }

  return (
    <section
      id="intel-board"
      className={cn('case-card p-4 sm:p-5', highlighted && !investigation.completed && 'guide-strong border-primary/25')}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Layers size={14} />
            <h2 className="text-[14px] font-medium tracking-wide text-ink">情报板</h2>
            <span className="rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] text-secondary">
              {pinned.length} / 3
            </span>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary/75">
            把两张以上线索并排放好，矛盾会自己露出来。
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-2.5 py-1 font-mono text-[9px] text-muted">
          <ArrowRight size={10} />
          可拖拽 / 也可点卡片上的「情报板」
        </span>
      </div>

      <div
        data-intel-dropzone="true"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'mt-4 grid gap-2.5 rounded-xl border border-dashed border-white/[0.09] p-2.5 transition-colors sm:grid-cols-3',
          dragOver && 'drop-active',
        )}
      >
        {[0, 1, 2].map((slot) => {
          const item = pinned[slot];
          if (!item) {
            return (
              <div
                key={`empty-${slot}`}
                className="flex min-h-[86px] flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.06] px-3 py-4 text-center"
              >
                <span className="font-mono text-[10px] text-muted/60">0{slot + 1}</span>
                <span className="mt-1 text-[10.5px] text-muted/75">
                  {slot === 0 ? '把线索拖到这里' : '空位'}
                </span>
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className="min-h-[86px] rounded-lg border border-primary/20 bg-primary/[0.045] px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-primary">{item.exhibitCode}</span>
                <Check size={11} className="text-primary/70" />
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-ink/90">{item.title}</p>
              <p className="mt-1 line-clamp-1 font-mono text-[9px] text-muted">{item.sourceType === 'official' ? '官方来源' : '匿名来源'}</p>
            </div>
          );
        })}
      </div>

      {pinned.length >= 2 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/[0.05] px-3.5 py-2.5">
          <Lightbulb size={13} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-[11.5px] leading-relaxed text-warning/90">
            <span className="font-medium">矛盾信号：</span>
            {contradictionLine(investigation.pinnedEvidenceIds)}
          </p>
        </div>
      )}

      <div className="mt-3.5">
        {investigation.completed ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5">
              <Check size={14} className="text-primary" />
              <p className="text-[12px] text-primary">初步假设已记录 · 等待进入验证阶段</p>
            </div>
            <button type="button" onClick={onReviewCompletion} className="btn btn-ghost px-4">
              查看结论
            </button>
          </div>
        ) : ready ? (
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={onOpenHypothesis} className="cta flex-1 py-3 text-[13px]">
              写下我的初步假设
              <ArrowRight size={15} />
            </button>
            <span className="text-center font-mono text-[9px] text-primary/70 sm:text-left">
              线索已经够用了
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => pushToast({ tone: 'info', title: '还差一步', description: missingHint() })}
              className="w-full rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-center text-[12px] text-secondary/70 transition-colors hover:border-primary/25 hover:text-secondary"
            >
              线索还不足以形成假设 · 点此查看还缺什么
            </button>
            <p className="mt-2 text-center text-[10.5px] text-muted">{missingHint()}</p>
          </>
        )}
      </div>
    </section>
  );
}
