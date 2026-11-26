import {
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  Lock,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineTag, WorkspaceHeader } from '@/components/ui/WorkspaceHeader';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

const RISK_MARKERS = [
  { label: '时间线漂移', text: '同一事项存在多个相互冲突的有效时间。' },
  { label: '来源孤证', text: '关键说法只有单一来源，且无法独立复核。' },
  { label: '权限交叉', text: '角色的可见范围与操作范围不再一致。' },
  { label: '传播压力', text: '未核实的解释比公告更快地扩散。' },
  { label: '流程断裂', text: '正式变更与线下传达之间存在缺口。' },
  { label: '关系误读', text: '信任关系被当作信息可靠性的替代证据。' },
];

export default function SimulationView() {
  const collected = useGameStore((state) => state.collectedEvidenceIds.length);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const setView = useUiStore((state) => state.setView);

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceHeader
        eyebrow="act i / simulation bay"
        title="风险模拟舱"
        meta={<InlineTag tone="warning">PHASE 2</InlineTag>}
        description="在隔离环境中对抽象风险标记进行推演。这里不会生成任何现实可用的操作步骤、链接或凭据信息。"
        actions={
          <>
            <InlineTag tone="warning">
              <Lock size={9} /> 待校准
            </InlineTag>
            <InlineTag>AP {actionPoints}</InlineTag>
          </>
        }
      />

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 border-b border-line/50 xl:border-b-0 xl:border-r">
          <div className="relative overflow-hidden p-5">
            <div className="grid-field pointer-events-none absolute inset-0 opacity-60" />
            <div className="corner-frame relative border border-line/70 bg-surface-2/50">
              <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FlaskConical size={14} className="text-primary/70" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-secondary">
                    simulation bay / 01
                  </span>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-warning">
                  <CircleDashed size={10} /> standby
                </span>
              </div>

              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center border border-line bg-surface text-muted">
                  <Lock size={22} />
                  <span className="absolute inset-0 animate-ping border border-primary/10" />
                </div>
                <h2 className="mt-5 text-lg font-light tracking-[0.1em] text-ink">模拟舱待校准</h2>
                <p className="mt-2 max-w-md text-[11px] leading-relaxed text-secondary/85">
                  风险模拟、行动点扣除与抽象风险状态将在 Phase 2 实现。当前构建不会假装执行一次并不存在的推演。
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                  <span className="border border-line/60 px-2 py-1">每次 2 AP</span>
                  <span className="border border-line/60 px-2 py-1">至少 2 次有效验证</span>
                  <span className="border border-line/60 px-2 py-1">隔离沙箱</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px border-t border-line/60 bg-line/40 sm:grid-cols-3">
                {[
                  { title: '场景镜像', value: 'OFFLINE', note: '虚拟活动流程' },
                  { title: '风险标记', value: '0 / 6', note: '抽象状态位' },
                  { title: '权限差异', value: 'STANDBY', note: '角色可见范围' },
                ].map((cell) => (
                  <div key={cell.title} className="bg-surface-2/70 px-3 py-3">
                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
                      {cell.title}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] tracking-[0.1em] text-secondary">
                      {cell.value}
                    </p>
                    <p className="mt-1 text-[9px] text-muted">{cell.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border border-line/50 bg-surface/30 px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
              <span className="flex items-center gap-1.5 text-primary/70">
                <ShieldAlert size={11} /> 抽象风险标记
              </span>
              <span>无现实可用输出</span>
              <span>无真实链接 / 凭据 / 个人</span>
              <span className="flex items-center gap-1.5">
                <Timer size={11} /> 20:00–22:00 维护窗口
              </span>
            </div>
          </div>
        </section>

        <aside className="min-w-0 bg-surface-2/20">
          <div className="border-b border-line/50 px-4 py-3">
            <p className="eyebrow">readiness</p>
            <p className="mt-1 text-[12px] text-ink">进入条件</p>
          </div>
          <div className="px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-line/40 pb-2">
                <span className="text-[10px] text-secondary">行动点</span>
                <span className="font-mono text-[11px] text-primary">{actionPoints} / 12</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/40 pb-2">
                <span className="text-[10px] text-secondary">已归档材料</span>
                <span className="font-mono text-[11px] text-secondary">{collected} / 10</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/40 pb-2">
                <span className="text-[10px] text-secondary">有效风险验证</span>
                <span className="font-mono text-[11px] text-muted">Phase 2 启用</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-secondary">沙箱窗口</span>
                <span className="font-mono text-[10px] text-warning">20:00–22:00</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                可推演的抽象标记
              </p>
              <div className="mt-2 space-y-1.5">
                {RISK_MARKERS.map((marker) => (
                  <div key={marker.label} className="border border-line/40 bg-surface/30 px-3 py-2">
                    <p className="text-[10px] text-secondary">{marker.label}</p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{marker.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border border-line/50 bg-surface/30 px-3 py-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">隔离守则</p>
              <ul className="mt-2 space-y-1.5 text-[9px] leading-relaxed text-muted">
                <li className="flex gap-1.5">
                  <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-primary/60" />
                  只对虚构校园镜像执行抽象推演。
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-primary/60" />
                  结果仅改变内部风险状态，不生成现实可用内容。
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-primary/60" />
                  所有行动点扣除与世界状态变化由规则引擎决定。
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="ghost" size="sm" onClick={() => setView('intel')}>
                前往证据库
              </Button>
              <Button variant="primary" size="sm" onClick={() => setView('feed')}>
                回到动态墙等待校准
              </Button>
            </div>
            <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.14em] text-muted/60">
              module gated · phase 2
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
