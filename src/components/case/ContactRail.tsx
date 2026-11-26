import { Check, Info, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { CONTACT_HINTS } from '@/data/investigation';
import { NPC_BY_ID } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { Npc } from '@/types';
import { cn } from '@/utils/cn';

function ContactCard({
  npc,
  recommended,
  highlighted,
  contacted,
  cost,
  onContact,
}: {
  npc: Npc;
  recommended?: boolean;
  highlighted?: boolean;
  contacted: boolean;
  cost: number;
  onContact: () => void;
}) {
  return (
    <div
      className={cn(
        'case-card-soft p-3.5 transition-colors',
        highlighted && !contacted && 'guide-strong animate-breathe border-primary/35',
        contacted && 'border-primary/15',
      )}
    >
      <div className="flex items-start gap-3">
        <SigilAvatar avatarId={npc.avatarId} name={npc.name} size={40} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-medium text-ink">{npc.name}</span>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.08] px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.04em] text-primary">
                <Sparkles size={8} />
                推荐先问
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10.5px] text-muted">{npc.role}</p>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-secondary/75">
            {npc.bio}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-muted">
          {contacted ? '本轮提示已获得' : cost > 0 ? `消耗 ${cost} 行动点` : '不消耗行动点'}
        </span>
        {contacted ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 px-2.5 py-1 font-mono text-[9px] text-primary">
            <Check size={10} />
            已联系
          </span>
        ) : (
          <button
            type="button"
            onClick={onContact}
            className="btn btn-primary btn-sm"
            title={`联系${npc.name}`}
          >
            <MessageSquare size={11} />
            问一句
          </button>
        )}
      </div>
    </div>
  );
}

export function ContactRail({ highlightedNpcId }: { highlightedNpcId?: string | null }) {
  const investigation = useGameStore((state) => state.investigation);
  const npcStates = useGameStore((state) => state.npcStates);
  const contactCaseNpc = useGameStore((state) => state.contactCaseNpc);
  const pushToast = useUiStore((state) => state.pushToast);

  const zhou = NPC_BY_ID.npc_zhouning;
  const lin = NPC_BY_ID.npc_linxia;
  const zhouContact = CONTACT_HINTS.npc_zhouning;
  const linContact = CONTACT_HINTS.npc_linxia;

  function contact(npc: Npc, cost: number) {
    const result = contactCaseNpc(npc.id);
    pushToast({
      tone: result.ok ? 'success' : 'warning',
      title: result.message,
      description: result.ok ? '右侧对话与提示已经更新。' : undefined,
    });
    if (result.ok && cost > 0) {
      // 提示玩家这一步的代价，来自引擎返回后的实际状态
      pushToast({ tone: 'info', title: `已消耗 ${cost} 行动点`, description: '行动点由程序扣除，模型无法修改。' });
    }
  }

  const messages = ['npc_zhouning', 'npc_linxia'].flatMap((id) => {
    const npc = NPC_BY_ID[id];
    const history = npcStates[id]?.conversationHistory ?? [];
    return history.map((message) => ({ message, npc }));
  });

  const latest = messages.slice(-4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-secondary">
          可联系的人
        </h2>
        <span className="font-mono text-[9px] text-muted">2 位可联系</span>
      </div>

      <ContactCard
        npc={zhou}
        recommended
        highlighted={highlightedNpcId === zhou.id}
        contacted={investigation.contactedNpcIds.includes(zhou.id)}
        cost={zhouContact.cost}
        onContact={() => contact(zhou, zhouContact.cost)}
      />

      {investigation.contactedNpcIds.includes(zhou.id) && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary/80">
            {zhouContact.hintTitle}
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/85">{zhouContact.hintBody}</p>
        </div>
      )}

      <ContactCard
        npc={lin}
        highlighted={highlightedNpcId === lin.id}
        contacted={investigation.contactedNpcIds.includes(lin.id)}
        cost={linContact.cost}
        onContact={() => contact(lin, linContact.cost)}
      />

      {investigation.contactedNpcIds.includes(lin.id) && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-secondary/80">
            {linContact.hintTitle}
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary">{linContact.hintBody}</p>
        </div>
      )}

      <section className="case-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-secondary">
            最近消息
          </h2>
          <span className="chip border-white/[0.06] px-2 py-0.5 text-[9px]">本机记录</span>
        </div>
        {latest.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-white/[0.08] px-3 py-6 text-center">
            <MessageSquare size={16} className="mx-auto text-muted/60" />
            <p className="mt-2 text-[11px] text-muted">还没有对话</p>
            <p className="mt-1 text-[10px] text-muted/70">先问问周宁，她见过那条通知。</p>
          </div>
        ) : (
          <div className="mt-3 max-h-[216px] space-y-2 overflow-y-auto pr-1">
            {latest.map(({ message, npc }) => (
              <div
                key={message.id}
                className={cn(
                  'rounded-xl px-3 py-2.5',
                  message.role === 'player'
                    ? 'ml-5 border border-primary/15 bg-primary/[0.05]'
                    : 'mr-1 border border-white/[0.06] bg-white/[0.025]',
                )}
              >
                <p className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
                  {message.role === 'player' ? '你' : npc.name}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-secondary/90">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="case-card p-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-secondary">
          系统提示
        </h2>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-primary/70" />
            <p className="text-[10.5px] leading-relaxed text-secondary/80">
              行动点由程序判断与扣除，NPC 与模型都无法修改。
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Info size={12} className="mt-0.5 shrink-0 text-primary/70" />
            <p className="text-[10.5px] leading-relaxed text-secondary/80">
              查看材料与放入情报板不消耗行动点；联系周宁消耗 1 点。
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Info size={12} className="mt-0.5 shrink-0 text-primary/70" />
            <p className="text-[10.5px] leading-relaxed text-secondary/80">
              本演练不连接真实校园系统，也不会要求真实个人信息。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
