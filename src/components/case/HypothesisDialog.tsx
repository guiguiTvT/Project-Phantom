import { useState } from 'react';
import { AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { CaseDialog } from '@/components/case/CaseDialog';
import { HYPOTHESES } from '@/data/investigation';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { HypothesisId } from '@/types';
import { cn } from '@/utils/cn';

export function HypothesisDialog({
  onClose,
  onCompleted,
}: {
  onClose: () => void;
  onCompleted: () => void;
}) {
  const submitCaseHypothesis = useGameStore((state) => state.submitCaseHypothesis);
  const pushToast = useUiStore((state) => state.pushToast);
  const [selected, setSelected] = useState<HypothesisId | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!selected) return;
    const result = submitCaseHypothesis(selected);
    if (!result.ok) {
      setError(result.message);
      pushToast({
        tone: 'danger',
        title: '这条假设还解释不了全部线索',
        description: '看看反馈，再换一条试试。',
      });
      return;
    }
    pushToast({
      tone: 'success',
      title: '初步假设已记录',
      description: '调查阶段完成，等待进入验证阶段。',
    });
    onClose();
    onCompleted();
  }

  return (
    <CaseDialog
      eyebrow="第 4 步 · 形成假设"
      title="官方说没有补录，转发却在催。你怎么解释？"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-quiet px-3 text-[11px]">
            再想想
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!selected}
            className="btn btn-primary px-5 text-[11px]"
          >
            <Check size={13} />
            记录这条假设
          </button>
        </>
      }
    >
      <p className="text-[12.5px] leading-relaxed text-secondary">
        选择一条最能同时解释 E2、E4 和 E7 的判断。选错也没关系，系统会告诉你它漏掉了什么。
      </p>

      <div className="mt-4 space-y-2">
        {HYPOTHESES.map((hypothesis, index) => {
          const active = selected === hypothesis.id;
          return (
            <button
              key={hypothesis.id}
              type="button"
              data-hypothesis={hypothesis.id}
              onClick={() => {
                setSelected(hypothesis.id);
                setError(null);
              }}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                active
                  ? 'border-primary/45 bg-primary/[0.07] shadow-[0_0_24px_rgba(82,214,208,0.07)]'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.035]',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]',
                  active
                    ? 'border-primary bg-primary text-[#062022]'
                    : 'border-white/15 text-muted',
                )}
              >
                {active ? <Check size={12} /> : String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-[13.5px] font-medium', active ? 'text-ink' : 'text-ink/85')}>
                  {hypothesis.title}
                </span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-secondary/75">
                  {hypothesis.summary}
                </span>
              </span>
              <ChevronRight
                size={14}
                className={cn('mt-1 shrink-0 transition-colors', active ? 'text-primary' : 'text-muted/40')}
              />
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/[0.06] p-3.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-[11.5px] font-medium text-danger">这条解释还缺一块</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-danger/80">{error}</p>
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] leading-relaxed text-muted">
        假设来自你已归档的线索，不消耗行动点。
      </p>
    </CaseDialog>
  );
}
