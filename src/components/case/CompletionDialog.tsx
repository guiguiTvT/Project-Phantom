import { motion } from 'framer-motion';
import { Check, Layers, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { CaseDialog } from '@/components/case/CaseDialog';
import {
  CASE_EVIDENCE_BY_ID,
  HYPOTHESES,
} from '@/data/investigation';
import { useGameStore } from '@/stores/gameStore';

export function CompletionDialog({
  onClose,
  onRestart,
}: {
  onClose: () => void;
  onRestart: () => void;
}) {
  const investigation = useGameStore((state) => state.investigation);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const hypothesis = HYPOTHESES.find((item) => item.id === investigation.hypothesisId);
  const pinnedCodes = investigation.pinnedEvidenceIds
    .map((id) => CASE_EVIDENCE_BY_ID[id]?.exhibitCode)
    .filter(Boolean);

  return (
    <CaseDialog
      eyebrow="调查阶段 · 完成"
      title="你已经抓住第一条裂缝"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onRestart} className="btn btn-quiet px-3 text-[11px]">
            重开本案
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary px-5 text-[11px]">
            留在调查现场
          </button>
        </>
      }
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.055] p-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(82,214,208,0.14),transparent_65%)]"
        />
        <motion.span
          className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/35 bg-primary/[0.12] text-primary"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Check size={24} />
        </motion.span>
        <p className="relative mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-primary/80">
          CASE 01 · 调查阶段完成
        </p>
        <h3 className="relative mt-1.5 text-[20px] font-light tracking-wide text-ink">
          调查阶段完成，等待进入验证阶段
        </h3>
        <p className="relative mx-auto mt-2 max-w-[38ch] text-[12px] leading-relaxed text-secondary">
          你没有被那条「今晚截止」的通知带着走，而是把它和官方公告放在了一起。
          初步判断已记录，下一步是把这条假设交给验证。
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="case-inset p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-muted">
            <Layers size={11} />
            并排的线索
          </div>
          <p className="mt-2 text-[12px] text-ink/90">
            {pinnedCodes.length > 0 ? pinnedCodes.join(' · ') : '—'}
          </p>
        </div>
        <div className="case-inset p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-muted">
            <MessageSquare size={11} />
            已联系
          </div>
          <p className="mt-2 text-[12px] text-ink/90">
            {investigation.contactedNpcIds.length > 0
              ? investigation.contactedNpcIds.map((id) => (id === 'npc_zhouning' ? '周宁' : '林夏')).join(' · ')
              : '—'}
          </p>
        </div>
        <div className="case-inset p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-muted">
            <Sparkles size={11} />
            剩余行动点
          </div>
          <p className="mt-2 text-[12px] text-ink/90">{actionPoints}</p>
        </div>
        <div className="case-inset p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-muted">
            <ShieldCheck size={11} />
            下一阶段
          </div>
          <p className="mt-2 text-[12px] text-secondary">验证阶段 · 待开放</p>
        </div>
      </div>

      {hypothesis && (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary/80">你的初步假设</p>
          <p className="mt-1.5 text-[13.5px] font-medium text-ink">{hypothesis.title}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary/80">{hypothesis.feedback}</p>
        </div>
      )}

      <p className="mt-4 text-center font-mono text-[9px] leading-relaxed text-muted">
        本次调查只影响虚构沙箱。验证阶段将在下一阶段开发中开放。
      </p>
    </CaseDialog>
  );
}
