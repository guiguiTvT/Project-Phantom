import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  FileText,
  Pin,
  Search,
  X,
} from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { Button } from '@/components/ui/Button';
import { ModalShell } from '@/components/ui/Modal';
import { InlineTag, WorkspaceHeader } from '@/components/ui/WorkspaceHeader';
import {
  CHANNELS,
  CHANNEL_LABEL,
  EVIDENCE_KIND_LABEL,
  EVIDENCE_SOURCE_LABEL,
  VERIFICATION_META,
} from '@/data/gameConfig';
import { FEED_POSTS } from '@/data/feed';
import { EVIDENCE_BY_ID, PRIMARY_EVIDENCE_FOR_POST } from '@/data/evidence';
import { NPC_BY_ID } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { AuthorRole, FeedChannel, FeedPost } from '@/types';
import { cn } from '@/utils/cn';
import { formatStamp } from '@/utils/format';

const ROLE_LABEL: Record<AuthorRole, string> = {
  student: '学生',
  teacher: '教师',
  staff: '管理员',
  system: '系统',
  anonymous: '匿名',
};

const CHANNEL_TONE: Record<FeedChannel, string> = {
  club: 'text-primary/80',
  notice: 'text-ink/70',
  life: 'text-secondary',
  study: 'text-secondary',
  treehole: 'text-muted',
  system: 'text-primary/60',
};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : true,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function EvidencePreview({ post }: { post: FeedPost }) {
  const collected = useGameStore((state) => state.collectedEvidenceIds);
  const collectEvidence = useGameStore((state) => state.collectEvidence);
  const pushToast = useUiStore((state) => state.pushToast);
  const setView = useUiStore((state) => state.setView);

  const evidenceId = PRIMARY_EVIDENCE_FOR_POST[post.id];
  if (!evidenceId) {
    return (
      <div className="border border-dashed border-line/70 px-3.5 py-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">no linked material</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-secondary/80">
          这条动态没有可直接归档的材料。它仍然可能与其他信息存在交叉——调查工具不会替你标注真假。
        </p>
      </div>
    );
  }

  const card = EVIDENCE_BY_ID[evidenceId];
  if (!card) return null;
  const archived = collected.includes(evidenceId);
  const verification = VERIFICATION_META[card.verification];

  return (
    <div className="border border-line/70 bg-surface-2/60">
      <div className="flex items-center justify-between border-b border-line/60 px-3 py-2">
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
          linked material
        </span>
        <InlineTag tone={card.accessLevel === 'redteam' ? 'warning' : 'muted'}>
          {card.accessLevel === 'redteam' ? '红队视图' : EVIDENCE_KIND_LABEL[card.kind]}
        </InlineTag>
      </div>
      <div className="p-3.5">
        <p className="text-[12px] text-ink">{card.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[8px] text-muted">
          <span>{EVIDENCE_SOURCE_LABEL[card.sourceType]}</span>
          <span>·</span>
          <span>{card.sourceLabel}</span>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-secondary/90">{card.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="border border-line/70 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.08em] text-secondary">
            核验状态 · {verification.label}
          </span>
          <span className="font-mono text-[8px] text-muted">{formatStamp(card.publishedAt)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={archived ? 'ghost' : 'primary'}
            disabled={archived}
            onClick={() => {
              const result = collectEvidence(evidenceId);
              if (result.ok) {
                pushToast({
                  title: '已归档到情报板',
                  description: '归档不消耗行动点，也不代表核验完成。',
                  tone: 'success',
                });
              } else {
                pushToast({ title: '未能归档', description: result.message, tone: 'warning' });
              }
            }}
            leading={<FileText size={12} />}
          >
            {archived ? '已在证据库' : '归档材料 · 0 AP'}
          </Button>
          {archived && (
            <button
              type="button"
              onClick={() => setView('intel')}
              className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-primary/80 transition-colors hover:text-primary"
            >
              前往情报板 <ArrowUpRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function PostDetail({ post }: { post: FeedPost }) {
  return (
    <div className="p-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted">stream detail</p>
      <div className="mt-3 flex items-start gap-3">
        <SigilAvatar avatarId={NPC_AVATAR(post.authorId)} size={42} name={post.authorName} muted={post.authorRole === 'anonymous'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[13px] text-ink">{post.authorName}</span>
            <InlineTag>{ROLE_LABEL[post.authorRole]}</InlineTag>
          </div>
          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            {CHANNEL_LABEL[post.channel]} · {formatStamp(post.publishedAt)}
          </p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-[12px] leading-[1.9] text-ink/90">{post.content}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="my-4 h-px bg-line/60" />
      <EvidencePreview post={post} />

      <div className="mt-4 border border-line/50 bg-surface-2/30 px-3 py-2.5">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">verification note</p>
        <p className="mt-1 text-[10px] leading-relaxed text-secondary/80">
          归档只记录来源与时间，不改变信息的可信度。请在情报板中结合其他材料比对时间线与权限范围。
        </p>
      </div>

      <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
        ref · {post.id} / fictional mirror
      </p>
    </div>
  );
}

function NPC_AVATAR(authorId: string): string {
  return NPC_BY_ID[authorId]?.avatarId ?? `post-${authorId}`;
}

export default function FeedView() {
  const [channel, setChannel] = useState<'all' | FeedChannel>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(FEED_POSTS[FEED_POSTS.length - 1]?.id ?? '');
  const [detailOpen, setDetailOpen] = useState(false);
  const isWide = useMediaQuery('(min-width: 1280px)');
  const collectedCount = useGameStore((state) => state.collectedEvidenceIds.length);
  const pendingPostId = useUiStore((state) => state.pendingPostId);
  const clearPendingPost = useUiStore((state) => state.clearPendingPost);

  const posts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...FEED_POSTS]
      .filter((post) => (channel === 'all' ? true : post.channel === channel))
      .filter((post) =>
        needle
          ? `${post.authorName}${post.content}${post.tags.join('')}`.toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [channel, query]);

  useEffect(() => {
    if (posts.length === 0) return;
    if (!posts.some((post) => post.id === selectedId)) {
      setSelectedId(posts[0].id);
    }
  }, [posts, selectedId]);

  useEffect(() => {
    if (!pendingPostId) return;
    setSelectedId(pendingPostId);
    if (!isWide) setDetailOpen(true);
    clearPendingPost();
  }, [pendingPostId, isWide, clearPendingPost]);

  const selected = FEED_POSTS.find((post) => post.id === selectedId) ?? posts[0] ?? FEED_POSTS[0];

  const handleSelect = (post: FeedPost) => {
    setSelectedId(post.id);
    if (!isWide) setDetailOpen(true);
  };

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceHeader
        eyebrow="act i / investigation"
        title="校园动态墙"
        meta={<InlineTag tone="primary">PUBLIC MIRROR</InlineTag>}
        description="浏览公开频道的只读镜像。这里没有被标记为“正确”的信息，只有来源、时间与彼此之间的缝隙。"
        actions={
          <>
            <InlineTag>归档 {collectedCount} / 10</InlineTag>
            <InlineTag>动态 {FEED_POSTS.length}</InlineTag>
          </>
        }
      />

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_370px]">
        <section className="min-w-0 xl:border-r xl:border-line/50">
          <div className="sticky top-0 z-10 border-b border-line/50 bg-background/92 px-4 py-2.5 backdrop-blur">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button
                  type="button"
                  onClick={() => setChannel('all')}
                  className={cn('chip shrink-0', channel === 'all' && 'chip-active')}
                >
                  全部
                </button>
                {CHANNELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChannel(item.id)}
                    className={cn('chip shrink-0', channel === item.id && 'chip-active')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 lg:w-56 lg:flex-none">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="检索动态 / 作者 / 标签"
                    className="w-full border border-line/70 bg-surface-2/60 py-1.5 pl-7 pr-7 text-[10px] text-ink placeholder:text-muted/70 focus:border-primary/50 focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                      aria-label="清除检索"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
                <span className="hidden font-mono text-[8px] tracking-[0.1em] text-muted sm:inline">
                  {posts.length} 条
                </span>
              </div>
            </div>
          </div>

          <div>
            {posts.length === 0 && (
              <div className="px-5 py-16 text-center">
                <p className="text-[12px] text-secondary">没有匹配的动态。</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setChannel('all');
                  }}
                  className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:underline"
                >
                  清除筛选条件
                </button>
              </div>
            )}

            {posts.map((post) => {
              const active = selectedId === post.id;
              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => handleSelect(post)}
                  className={cn(
                    'group flex w-full gap-3 border-b border-line/40 border-l-2 px-4 py-4 text-left transition-colors',
                    active
                      ? 'border-l-primary bg-primary/[0.035]'
                      : 'border-l-transparent hover:bg-surface/40',
                  )}
                >
                  <SigilAvatar
                    avatarId={NPC_AVATAR(post.authorId)}
                    size={36}
                    name={post.authorName}
                    muted={post.authorRole === 'anonymous'}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className={cn('text-[12px]', active ? 'text-primary' : 'text-ink')}>
                        {post.authorName}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
                        {ROLE_LABEL[post.authorRole]}
                      </span>
                      <span className={cn('text-[9px]', CHANNEL_TONE[post.channel])}>
                        {CHANNEL_LABEL[post.channel]}
                      </span>
                      <span className="font-mono text-[8px] tabular-nums text-muted/80">
                        {formatStamp(post.publishedAt)}
                      </span>
                      {post.pinned && (
                        <span className="flex items-center gap-0.5 font-mono text-[8px] text-primary/70">
                          <Pin size={9} /> 置顶
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block text-[12px] leading-[1.8] text-secondary/95 line-clamp-3">
                      {post.content}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="font-mono text-[8px] text-muted">
                          #{tag}
                        </span>
                      ))}
                      {PRIMARY_EVIDENCE_FOR_POST[post.id] && (
                        <span className="ml-auto flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.08em] text-secondary/70">
                          <FileText size={10} />
                          含材料
                        </span>
                      )}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={13}
                    className={cn(
                      'mt-1 shrink-0 transition-colors',
                      active ? 'text-primary' : 'text-muted/40 group-hover:text-secondary',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3 font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
            end of public mirror · 所有内容均为虚构演练数据
          </div>
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-0 max-h-[calc(100vh-84px)] overflow-y-auto">
            {selected && <PostDetail post={selected} />}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {detailOpen && selected && (
          <ModalShell
            eyebrow="stream detail"
            title="动态详情"
            width="max-w-xl"
            onClose={() => setDetailOpen(false)}
          >
            <PostDetail post={selected} />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
