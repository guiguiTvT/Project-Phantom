import { clsx } from 'clsx';
import { Check, FileText, Lock, X } from 'lucide-react';
import { useEffect } from 'react';
import { VERIFICATION_LABEL } from '../data/evidence';
import type { VnEvidence } from '../types';

export function verificationClass(verification: VnEvidence['verification']) {
  if (verification === 'verified') return 'border-vn-sage/60 bg-vn-sage/15 text-vn-sage';
  if (verification === 'pending') return 'border-vn-amber/60 bg-vn-amber/15 text-[#A97747]';
  return 'border-vn-quiet/40 bg-black/[0.04] text-vn-quiet';
}

interface EvidenceModalProps {
  evidence: VnEvidence;
  archived?: boolean;
  onClose: () => void;
}

export function EvidenceModal({ evidence, archived = false, onClose }: EvidenceModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-vn-night/80 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[92svh] w-full max-w-3xl animate-vn-rise overflow-y-auto rounded-[22px] border border-white/15 bg-vn-card text-vn-ink shadow-vn">
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭材料"
          className="absolute right-3 top-3 z-20 rounded-full bg-vn-night/55 p-2 text-vn-paper/85 transition hover:bg-vn-night/80 hover:text-vn-paper"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[1.08fr_1fr]">
          <div className="relative aspect-[4/3] bg-vn-stage md:aspect-auto md:min-h-[360px]">
            {evidence.image ? (
              <img
                src={evidence.image}
                alt={evidence.title}
                className="absolute inset-0 h-full w-full object-contain p-3"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-vn-paper/40">
                <FileText className="h-12 w-12" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-vn-night/55 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="rounded-sm bg-vn-night/75 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-vn-paper/85">
                材料 {evidence.id}
              </span>
              <span className="rounded-sm bg-vn-night/55 px-2 py-1 text-[10px] text-vn-paper/70">
                {evidence.time}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] tracking-[0.1em]', verificationClass(evidence.verification))}>
                  {VERIFICATION_LABEL[evidence.verification]}
                </span>
                <span className="text-[10px] tracking-[0.12em] text-vn-quiet">
                  {archived ? '归档副本' : '现场材料'}
                </span>
              </div>
              <h2 className="mt-3 text-[20px] font-semibold leading-snug sm:text-[22px]">{evidence.title}</h2>
              <p className="mt-1 text-[11px] tracking-[0.06em] text-vn-quiet">来源：{evidence.source}</p>
              <div className="my-4 h-px w-full bg-vn-line/70" />
              <p className="text-[14px] leading-7 text-vn-ink/85">{evidence.description}</p>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 rounded-xl border border-vn-sage/40 bg-vn-sage/10 px-4 py-3 text-[12px] text-[#4F6F68]">
                <Check className="h-4 w-4 shrink-0" />
                {archived ? '已导出的归档副本，可在防御阶段继续使用。' : '已收进证据包，可在质询时出示。'}
              </div>
              {archived && (
                <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-vn-quiet">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  原系统访问权限已收回，此副本只读。
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full rounded-xl px-4 py-2 text-[12px] text-vn-quiet transition hover:text-vn-ink"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
