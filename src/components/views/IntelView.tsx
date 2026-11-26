import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Camera,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Layers3,
  MessageSquare,
  ScrollText,
  SearchCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineTag, WorkspaceHeader } from '@/components/ui/WorkspaceHeader';
import {
  EVIDENCE_KIND_LABEL,
  EVIDENCE_SOURCE_LABEL,
  VERIFICATION_META,
} from '@/data/gameConfig';
import { CONTRADICTION_BY_ID, EVIDENCE_BY_ID, EVIDENCE_CARDS } from '@/data/evidence';
import { FEED_POST_BY_ID } from '@/data/feed';
import { NPC_BY_ID } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { Evidence, EvidenceKind } from '@/types';
import { cn } from '@/utils/cn';
import { formatStamp } from '@/utils/format';

const KIND_ICON: Record<EvidenceKind, typeof FileText> = {
  screenshot: ImageIcon,
  document: FileText,
  log: ScrollText,
  chat: MessageSquare,
  photo: Camera,
  record: ClipboardList,
};

const GROUP_ORDER = ['cg-deadline', 'cg-gathering', 'cg-recheck', 'cg-lab'];

function EvidenceDetail({ evidence }: { evidence: Evidence }) {
  const focusPost = useUiStore((state) => state.focusPost);
  const group = evidence.contradictionGroupId
    ? CONTRADICTION_BY_ID[evidence.contradictionGroupId]
    : undefined;
  const verification = VERIFICATION_META[evidence.verification];
  const Icon = KIND_ICON[evidence.kind];

  return (
    <div className="px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
            material / {evidence.id}
          </p>
          <h2 className="mt-1.5 text-base font-medium tracking-wide text-ink">{evidence.title}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <InlineTag tone={evidence.accessLevel === 'redteam' ? 'warning' : 'muted'}>
            {evidence.accessLevel === 'redteam' ? '红队视图' : '学生可见'}
          </InlineTag>
          <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            <Icon size={10} />
            {EVIDENCE_KIND_LABEL[evidence.kind]}
          </span>
        </div>
      </div>

      <p className="mt-4 border-l border-primary/30 pl-3 text-[12px] leading-[1.9] text-secondary/95">
        {evidence.summary}
      </p>

      <p className="mt-4 text-[11px] leading-[1.9] text-secondary/80">{evidence.detail}</p>

      <div className="mt-5 grid grid-cols-1 gap-px border border-line/60 bg-line/40 sm:grid-cols-2">
        <div className="bg-surface-2/70 px-3 py-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">来源</p>
          <p className="mt-1 text-[11px] text-ink/90">{evidence.sourceLabel}</p>
          <p className="mt-0.5 font-mono text-[8px] text-muted">
            {EVIDENCE_SOURCE_LABEL[evidence.sourceType]}
          </p>
        </div>
        <div className="bg-surface-2/70 px-3 py-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">发布时间</p>
          <p className="mt-1 font-mono text-[11px] tabular-nums text-ink/90">
            {formatStamp(evidence.publishedAt)}
          </p>
          <p className="mt-0.5 font-mono text-[8px] text-muted">演练时间线 · 固定</p>
        </div>
        <div className="bg-surface-2/70 px-3 py-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">核验状态</p>
          <p className="mt-1 text-[11px] text-ink/90">{verification.label}</p>
          <p className="mt-1 text-[9px] leading-relaxed text-muted">{verification.hint}</p>
        </div>
        <div className="bg-surface-2/70 px-3 py-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">关联人物</p>
          <p className="mt-1 text-[11px] text-ink/90">
            {evidence.relatedNpcIds.map((id) => NPC_BY_ID[id]?.name ?? id).join(' · ')}
          </p>
          <p className="mt-1 font-mono text-[8px] text-muted">人物档案可查看权限范围</p>
        </div>
      </div>

      {group && (
        <div className="mt-4 border border-line/60 bg-surface-2/40 px-3.5 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">事项束</p>
            <span className="font-mono text-[8px] text-muted">
              {String(GROUP_ORDER.indexOf(group.id) + 1).padStart(2, '0')} / 04
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-ink/90">{group.title}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-secondary/80">{group.question}</p>
          <p className="mt-2 text-[9px] leading-relaxed text-muted">
            该材料与 {group.evidenceIds.length} 份材料、{group.postIds.length} 条动态涉及同一事项。
            关联功能将在 Phase 2 开放。
          </p>
        </div>
      )}

      <div className="mt-5">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">关联动态</p>
        <div className="mt-2 space-y-1.5">
          {evidence.relatedPostIds.map((postId) => {
            const post = FEED_POST_BY_ID[postId];
            if (!post) return null;
            return (
              <button
                key={postId}
                type="button"
                onClick={() => focusPost(postId)}
                className="group flex w-full items-center justify-between gap-3 border border-line/50 bg-surface/30 px-3 py-2 text-left transition-colors hover:border-primary/35 hover:bg-surface/60"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] text-secondary">
                    {post.authorName} · {formatStamp(post.publishedAt)}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted">{post.content}</span>
                </span>
                <ArrowUpRight
                  size={11}
                  className="shrink-0 text-muted transition-colors group-hover:text-primary"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {evidence.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 border border-dashed border-line/60 px-3 py-2.5">
        <p className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
          <SearchCheck size={11} className="text-primary/70" />
          next phase
        </p>
        <p className="mt-1 text-[9px] leading-relaxed text-muted">
          证据之间的显式连线、假设提出与矛盾验证将在 Phase 2 提供。当前版本可归档、比对来源与跳回原始动态。
        </p>
      </div>
    </div>
  );
}

export default function IntelView() {
  const collectedIds = useGameStore((state) => state.collectedEvidenceIds);
  const setView = useUiStore((state) => state.setView);
  const [selectedId, setSelectedId] = useState<string>('');

  const collected = useMemo(
    () =>
      collectedIds
        .map((id) => EVIDENCE_BY_ID[id])
        .filter((item): item is Evidence => Boolean(item)),
    [collectedIds],
  );

  useEffect(() => {
    if (collected.length === 0) {
      setSelectedId('');
      return;
    }
    if (!collected.some((item) => item.id === selectedId)) {
      setSelectedId(collected[0].id);
    }
  }, [collected, selectedId]);

  const selected = EVIDENCE_BY_ID[selectedId];
  const coveredGroups = new Set(
    collected.map((item) => item.contradictionGroupId).filter(Boolean) as string[],
  );

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceHeader
        eyebrow="act i / evidence board"
        title="情报关联板"
        meta={<InlineTag tone="primary">ARCHIVE</InlineTag>}
        description="归档材料保留原始来源与时间戳。先看时间线和权限范围，再决定它是否仍然成立。"
        actions={
          <>
            <InlineTag>
              归档 {collected.length} / {EVIDENCE_CARDS.length}
            </InlineTag>
            <InlineTag>
              覆盖事项 {coveredGroups.size} / 4
            </InlineTag>
            <Button size="sm" variant="ghost" onClick={() => setView('feed')}>
              前往动态墙
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-1.5 border-b border-line/50 px-5 py-2.5">
        {EVIDENCE_CARDS.map((card, index) => {
          const filled = collectedIds.includes(card.id);
          return (
            <span
              key={card.id}
              title={filled ? card.title : '尚未归档'}
              className={cn(
                'h-1 flex-1 border',
                filled ? 'border-primary/50 bg-primary/60' : 'border-line/60 bg-surface-2',
              )}
            >
              <span className="sr-only">材料 {index + 1}</span>
            </span>
          );
        })}
        <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
          evidence slots
        </span>
      </div>

      {collected.length === 0 ? (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
          <span className="pointer-events-none absolute select-none font-mono text-[180px] font-semibold leading-none text-surface/40">
            0/10
          </span>
          <div className="relative max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-line/80 bg-surface/60 text-secondary">
              <Layers3 size={24} />
            </div>
            <h2 className="mt-5 text-lg font-light tracking-wide text-ink">证据库还是空的</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-secondary/85">
              动态墙中带有「含材料」标记的条目可以归档。归档不消耗行动点，也不代表材料已经被核验。
            </p>
            <div className="mt-6 grid grid-cols-1 gap-px border border-line/60 bg-line/40 text-left sm:grid-cols-3">
              {[
                ['01', '打开动态', '在动态墙选择一条含材料的动态。'],
                ['02', '归档材料', '查看来源与时间后，存入证据库。'],
                ['03', '回来比对', '把不同来源放进同一条时间线。'],
              ].map(([index, title, text]) => (
                <div key={index} className="bg-surface-2/70 px-3 py-3">
                  <p className="font-mono text-[9px] text-primary/70">{index}</p>
                  <p className="mt-1 text-[11px] text-ink/90">{title}</p>
                  <p className="mt-1 text-[9px] leading-relaxed text-muted">{text}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" className="mt-6" onClick={() => setView('feed')}>
              打开动态墙
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="min-w-0 xl:border-r xl:border-line/50">
            <div className="border-b border-line/50 px-4 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
              archived · {collected.length}
            </div>
            {collected.map((item, index) => {
              const active = item.id === selectedId;
              const Icon = KIND_ICON[item.kind];
              const verification = VERIFICATION_META[item.verification];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'flex w-full gap-3 border-b border-line/40 border-l-2 px-4 py-3.5 text-left transition-colors',
                    active
                      ? 'border-l-primary bg-primary/[0.035]'
                      : 'border-l-transparent hover:bg-surface/40',
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-line/70 bg-surface-2/60 font-mono text-[9px] text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <Icon size={10} className="text-secondary/70" />
                      <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                        {EVIDENCE_KIND_LABEL[item.kind]}
                      </span>
                    </span>
                    <span className={cn('mt-1 block text-[11px]', active ? 'text-primary' : 'text-ink')}>
                      {item.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[9px] text-secondary/80">{item.sourceLabel}</span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="border border-line/60 px-1 py-px font-mono text-[7px] tracking-[0.06em] text-secondary">
                        {verification.label}
                      </span>
                      <span className="font-mono text-[8px] text-muted">
                        {formatStamp(item.publishedAt)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
            <div className="px-4 py-3 text-[9px] leading-relaxed text-muted/70">
              显示顺序为归档顺序。核验状态不代表「正确」或「错误」，只描述来源与时间线的可核对程度。
            </div>
          </div>

          <div className="min-w-0">
            <div className="sticky top-0 max-h-[calc(100vh-140px)] overflow-y-auto">
              {selected && <EvidenceDetail evidence={selected} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
