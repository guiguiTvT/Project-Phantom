import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, CircleAlert, Play, ScanEye, ShieldQuestion } from 'lucide-react';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { HYPOTHESES, NPC_BY_ID, STATEMENT_BY_ID } from '../data/story';
import { useVnSettings } from '../store/settingsStore';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import type { HypothesisId } from '../types';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

const HYPOTHESIS_ORDER: HypothesisId[] = ['H1', 'H2', 'H3'];

const WORLD_LABEL = {
  security: '安全',
  operation: '秩序',
  relations: '关系',
  repair: '修复',
} as const;

export function SimulationScene() {
  const hypothesisId = useVnStore((state) => state.simulationHypothesis);
  const simulation = useVnStore((state) => state.simulationResult);
  const contradictions = useVnStore((state) => state.contradictions);
  const world = useVnStore((state) => state.world);
  const ap = useVnStore((state) => state.ap);
  const selectHypothesis = useVnStore((state) => state.selectHypothesis);
  const runSimulation = useVnStore((state) => state.runSimulation);
  const enterReversal = useVnStore((state) => state.enterReversal);
  const showNotice = useVnUi((state) => state.showNotice);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);

  const [before, setBefore] = useState(world);
  const [lit, setLit] = useState(0);

  const activeId = hypothesisId ?? 'H1';
  const active = HYPOTHESES[activeId];
  const verifiedIds = Array.from(new Set(contradictions.map((item) => item.hypothesis)));
  const activeVerified = verifiedIds.includes(activeId);
  const nodes = simulation?.nodes ?? active.simulation.nodes;
  const done = Boolean(simulation) && lit >= nodes.length;
  const spend = Math.min(2, ap);

  useEffect(() => {
    if (!simulation) {
      setLit(0);
      return;
    }
    if (reduceMotion) {
      setLit(simulation.nodes.length);
      return;
    }
    let index = 0;
    setLit(0);
    const timer = window.setInterval(() => {
      index += 1;
      setLit(index);
      if (index >= simulation.nodes.length) window.clearInterval(timer);
    }, 460);
    return () => window.clearInterval(timer);
  }, [simulation, reduceMotion]);

  const choose = (id: HypothesisId) => {
    if (simulation) return;
    sfx.flip();
    selectHypothesis(id);
    setLit(0);
  };

  const run = () => {
    setBefore(world);
    const result = runSimulation();
    if (!result.ok) {
      showNotice(result.message);
      return;
    }
    sfx.select();
    if (result.simulation?.confidence === 'low') showNotice('缺少矛盾支撑，风险按未确认处理。');
  };

  const finish = () => {
    const result = enterReversal();
    if (result.ok) sfx.complete();
    else showNotice(result.message);
  };

  return (
    <div className="vn-frame px-3 pb-5 pt-3 sm:px-6 sm:pt-5">
      <StageFrame
        bg={ASSETS.activityRoom}
        className="w-full sm:aspect-video"
        bgClassName="brightness-[0.36] saturate-[0.55]"
      >
        <div className="relative flex h-full flex-col px-3 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-vn-sage/40 bg-vn-sage/10 px-2.5 py-1 text-[9px] tracking-[0.16em] text-vn-sage">
              红队权限
            </span>
            <span className="text-[9px] tracking-[0.12em] text-vn-paper/35">隔离沙盒 · 虚构节点</span>
          </div>

          <div className="mt-4 grid gap-3 sm:my-auto lg:grid-cols-[1.32fr_1fr]">
            <div className="rounded-2xl border border-white/12 bg-vn-night/55 p-3.5 backdrop-blur-sm sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-vn-amber/85">
                    <ScanEye className="h-3.5 w-3.5" />
                    风险推演
                  </div>
                  <h1 className="mt-1 text-[20px] font-bold tracking-[0.02em] text-vn-paper sm:text-[24px]">
                    假设：{active.title}
                  </h1>
                  <p className="mt-1 max-w-[420px] text-[11px] leading-5 text-vn-paper/55">{active.short}</p>
                </div>
                <span
                  className={clsx(
                    'shrink-0 rounded-full border px-2 py-1 text-[9px] tracking-[0.1em]',
                    activeVerified
                      ? 'border-vn-sage/50 bg-vn-sage/12 text-vn-sage'
                      : 'border-vn-amber/40 bg-vn-amber/10 text-vn-amber',
                  )}
                >
                  {activeVerified ? '有矛盾支撑' : '缺少矛盾'}
                </span>
              </div>

              <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-vn-night/60 p-3">
                <div className="pointer-events-none absolute inset-0 vn-scanlines opacity-25" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(231,107,120,0.16),transparent_62%)]" />
                <div className="relative flex flex-col gap-1.5 sm:flex-row sm:items-center">
                  <span className="pointer-events-none absolute bottom-4 left-4 top-4 w-px bg-white/10 sm:hidden" />
                  <span className="pointer-events-none absolute inset-x-4 top-4 hidden h-px bg-white/10 sm:block" />
                  {nodes.map((node, index) => {
                    const activeNode = Boolean(simulation) && lit > index;
                    return (
                      <div key={node} className="relative flex flex-1 items-center gap-1.5 sm:flex-col sm:gap-2">
                        <div className="flex w-full items-center gap-1.5 sm:flex-col">
                          <span
                            className={clsx(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] transition-all duration-500',
                              activeNode
                                ? 'border-vn-alert/70 bg-vn-alert/20 text-[#F0C3C7] shadow-[0_0_18px_rgba(231,107,120,0.35)]'
                                : 'border-white/20 bg-vn-night text-vn-paper/45',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={clsx(
                              'truncate text-center text-[9px] leading-4 transition-colors duration-500 sm:mt-1',
                              activeNode ? 'text-vn-paper/85' : 'text-vn-paper/40',
                            )}
                          >
                            {node}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] tracking-[0.1em] text-vn-paper/35">
                  <span>{simulation ? (done ? '推演结束' : '展开中…') : '未运行'}</span>
                  <span>{simulation ? `${simulation.confidence === 'high' ? '高' : '低'}置信` : '虚构节点'}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[9px] tracking-[0.18em] text-vn-paper/40">证据依据</div>
                {contradictions.filter((item) => item.hypothesis === activeId).length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {contradictions
                      .filter((item) => item.hypothesis === activeId)
                      .slice(0, 2)
                      .map((item) => (
                        <li key={`${item.statementId}-${item.evidenceId}`} className="flex items-center gap-1.5 text-[10px] leading-4 text-vn-paper/60">
                          <span className="h-1 w-1 rounded-full bg-vn-sage" />
                          {NPC_BY_ID[item.witnessId].name}的陈述 {STATEMENT_BY_ID[item.statementId]?.sceneNo} × {item.evidenceId}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] leading-4 text-vn-amber/70">
                    <CircleAlert className="h-3 w-3 shrink-0" />
                    无可对应矛盾，按未确认处理。
                  </p>
                )}
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[9px] leading-4 text-vn-paper/40">
                  消耗 {spend} 行动点{ap < 2 ? ' · 低置信' : ''}
                </span>
                {simulation ? (
                  <VnButton variant="amber" onClick={finish} disabled={!done}>
                    结束推演
                    <ArrowRight className="h-3 w-3" />
                  </VnButton>
                ) : (
                  <VnButton variant="amber" onClick={run}>
                    <Play className="h-3 w-3" />
                    运行推演 <span className="font-mono text-[9px] opacity-75">-{spend}</span>
                  </VnButton>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-2xl border border-white/12 bg-vn-night/55 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-vn-paper/45">
                  <ShieldQuestion className="h-3.5 w-3.5" />
                  选择假说
                </div>
                <div className="mt-2 space-y-1.5">
                  {HYPOTHESIS_ORDER.map((id) => {
                    const info = HYPOTHESES[id];
                    const selected = id === activeId;
                    const confirmed = verifiedIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => choose(id)}
                        disabled={Boolean(simulation)}
                        className={clsx(
                          'flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition',
                          selected
                            ? 'border-vn-amber/60 bg-vn-amber/10'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/25',
                          simulation && !selected && 'opacity-40',
                        )}
                      >
                        <span
                          className={clsx(
                            'h-2 w-2 shrink-0 rounded-full border',
                            selected ? 'border-vn-amber bg-vn-amber' : 'border-white/30',
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-vn-paper/90">
                          {info.title}
                        </span>
                        <span
                          className={clsx(
                            'shrink-0 rounded-full border px-1.5 py-px text-[8px]',
                            confirmed
                              ? 'border-vn-sage/40 text-vn-sage'
                              : 'border-white/15 text-vn-paper/40',
                          )}
                        >
                          {confirmed ? '已确认' : '未确认'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-vn-night/55 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.18em] text-vn-paper/45">结果</span>
                  {simulation ? (
                    <span
                      className={clsx(
                        'rounded-full border px-2 py-0.5 text-[9px]',
                        simulation.confidence === 'high'
                          ? 'border-vn-sage/50 bg-vn-sage/10 text-vn-sage'
                          : 'border-vn-alert/40 bg-vn-alert/10 text-[#F0C3C7]',
                      )}
                    >
                      {simulation.confidence === 'high' ? '高置信' : '低置信'} · {simulation.verified ? '已确认' : '未确认'}
                    </span>
                  ) : (
                    <span className="text-[9px] tracking-[0.1em] text-vn-paper/35">未运行</span>
                  )}
                </div>

                {!simulation ? (
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['security', 'operation', 'relations', 'repair'] as const).map((key) => (
                        <div key={key} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
                          <div className="text-[8px] tracking-[0.12em] text-vn-paper/35">{WORLD_LABEL[key]}</div>
                          <div className="font-mono text-[13px] text-vn-paper/65">{world[key]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] leading-5 text-vn-paper/70">{simulation.summary}</p>
                    <ul className="space-y-1">
                      {simulation.impact.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-[10px] leading-5 text-vn-paper/55">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-vn-amber/70" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 pt-2">
                      {(['security', 'operation', 'relations', 'repair'] as const).map((key) => {
                        const diff = world[key] - before[key];
                        return (
                          <div key={key} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
                            <div className="text-[8px] tracking-[0.12em] text-vn-paper/35">{WORLD_LABEL[key]}</div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono text-[13px] text-vn-paper/75">{world[key]}</span>
                              {diff !== 0 && (
                                <span className={clsx('font-mono text-[9px]', diff > 0 ? 'text-vn-sage' : 'text-[#E7A0A7]')}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </StageFrame>
    </div>
  );
}
