import { clsx } from 'clsx';
import { Archive, ArrowUpRight, FileText, Lock, X } from 'lucide-react';
import { useEffect } from 'react';
import { VN_EVIDENCE, VERIFICATION_LABEL } from '../data/evidence';
import { useVnStore } from '../store/vnStore';
import type { VnEvidence, VnEvidenceId } from '../types';
import { verificationClass } from './EvidenceModal';

interface EvidenceInventoryProps {
  open: boolean;
  mode: 'browse' | 'present';
  archived?: boolean;
  onClose: () => void;
  onInspect?: (evidence: VnEvidence) => void;
  onPresent?: (id: VnEvidenceId) => void;
  targetName?: string;
}

export function EvidenceInventory({
  open,
  mode,
  archived = false,
  onClose,
  onInspect,
  onPresent,
  targetName,
}: EvidenceInventoryProps) {
  const collectedIds = useVnStore((state) => state.collectedEvidenceIds);
  const total = VN_EVIDENCE.filter((item) => item.collectible).length;
  const collected = VN_EVIDENCE.filter(
    (item) => item.collectible && collectedIds.includes(item.id),
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button type="button" aria-label="关闭证据包" onClick={onClose} className="absolute inset-0 bg-vn-night/80 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[92svh] w-full max-w-2xl animate-vn-rise flex-col overflow-hidden rounded-[22px] border border-white/15 bg-vn-card text-vn-ink shadow-vn">
        <div className="flex items-start justify-between gap-3 border-b border-vn-line/70 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-vn-quiet">
              <Archive className="h-3.5 w-3.5" />
              {mode === 'present' ? '选择材料' : '证据包'}
            </div>
            <h2 className="mt-1 text-[18px] font-semibold">
              {mode === 'present' ? `向${targetName ?? '对方'}出示` : `已归档材料 ${collected.length} / ${total}`}
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-vn-quiet">
              {mode === 'present'
                ? '出示不消耗资源，判断错误也不中断。'
                : '只显示已发现材料。'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-full p-2 text-vn-quiet transition hover:bg-black/[0.05] hover:text-vn-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {archived && (
          <div className="flex items-center gap-2 border-b border-vn-amber/25 bg-vn-amber/10 px-5 py-2 text-[10px] leading-4 text-[#8E6036] sm:px-6">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            已归档。原件已断开，不能再访问原系统。
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {collected.length === 0 ? (
            <div className="py-10 text-center text-[12px] text-vn-quiet">
              证据包为空，回现场看看。
            </div>
          ) : mode === 'browse' ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {collected.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onInspect?.(item)}
                  className="group flex items-center gap-3 rounded-xl border border-vn-ink/10 bg-white/70 px-3 py-3 text-left transition hover:border-vn-ink/25 hover:bg-white"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-vn-stage">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-vn-paper/50">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium">{item.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-vn-quiet">
                      <span className={clsx('rounded-full border px-1.5 py-px', verificationClass(item.verification))}>
                        {VERIFICATION_LABEL[item.verification]}
                      </span>
                      <span className="truncate">{item.source}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-vn-quiet/60 transition group-hover:text-vn-ink" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {collected.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPresent?.(item.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-vn-ink/10 bg-white/70 px-3 py-2.5 text-left transition hover:border-vn-amber/70 hover:bg-white"
                >
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-vn-stage">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-vn-paper/50">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{item.title}</div>
                    <div className="mt-0.5 truncate text-[10px] text-vn-quiet">
                      {item.source} · {item.time}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-vn-amber/60 bg-vn-amber/15 px-2.5 py-1 text-[10px] text-[#96673B] transition group-hover:bg-vn-amber/25">
                    出示
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-vn-line/70 px-5 py-3 text-[10px] text-vn-quiet sm:px-6">
          <span>本章共 {total} 份材料</span>
          <span>未发现 {total - collected.length} 份 · 不提前展示</span>
        </div>
      </div>
    </div>
  );
}
