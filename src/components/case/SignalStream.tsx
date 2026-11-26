import { ArrowUpRight, Radio, Sparkles } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { getFeaturedPosts } from '@/data/investigation';
import { NPC_BY_ID } from '@/data/npcs';
import { formatStamp } from '@/utils/format';

export function SignalStream({ onOpenEvidence }: { onOpenEvidence: (evidenceId: string) => void }) {
  const posts = getFeaturedPosts();

  return (
    <section className="case-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-primary" />
          <h2 className="text-[14px] font-medium tracking-wide text-ink">现场动态</h2>
          <span className="chip border-white/[0.06] px-2 py-0.5 text-[9px]">本案相关 · 3 条</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          click to inspect
        </span>
      </div>

      <div className="mt-3 divide-y divide-white/[0.05]">
        {posts.map(({ signal, post }) => {
          const npc = NPC_BY_ID[post.authorId];
          const evidence = signal.exhibitId.toUpperCase().replace('KE-0', 'E').replace('KE-', 'E');
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => onOpenEvidence(signal.exhibitId)}
              className="group flex w-full items-start gap-3 py-3 text-left transition-colors first:pt-2 last:pb-1"
            >
              {npc ? (
                <SigilAvatar avatarId={npc.avatarId} name={npc.name} size={30} className="rounded-lg" />
              ) : (
                <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06] text-primary">
                  <Sparkles size={13} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-[11.5px] font-medium text-ink/90">{post.authorName}</span>
                  <span className="font-mono text-[9px] text-muted">{signal.note}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-secondary/80">
                  {post.content}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] text-primary/70 group-hover:text-primary">
                  关联 {evidence}
                  <ArrowUpRight size={10} />
                </span>
              </div>
              <span className="shrink-0 font-mono text-[9px] text-muted">{formatStamp(post.publishedAt)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
