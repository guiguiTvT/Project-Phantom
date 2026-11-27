import { ArrowLeft, ChevronDown, RotateCcw, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { ENDING_BY_ID } from '@/data/endings';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { CASE_HOTSPOTS, CASE_META, VN_EVIDENCE } from '../data/evidence';
import { ENDING_ADVICE, PHASE_END } from '../data/story';
import { worldReading } from '../engine/DefenseEngine';
import { readPersona, selectPersonaEvidence } from '../engine/PersonaEngine';
import { useVnStore } from '../store/vnStore';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

const DIM_META = {
  evidence: { label: '证据 / 直觉', positive: '偏爱可核对的材料', negative: '更依赖现场直觉' },
  caution: { label: '谨慎 / 主动', positive: '先确认再行动', negative: '先行动再修正' },
  protection: { label: '保护 / 运行', positive: '优先降低风险', negative: '优先保持运行' },
  system: { label: '系统 / 关系', positive: '倾向规则与流程', negative: '倾向人与人协调' },
} as const;

const WORLD_META = [
  { key: 'security', label: '安全' },
  { key: 'operation', label: '秩序' },
  { key: 'relations', label: '关系' },
  { key: 'repair', label: '修复' },
] as const;

export function CompleteScene() {
  const vn = useVnStore();
  const resetVn = useVnStore((state) => state.resetVn);
  const startCase = useVnStore((state) => state.startCase);

  const ending = (vn.endingId ? ENDING_BY_ID[vn.endingId] : undefined) ?? ENDING_BY_ID.ending_unresolved;
  const persona = readPersona(vn);
  const basis = selectPersonaEvidence(vn.personaEvents, 3);
  const reading = worldReading(vn.world);
  const evidenceTotal = VN_EVIDENCE.filter((item) => item.collectible).length;
  const displayCode = persona.dims
    .map((dim) => `${dim.letter}${dim.insufficient ? '?' : ''}`)
    .join('');
  const advice = (
    ending.id ? ENDING_ADVICE[ending.id] : undefined
  ) ?? '先把已经确认的风险写成清单，再决定下一步。';
  const personaAdvice = persona.advice[0];
  const endingArt =
    (ASSETS.endings as Record<string, string>)[ending.id] ?? ASSETS.endings.ending_unresolved;
  const personaArt =
    (ASSETS.personality as Record<string, string>)[persona.code ?? 'ECPS'] ??
    ASSETS.personality.ECPS;

  const replay = () => {
    sfx.select();
    resetVn();
    startCase();
    window.scrollTo({ top: 0 });
  };

  const toCover = () => {
    sfx.click();
    resetVn();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="vn-frame px-3 pb-5 pt-3 sm:px-6 sm:pt-5">
      <StageFrame
        bg={ASSETS.cover}
        className="w-full"
        bgClassName="scale-105 blur-[2px] brightness-[0.52]"
      >
        <div className="flex justify-center p-3 py-5 sm:p-6">
          <div className="w-full max-w-[620px] animate-vn-rise rounded-[22px] border border-white/50 bg-vn-paper/[0.97] p-5 text-vn-ink shadow-vnPaper sm:p-7">
            <div className="flex items-center gap-3 text-[9px] tracking-[0.26em] text-vn-quiet">
              <span className="h-px w-6 bg-vn-amber" />
              {PHASE_END.kicker}
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-vn-quiet" style={{ color: ending.themeColor }}>
                  {ending.code}
                </div>
                <h1 className="mt-1 text-[28px] font-black leading-tight tracking-[0.03em] sm:text-[34px]">
                  {ending.nameCn}
                  <span className="ml-2 align-middle text-[11px] font-medium tracking-[0.16em] text-vn-quiet">
                    {ending.nameEn}
                  </span>
                </h1>
              </div>
              <span
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]"
                style={{ borderColor: `${ending.themeColor}66`, color: ending.themeColor }}
              >
                {ending.order.toString().padStart(2, '0')}
              </span>
            </div>

            <p className="mt-3 text-[13px] leading-6 text-vn-ink/80">{ending.summary}</p>
            <p className="mt-2 text-[12px] leading-6 text-vn-ink/65">{ending.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {ending.keySignals.map((signal) => (
                <span key={signal} className="rounded-full border border-vn-ink/12 bg-white/55 px-2.5 py-1 text-[9px] text-vn-ink/60">
                  {signal}
                </span>
              ))}
            </div>

            <img
              src={endingArt}
              alt={`${ending.nameCn}结局插画`}
              loading="lazy"
              className="mt-3 aspect-[16/9] w-full rounded-xl border border-vn-ink/10 object-cover"
            />

            <div className="my-4 h-px w-full bg-vn-line/70" />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[9px] tracking-[0.22em] text-vn-quiet">
                  <span className="h-px w-4 bg-vn-ink/25" />
                  暂定 Phantom Type
                </div>
                <span className="rounded-full border border-vn-amber/45 bg-vn-amber/10 px-2 py-0.5 text-[9px] text-[#96673B]">
                  {persona.insufficientDims.length > 0 ? '部分维度依据不足' : '依据本局行为'}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <img
                  src={personaArt}
                  alt={`${persona.nameCn}人格插画`}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-xl border border-vn-ink/10 object-cover sm:h-24 sm:w-24"
                />
                <div className="flex min-w-0 flex-wrap items-end gap-2">
                  <span className="font-mono text-[26px] font-bold leading-none tracking-[0.14em]">{displayCode}</span>
                  <span className="pb-0.5 text-[13px] font-medium">{persona.nameCn}</span>
                  <span className="pb-0.5 text-[10px] tracking-[0.12em] text-vn-quiet">{persona.nameEn}</span>
                </div>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-vn-ink/65">{persona.tagline}</p>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {persona.dims.map((dim) => {
                  const meta = DIM_META[dim.dim];
                  const status = dim.insufficient
                    ? '依据不足'
                    : dim.mixed
                      ? '倾向不明显'
                      : Math.abs(dim.normalized) >= 0.5
                        ? '倾向明显'
                        : '略有倾向';
                  return (
                    <div
                      key={dim.dim}
                      className={clsx(
                        'rounded-lg border px-2 py-1.5',
                        dim.insufficient ? 'border-dashed border-vn-ink/20 bg-black/[0.02]' : 'border-vn-ink/10 bg-white/50',
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-mono text-[13px] font-semibold">{dim.insufficient ? `${dim.letter}?` : dim.letter}</span>
                        <span className="text-[8px] text-vn-quiet">{status}</span>
                      </div>
                      <div className="mt-0.5 text-[8px] tracking-[0.06em] text-vn-quiet">{meta.label}</div>
                      <div className="mt-0.5 truncate text-[8px] text-vn-ink/55">
                        {dim.normalized >= 0 ? meta.positive : meta.negative}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(persona.insufficientDims.length > 0 || persona.mixedDims.length > 0) && (
                <p className="mt-1.5 text-[9px] leading-4 text-vn-quiet">
                  {persona.insufficientDims.length > 0 && '? = 样本不足，按字母方向暂定。'}
                  {persona.mixedDims.length > 0 && ' 倾向不明显不作强结论。'}
                </p>
              )}
            </div>

            <div className="my-4 h-px w-full bg-vn-line/70" />

            <div>
              <div className="text-[9px] tracking-[0.22em] text-vn-quiet">三条行为依据</div>
              <ol className="mt-2 space-y-2">
                {basis.map((event, index) => (
                  <li key={event.id} className="rounded-xl border border-vn-ink/10 bg-white/50 px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[9px] text-vn-amber">{String(index + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1 text-[11px] font-medium leading-5">{event.action}</span>
                      <span className="shrink-0 text-[8px] tracking-[0.06em] text-vn-quiet">{event.node}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-5 text-vn-ink/65">
                      {event.choice} · {event.rationale}
                    </p>
                    {event.effects.length > 0 && (
                      <p className="mt-0.5 text-[9px] leading-4 text-vn-quiet">{event.effects.join(' / ')}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-xl border border-vn-sage/40 bg-vn-sage/10 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] text-[#4F6F68]">
                <ShieldCheck className="h-3.5 w-3.5" />
                给下一次的防守建议
              </div>
              <p className="mt-1 text-[11px] leading-5 text-vn-ink/80">{advice}</p>
              {personaAdvice && <p className="mt-1 text-[10px] leading-5 text-vn-ink/55">{personaAdvice}</p>}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {WORLD_META.map(({ key, label }) => (
                <div key={key} className="rounded-lg border border-vn-ink/10 bg-white/50 px-2 py-1.5">
                  <div className="text-[8px] tracking-[0.12em] text-vn-quiet">{label}</div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="font-mono text-[13px] font-semibold">{vn.world[key]}</span>
                    <span className="text-[8px] text-vn-quiet">{reading[key]}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 flex items-center justify-between text-[9px] text-vn-quiet">
              <span>
                材料 {vn.collectedEvidenceIds.length}/{evidenceTotal} · 矛盾 {vn.contradictions.length} 条 · 行为记录{' '}
                {vn.personaEvents.length} 条
              </span>
              <span>现场线索 {vn.foundHotspotIds.length}/{CASE_HOTSPOTS.length}</span>
            </p>

            <details className="group mt-3 rounded-xl border border-vn-ink/10 bg-white/40">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[10px] tracking-[0.14em] text-vn-quiet">
                展开本局完整记录（{vn.log.length} 条）
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <ol className="max-h-40 space-y-1.5 overflow-y-auto border-t border-vn-line/60 px-3 py-2.5">
                {vn.log.map((entry) => (
                  <li key={entry.id} className="text-[9px] leading-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-vn-ink/80">{entry.label}</span>
                      {entry.apDelta !== 0 && (
                        <span className="font-mono text-[8px] text-vn-alert">{entry.apDelta} 资源</span>
                      )}
                    </div>
                    <p className="text-vn-quiet">{entry.detail}</p>
                  </li>
                ))}
              </ol>
            </details>

            <div className="mt-4 rounded-xl border border-dashed border-vn-ink/15 px-3 py-2.5 text-[10px] leading-5 text-vn-quiet">
              {PHASE_END.body}
              <br />
              {PHASE_END.next}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <VnButton variant="ink" size="md" onClick={replay}>
                <RotateCcw className="h-3.5 w-3.5" />
                重新体验
              </VnButton>
              <VnButton variant="ghost" size="md" onClick={toCover}>
                <ArrowLeft className="h-3.5 w-3.5" />
                返回封面
              </VnButton>
              <span className="ml-auto text-[9px] tracking-[0.1em] text-vn-quiet/70">{CASE_META.caseNo}</span>
            </div>
          </div>
        </div>
      </StageFrame>

      <p className="mt-3 text-center text-[10px] leading-5 tracking-[0.08em] text-vn-paper/35">
        {PHASE_END.disclaimer}
      </p>
    </div>
  );
}
