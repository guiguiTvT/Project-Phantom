import { ArrowRight, Lock, LogIn, ShieldHalf, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineTag, WorkspaceHeader } from '@/components/ui/WorkspaceHeader';
import { ACTIONS } from '@/data/actions';
import { NPCS } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

const DEFENSE_ACTIONS = ACTIONS.filter(
  (action) => action.phase === 'defense' || (action.phase === 'both' && action.cost > 0),
);

const CARRY_OVER = [
  '世界状态：安全 / 运行 / 关系 / 修复',
  '已归档证据与证据关联',
  'NPC 关系与记忆标记',
  '已触发事件与行为日志',
  '四维人格累计值',
  '随机种子与回合计数',
];

const CHANGE_ITEMS = [
  '全局观察权限被收回',
  '红队专属材料不可见',
  '行动点重置为 10',
  '界面切换为学生社交风格',
  '可执行动作变为防御协调类',
];

export default function DefenseView() {
  const phase = useGameStore((state) => state.phase);
  const setView = useUiStore((state) => state.setView);
  const openModal = useUiStore((state) => state.openModal);

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceHeader
        eyebrow="act ii / defense console"
        title="防御控制台"
        meta={<InlineTag tone="warning">PHASE 4</InlineTag>}
        description="身份反转后，你将失去全局观察权限，但保留前半段造成的世界状态。这个模块将承载学生视角下的核实、协调与恢复动作。"
        actions={
          <>
            <InlineTag tone="warning">
              <Lock size={9} /> 未解锁
            </InlineTag>
            <InlineTag>当前 · {phase === 'redteam' ? 'RED TEAM' : phase.toUpperCase()}</InlineTag>
          </>
        }
      />

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 border-b border-line/50 xl:border-b-0 xl:border-r">
          <div className="p-5">
            <div className="corner-frame border border-line/70 bg-surface-2/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-warning">
                    identity reversal / preview
                  </p>
                  <h2 className="mt-2 text-xl font-light tracking-[0.08em] text-ink">
                    你不是唯一的观察者。
                  </h2>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-danger/80">
                    PHANTOM 观察权限已关闭
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center border border-danger/30 bg-danger/[0.06] text-danger">
                  <ShieldHalf size={22} />
                </div>
              </div>

              <div className="mt-7 space-y-0">
                {[
                  {
                    tag: 'NOW',
                    title: 'ACT I · 授权调查',
                    text: '拥有全局关系图、红队材料与隔离沙箱。行动点 12。',
                    state: 'current',
                  },
                  {
                    tag: 'TRIGGER',
                    title: 'REVERSAL · 权限失效',
                    text: '完成至少 2 次有效风险验证并主动结束，或行动点耗尽。',
                    state: 'next',
                  },
                  {
                    tag: 'THEN',
                    title: 'ACT II · 学生视角',
                    text: '面对共享世界状态的后果，行动点 10，处理校园事务。',
                    state: 'future',
                  },
                ].map((step, index, list) => (
                  <div key={step.tag} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < list.length - 1 && (
                      <span className="absolute left-[7px] top-4 h-full w-px bg-line/70" />
                    )}
                    <span
                      className={cn(
                        'relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border',
                        step.state === 'current'
                          ? 'border-primary bg-primary/70'
                          : step.state === 'next'
                            ? 'border-warning bg-warning/20'
                            : 'border-line bg-surface',
                      )}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                          {step.tag}
                        </span>
                        <span className="text-[12px] text-ink">{step.title}</span>
                        {step.state === 'current' && <InlineTag tone="primary">you are here</InlineTag>}
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-secondary/80">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="border border-line/60 bg-surface/30 p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-primary/70">
                  carries over
                </p>
                <ul className="mt-2 space-y-1.5">
                  {CARRY_OVER.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[10px] text-secondary/90">
                      <span className="mt-[5px] h-1 w-1 shrink-0 bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-line/60 bg-surface/30 p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-warning/80">
                  what changes
                </p>
                <ul className="mt-2 space-y-1.5">
                  {CHANGE_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[10px] text-secondary/90">
                      <span className="mt-[5px] h-1 w-1 shrink-0 bg-warning/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 border border-line/50 bg-surface-2/30 px-4 py-3">
              <p className="flex items-center gap-2 text-[10px] text-secondary">
                <Users size={12} className="text-primary/70" />
                反转后，{NPCS.length} 名联系人的关系、情绪与已知信息仍会保留，但学生身份只能看到权限范围内的部分。
              </p>
            </div>
          </div>
        </section>

        <aside className="min-w-0 bg-surface-2/20">
          <div className="border-b border-line/50 px-4 py-3">
            <p className="eyebrow">available actions</p>
            <p className="mt-1 text-[12px] text-ink">防御动作预览</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] leading-relaxed text-muted">
              这些动作会在 Phase 4 成为可用的防御控制台操作。顺序与资源分配由你决定，不会以固定问答呈现。
            </p>
            <div className="mt-3 space-y-1.5">
              {DEFENSE_ACTIONS.map((action) => (
                <div key={action.id} className="border border-line/40 bg-surface/30 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-secondary">{action.label}</span>
                    <span className="font-mono text-[8px] text-muted">{action.cost} AP</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{action.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" size="sm" onClick={() => setView('feed')} leading={<ArrowRight size={12} />}>
                回到动态墙继续调查
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openModal('briefing')} leading={<LogIn size={12} />}>
                查看反转与结算说明
              </Button>
            </div>
            <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.14em] text-muted/60">
              module gated · phase 4
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
