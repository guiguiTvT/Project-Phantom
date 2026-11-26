import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GripVertical, ShieldAlert } from 'lucide-react';
import { CaseDialog } from '@/components/case/CaseDialog';
import { CaseHeader } from '@/components/case/CaseHeader';
import { CompletionDialog } from '@/components/case/CompletionDialog';
import { ContactRail } from '@/components/case/ContactRail';
import { EvidenceCard } from '@/components/case/EvidenceCard';
import { EvidenceDrawer } from '@/components/case/EvidenceDrawer';
import { HypothesisDialog } from '@/components/case/HypothesisDialog';
import { IntelBoard } from '@/components/case/IntelBoard';
import { SignalStream } from '@/components/case/SignalStream';
import { TaskPanel } from '@/components/case/TaskPanel';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { Button } from '@/components/ui/Button';
import {
  CASE_EVIDENCE_BY_ID,
  KEY_EVIDENCE,
  getGuideStepIndex,
  isHypothesisReady,
} from '@/data/investigation';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export default function OSPage() {
  const player = useGameStore((state) => state.player);
  const investigation = useGameStore((state) => state.investigation);
  const viewCaseEvidence = useGameStore((state) => state.viewCaseEvidence);
  const pinCaseEvidence = useGameStore((state) => state.pinCaseEvidence);
  const restartCase = useGameStore((state) => state.restartCase);
  const backToAuthorization = useGameStore((state) => state.backToAuthorization);
  const pushToast = useUiStore((state) => state.pushToast);

  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!player) {
    return (
      <div className="flex h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface text-danger">
            <ShieldAlert size={26} />
          </div>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.24em] text-muted">no operator</p>
          <h1 className="mt-2 text-xl font-light tracking-wide text-ink">还没有开始调查</h1>
          <p className="mt-2 text-[12px] leading-relaxed text-secondary/85">
            回到授权书，签署沙箱演练授权后即可进入调查。
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={backToAuthorization}
            leading={<ArrowLeft size={13} />}
          >
            返回授权书
          </Button>
          <div className="mt-8 flex items-center justify-center gap-2 text-primary/40">
            <PhantomMark size={28} />
            <span className="font-mono text-[8px] tracking-[0.2em]">SANDBOX STANDBY</span>
          </div>
        </div>
      </div>
    );
  }

  const guideIndex = getGuideStepIndex(
    investigation.viewedEvidenceIds,
    investigation.pinnedEvidenceIds,
    investigation.contactedNpcIds,
    investigation.completed,
  );
  const highlightEvidenceId =
    !investigation.completed && guideIndex === 0
      ? 'ke-02'
      : !investigation.completed && guideIndex === 2
        ? 'ke-07'
        : null;
  const highlightNpcId =
    !investigation.completed && guideIndex === 1 ? 'npc_zhouning' : null;
  const activeEvidence = activeEvidenceId ? CASE_EVIDENCE_BY_ID[activeEvidenceId] ?? null : null;
  const activePinned = activeEvidence
    ? investigation.pinnedEvidenceIds.includes(activeEvidence.id)
    : false;

  function openEvidence(evidenceId: string) {
    const result = viewCaseEvidence(evidenceId);
    if (!result.ok) {
      pushToast({ tone: 'warning', title: result.message });
      return;
    }
    setActiveEvidenceId(evidenceId);
  }

  function pinEvidence(evidenceId: string) {
    const result = pinCaseEvidence(evidenceId);
    pushToast({
      tone: result.ok ? 'success' : 'warning',
      title: result.message,
      description: result.ok ? '线索已并排，注意来源与时间的冲突。' : '每条线索只需要放一次。',
    });
  }

  function openHypothesis() {
    if (investigation.completed) {
      setCompletionOpen(true);
      return;
    }
    const ready = isHypothesisReady(
      investigation.viewedEvidenceIds,
      investigation.pinnedEvidenceIds,
      investigation.contactedNpcIds,
    );
    if (!ready) {
      pushToast({
        tone: 'info',
        title: '还差一点',
        description: '先看 E2、联系周宁，再把至少两条线索放进情报板。',
      });
      return;
    }
    setHypothesisOpen(true);
  }

  function confirmReset() {
    setResetOpen(false);
    setActiveEvidenceId(null);
    setHypothesisOpen(false);
    setCompletionOpen(false);
    restartCase();
  }

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden">
      <CaseHeader />

      <div className="mx-auto grid w-full max-w-[1720px] flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 py-4 xl:grid-cols-[282px_minmax(0,1fr)_334px] xl:overflow-hidden">
        <aside className="min-w-0 xl:h-full xl:overflow-y-auto xl:pr-1">
          <TaskPanel
            guideIndex={guideIndex}
            onOpenEvidence={openEvidence}
            onOpenHypothesis={openHypothesis}
            onReviewCompletion={() => setCompletionOpen(true)}
            onReset={() => setResetOpen(true)}
          />
        </aside>

        <main className="min-w-0 space-y-4 xl:h-full xl:overflow-y-auto xl:pr-1">
          {investigation.completed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-[12.5px] font-medium text-primary">调查阶段完成 · 等待进入验证阶段</p>
                  <p className="mt-0.5 text-[10.5px] text-secondary/75">
                    你的初步假设已经记录，可以继续回顾三份关键材料。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletionOpen(true)}
                className="btn btn-ghost btn-sm shrink-0 border-primary/25 text-primary"
              >
                查看结论
              </button>
            </motion.div>
          )}

          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted"
                >
                  调查台 · 关键材料
                </motion.p>
                <h2 className="mt-1 text-[17px] font-light tracking-wide text-ink">
                  先把三份材料对照起来
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-muted">
                <GripVertical size={11} />
                点击阅读 · 拖入情报板
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {KEY_EVIDENCE.map((evidence) => (
                <EvidenceCard
                  key={evidence.id}
                  evidence={evidence}
                  viewed={investigation.viewedEvidenceIds.includes(evidence.id)}
                  pinned={investigation.pinnedEvidenceIds.includes(evidence.id)}
                  highlighted={highlightEvidenceId === evidence.id}
                  onOpen={openEvidence}
                  onPin={pinEvidence}
                />
              ))}
            </div>
          </section>

          <IntelBoard
            highlighted={!investigation.completed && guideIndex >= 2}
            onOpenHypothesis={openHypothesis}
            onReviewCompletion={() => setCompletionOpen(true)}
          />

          <SignalStream onOpenEvidence={openEvidence} />

          <p className="px-1 pb-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            所有材料与人物均为虚构 · 不连接真实校园系统
          </p>
        </main>

        <aside className="min-w-0 xl:h-full xl:overflow-y-auto xl:pl-1">
          <ContactRail highlightedNpcId={highlightNpcId} />
        </aside>
      </div>

      <EvidenceDrawer
        evidence={activeEvidence}
        pinned={activePinned}
        onClose={() => setActiveEvidenceId(null)}
        onPin={pinEvidence}
      />

      {hypothesisOpen && (
        <HypothesisDialog
          onClose={() => setHypothesisOpen(false)}
          onCompleted={() => setCompletionOpen(true)}
        />
      )}

      {completionOpen && (
        <CompletionDialog
          onClose={() => setCompletionOpen(false)}
          onRestart={() => {
            setCompletionOpen(false);
            setResetOpen(true);
          }}
        />
      )}

      {resetOpen && (
        <CaseDialog
          eyebrow="重开本案"
          title="清空进度，从任务简报重新开始？"
          onClose={() => setResetOpen(false)}
          width="max-w-md"
          footer={
            <>
              <button type="button" onClick={() => setResetOpen(false)} className="btn btn-quiet px-3 text-[11px]">
                取消
              </button>
              <button type="button" onClick={confirmReset} className="btn btn-danger px-4 text-[11px]">
                确认重开
              </button>
            </>
          }
        >
          <p className="text-[12.5px] leading-relaxed text-secondary">
            这会清空已经阅读的材料、情报板线索和初步假设，并返回任务简报。操作不能撤销。
          </p>
        </CaseDialog>
      )}
    </div>
  );
}
