import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownToLine, Check, Clock3, Eye, Link2, Users, X } from 'lucide-react';
import { NPC_BY_ID } from '@/data/npcs';
import type { CaseEvidence } from '@/types';
import { cn } from '@/utils/cn';
import { formatStamp } from '@/utils/format';
import { KIND_LABEL, VERIFY_META, VERIFY_TONE_CLASS } from './labels';

export function EvidenceDrawer({
  evidence,
  pinned,
  onClose,
  onPin,
}: {
  evidence: CaseEvidence | null;
  pinned: boolean;
  onClose: () => void;
  onPin: (evidenceId: string) => void;
}) {
  useEffect(() => {
    if (!evidence) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [evidence, onClose]);

  const verify = evidence ? VERIFY_META[evidence.verification] : null;

  return createPortal(
    <AnimatePresence>
      {evidence && verify && (
        <>
          <motion.button
            type="button"
            aria-label="关闭材料详情"
            className="fixed inset-0 z-[94] cursor-default bg-background/72 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${evidence.exhibitCode} ${evidence.title}`}
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-[480px] flex-col border-l border-white/[0.08] bg-[#0f1722] shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.09] font-mono text-[13px] text-primary">
                  {evidence.exhibitCode}
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                    关键材料 · {KIND_LABEL[evidence.kind]}
                  </p>
                  <p className="mt-1 text-[12px] text-secondary">{evidence.sourceLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="rounded-full border border-transparent p-1.5 text-muted transition-colors hover:border-white/10 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 font-mono text-[9px] tracking-[0.04em]',
                    VERIFY_TONE_CLASS[verify.tone],
                  )}
                >
                  {verify.label}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted">
                  <Clock3 size={10} />
                  {formatStamp(evidence.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted">
                  <Eye size={10} />
                  {evidence.accessLevel === 'public' ? '公开材料' : '红队材料'}
                </span>
              </div>

              <h2 className="mt-3.5 text-[23px] font-light leading-snug tracking-wide text-ink">
                {evidence.title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-primary/85">{evidence.hook}</p>

              <div className="mt-5 rounded-xl border border-warning/20 bg-warning/[0.05] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-warning/80">
                  关键问题
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/90">{evidence.keyQuestion}</p>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">摘要</p>
                <p className="mt-2 text-[13px] leading-7 text-secondary">{evidence.summary}</p>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">材料正文</p>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-7 text-secondary/90">
                  {evidence.detail}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {evidence.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-2">
                <div className="case-inset flex items-start gap-2.5 p-3">
                  <Link2 size={13} className="mt-0.5 shrink-0 text-muted" />
                  <p className="text-[11px] leading-relaxed text-secondary/80">{evidence.sourceLabel}</p>
                </div>
                <div className="case-inset flex items-start gap-2.5 p-3">
                  <Users size={13} className="mt-0.5 shrink-0 text-muted" />
                  <p className="text-[11px] leading-relaxed text-secondary/80">
                    相关人员：
                    {evidence.relatedNpcIds
                      .map((id) => NPC_BY_ID[id]?.name)
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-t border-white/[0.06] bg-background/40 px-5 py-4">
              {pinned ? (
                <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] px-4 py-3 text-[12px] text-primary">
                  <Check size={14} />
                  已在情报板上
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPin(evidence.id)}
                  className="cta flex-1 py-3 text-[13px]"
                >
                  <ArrowDownToLine size={15} />
                  放入情报板
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost h-[46px] px-4 text-[11px]"
              >
                关闭
              </button>
            </div>
            <p className="px-5 pb-3 text-center font-mono text-[9px] text-muted">
              放入情报板不消耗行动点 · 最多并排 3 条线索
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
