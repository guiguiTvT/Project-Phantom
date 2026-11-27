import { clsx } from 'clsx';
import { ArrowRight, BatteryLow, ChevronRight, MessageSquare, ShieldQuestion } from 'lucide-react';
import { sfx } from '../audio/sound';
import { DEFENSE_DECISIONS, NPC_BY_ID } from '../data/story';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import { CharacterSprite } from '../ui/CharacterSprite';
import { DialogueBox } from '../ui/DialogueBox';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

const WORLD_LABEL = {
  security: '安全',
  operation: '秩序',
  relations: '关系',
  repair: '修复',
} as const;

export function DefenseScene() {
  const defensePlan = useVnStore((state) => state.defensePlan);
  const defenseIndex = useVnStore((state) => state.defenseIndex);
  const defenseFeedback = useVnStore((state) => state.defenseFeedback);
  const world = useVnStore((state) => state.world);
  const ap = useVnStore((state) => state.ap);
  const chooseDefenseOption = useVnStore((state) => state.chooseDefenseOption);
  const advanceDefense = useVnStore((state) => state.advanceDefense);
  const showNotice = useVnUi((state) => state.showNotice);

  const decisionId = defensePlan[defenseIndex];
  const decision = decisionId ? DEFENSE_DECISIONS[decisionId] : null;
  if (!decision) return null;

  const npc = NPC_BY_ID[decision.npcId];
  const chosen = defenseFeedback
    ? decision.options.find((option) => option.id === defenseFeedback.optionId) ?? null
    : null;
  const last = defenseIndex >= defensePlan.length - 1;

  const choose = (optionId: string) => {
    const result = chooseDefenseOption(decision.id, optionId);
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  const next = () => {
    const result = advanceDefense();
    if (result.ok) {
      sfx.flip();
      if (result.state.scene === 'complete') sfx.complete();
    } else {
      showNotice(result.message);
    }
  };

  return (
    <div className="vn-frame px-3 pb-5 pt-3 sm:px-6 sm:pt-5">
      <StageFrame
        bg={decision.bg}
        className="aspect-[4/3] w-full sm:aspect-[16/8]"
        bgClassName="brightness-[0.62] saturate-[0.72]"
      >
        <CharacterSprite npc={decision.npcId} emotion={chosen ? 'confused' : 'neutral'} className="left-[68%] h-[92%] sm:left-[72%]" dimmed />

        <div className="absolute inset-x-3 top-3 flex items-center justify-between sm:inset-x-5 sm:top-4">
          <div className="rounded-full border border-white/15 bg-vn-night/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">{decision.kicker}</span>
            <span className="mx-2 text-vn-paper/25">·</span>
            <span className="text-[11px] text-vn-paper/90">{decision.title}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-vn-night/55 px-2.5 py-1.5 text-[9px] tracking-[0.1em] text-vn-paper/55 backdrop-blur-sm">
            <BatteryLow className="h-3 w-3" />
            剩余资源 {ap}
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-4">
          <div className="flex max-w-[380px] items-start gap-2.5 rounded-xl border border-white/15 bg-vn-night/78 px-3 py-2.5 backdrop-blur-md">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vn-amber/15 text-vn-amber">
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-vn-paper/90">{decision.notification.from}</span>
                {decision.notification.time && (
                  <span className="font-mono text-[8px] text-vn-paper/35">{decision.notification.time}</span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] leading-5 text-vn-paper/60">{decision.notification.text}</p>
            </div>
          </div>
        </div>
      </StageFrame>

      <div className="mt-3 rounded-2xl border border-white/60 bg-vn-paper/[0.97] p-4 text-vn-ink shadow-vnPaper sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {defensePlan.map((id, index) => (
              <span
                key={id}
                className={clsx(
                  'h-1.5 rounded-full transition-all',
                  index === defenseIndex ? 'w-6 bg-vn-ink' : index < defenseIndex ? 'w-1.5 bg-vn-ink/45' : 'w-1.5 bg-vn-ink/15',
                )}
              />
            ))}
            <span className="ml-1 font-mono text-[9px] tracking-[0.12em] text-vn-quiet">
              {defenseIndex + 1} / {defensePlan.length}
            </span>
          </div>
          <span className="text-[9px] tracking-[0.12em] text-vn-quiet">没有标准答案 · 只记实际处置</span>
        </div>

        {!chosen ? (
          <>
            <h2 className="mt-2 text-[19px] font-bold leading-snug sm:text-[22px]">{decision.title}</h2>
            <p className="mt-1.5 text-[12px] leading-6 text-vn-ink/70">{decision.description}</p>

            <div className="mt-3.5 space-y-2">
              {decision.options.map((option) => {
                const affordable = ap >= option.cost;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    disabled={!affordable}
                    className={clsx(
                      'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                      affordable
                        ? 'border-vn-ink/12 bg-white/60 hover:border-vn-ink/30 hover:bg-white'
                        : 'cursor-not-allowed border-vn-ink/8 bg-black/[0.03] opacity-45',
                    )}
                    title={affordable ? undefined : '剩余资源不足'}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-vn-ink/15 font-mono text-[9px] text-vn-ink/55">
                      {String(option.cost).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[13px] font-medium">{option.label}</span>
                        <span className="text-[9px] tracking-[0.08em] text-vn-quiet">
                          消耗 {option.cost} 资源
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-5 text-vn-quiet">{option.summary}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-vn-quiet/50 transition group-hover:text-vn-ink" />
                  </button>
                );
              })}
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-4 text-vn-quiet">
              <ShieldQuestion className="mt-0.5 h-3 w-3 shrink-0" />
              代价不同，结果选择后才揭晓。
            </p>
          </>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-vn-ink/15 bg-white/60 px-2.5 py-1 text-[10px] text-vn-ink/70">
                已选择 · {chosen.label}
              </span>
              <span className="text-[9px] text-vn-quiet">消耗 {chosen.cost} 资源</span>
            </div>

            <div className="mt-6">
              <DialogueBox
                name={npc.name}
                role={npc.role}
                text={chosen.feedback}
                emotion="confused"
                actions={
                  <VnButton variant="ink" size="md" onClick={next}>
                    {last ? '进入临时结算' : '继续下一项'}
                    <ArrowRight className="h-3 w-3" />
                  </VnButton>
                }
              />
            </div>

            <div className="mt-3 rounded-xl border border-vn-ink/10 bg-white/50 px-3 py-2.5">
              <div className="text-[9px] tracking-[0.18em] text-vn-quiet">后续</div>
              <p className="mt-1 text-[11px] leading-5 text-vn-ink/75">{chosen.aftermath}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(['security', 'operation', 'relations', 'repair'] as const).map((key) => {
                  const diff = chosen.effects[key];
                  return (
                    <span
                      key={key}
                      className={clsx(
                        'flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px]',
                        diff > 0
                          ? 'border-vn-sage/45 bg-vn-sage/10 text-[#4F6F68]'
                          : diff < 0
                            ? 'border-vn-alert/30 bg-vn-alert/[0.07] text-[#A66269]'
                            : 'border-vn-ink/10 text-vn-quiet',
                      )}
                    >
                      {WORLD_LABEL[key]}
                      <span>{diff > 0 ? `+${diff}` : diff}</span>
                      <span className="text-vn-quiet/70">→ {world[key]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[10px] tracking-[0.1em] text-vn-paper/35">
        学生身份 · 有限次处置
      </p>
    </div>
  );
}
