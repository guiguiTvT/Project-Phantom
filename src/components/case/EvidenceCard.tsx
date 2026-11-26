import { Check, FileText, Image as ImageIcon, MessageSquare, Plus, ScrollText } from 'lucide-react';
import type { CaseEvidence } from '@/types';
import { cn } from '@/utils/cn';
import { formatStamp } from '@/utils/format';
import { KIND_LABEL, VERIFY_META, VERIFY_TONE_CLASS } from './labels';

const KIND_ICON = {
  chat: MessageSquare,
  screenshot: ImageIcon,
  document: ScrollText,
  log: FileText,
  photo: ImageIcon,
  record: FileText,
} as const;

export function EvidenceCard({
  evidence,
  viewed,
  pinned,
  highlighted,
  onOpen,
  onPin,
}: {
  evidence: CaseEvidence;
  viewed: boolean;
  pinned: boolean;
  highlighted?: boolean;
  onOpen: (evidenceId: string) => void;
  onPin: (evidenceId: string) => void;
}) {
  const KindIcon = KIND_ICON[evidence.kind];
  const verify = VERIFY_META[evidence.verification];

  return (
    <article
      draggable
      data-evidence-id={evidence.id}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', evidence.id);
        event.dataTransfer.effectAllowed = 'copy';
      }}
      className={cn(
        'case-card interactive-card group relative flex h-full cursor-grab flex-col overflow-hidden active:cursor-grabbing',
        pinned && 'border-primary/25',
        highlighted && !viewed && 'guide-strong animate-breathe border-primary/35',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          pinned ? 'bg-primary/50' : 'bg-white/[0.04]',
        )}
      />

      <button
        type="button"
        onClick={() => onOpen(evidence.id)}
        className="flex flex-1 flex-col p-4 text-left sm:p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/[0.08] px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-primary">
            <KindIcon size={11} />
            {evidence.exhibitCode}
          </span>
          {viewed ? (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-primary/70">
              <Check size={10} />
              已读
            </span>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {KIND_LABEL[evidence.kind]}
            </span>
          )}
        </div>

        {highlighted && !viewed && (
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
            从这里开始 · start here
          </p>
        )}

        <h3 className="mt-2 text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-white">
          {evidence.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-secondary/80">
          {evidence.hook}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.04em]',
              VERIFY_TONE_CLASS[verify.tone],
            )}
          >
            {verify.label}
          </span>
          <span className="font-mono text-[9px] tracking-[0.04em] text-muted">
            {formatStamp(evidence.publishedAt)}
          </span>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] px-4 py-2.5">
        <span className="truncate font-mono text-[9px] text-muted" title={evidence.sourceLabel}>
          {evidence.sourceType === 'official' ? '官方渠道' : evidence.sourceType === 'anonymous' ? '匿名来源' : '个人来源'}
        </span>
        {pinned ? (
          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] text-primary">
            <Check size={10} />
            已在情报板
          </span>
        ) : (
          <button
            type="button"
            data-pin-evidence={evidence.id}
            onClick={() => onPin(evidence.id)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] px-2 py-1 font-mono text-[9px] text-secondary transition-colors hover:border-primary/35 hover:text-primary"
            title="放入情报板（不消耗行动点）"
          >
            <Plus size={10} />
            情报板
          </button>
        )}
      </div>
    </article>
  );
}
