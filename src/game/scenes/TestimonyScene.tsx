import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, FileSearch, MessageCircleQuestion, Play, ShieldAlert } from 'lucide-react';
import { sfx } from '../audio/sound';
import {
  CONTRADICTION_COPY,
  HYPOTHESES,
  NPC_BY_ID,
  NPC_LIST,
  RESULT_LABEL,
  WITNESS_BY_NPC,
} from '../data/story';
import { useVnSettings } from '../store/settingsStore';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import type { HypothesisId, PresentationEvaluation } from '../types';
import { CharacterSprite } from '../ui/CharacterSprite';
import { ContradictionOverlay } from '../ui/ContradictionOverlay';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

const FEEDBACK_TONE: Record<PresentationEvaluation['result'], string> = {
  supports: 'border-vn-sage bg-vn-sage/10 text-[#BDD6CF]',
  insufficient: 'border-vn-amber bg-vn-amber/10 text-[#E8C9A8]',
  irrelevant: 'border-white/25 bg-white/[0.06] text-vn-paper/75',
  contradiction: 'border-vn-alert bg-vn-alert/15 text-[#F0C3C7]',
};

export function TestimonyScene() {
  const witnessId = useVnStore((state) => state.witnessId);
  const testimonyIndex = useVnStore((state) => state.testimonyIndex);
  const statementReply = useVnStore((state) => state.statementReply);
  const ap = useVnStore((state) => state.ap);
  const askedStatementIds = useVnStore((state) => state.askedStatementIds);
  const contradictions = useVnStore((state) => state.contradictions);
  const npcDoneIds = useVnStore((state) => state.npcDoneIds);
  const selectWitness = useVnStore((state) => state.selectWitness);
  const setStatement = useVnStore((state) => state.setStatement);
  const askStatementFollowUp = useVnStore((state) => state.askStatementFollowUp);
  const presentEvidence = useVnStore((state) => state.presentEvidence);
  const enterSimulation = useVnStore((state) => state.enterSimulation);
  const startPresent = useVnUi((state) => state.startPresent);
  const showNotice = useVnUi((state) => state.showNotice);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);

  const [feedback, setFeedback] = useState<PresentationEvaluation | null>(null);
  const [overlay, setOverlay] = useState<{ feedback: string; hypothesis: HypothesisId } | null>(null);
  const [flash, setFlash] = useState(false);

  const witness = witnessId ? WITNESS_BY_NPC[witnessId] : null;
  if (!witness) return null;

  const npc = NPC_BY_ID[witness.npcId];
  const statements = witness.statements;
  const statement = statements[testimonyIndex] ?? statements[0];
  const asked = askedStatementIds.includes(statement.id);
  const switchable = NPC_LIST.filter(
    (item) => npcDoneIds.includes(item.id) && Boolean(WITNESS_BY_NPC[item.id]),
  );
  const confirmed = Array.from(new Set(contradictions.map((item) => item.hypothesis)));

  const changeStatement = (next: number) => {
    sfx.flip();
    setStatement(next);
    setFeedback(null);
  };

  const handleAsk = () => {
    const result = askStatementFollowUp();
    if (result.ok) sfx.select();
    showNotice(result.message || '补全了一段证词细节');
  };

  const handlePresent = () => {
    startPresent({
      targetName: `${npc.name}的陈述`,
      onPresent: (evidenceId) => {
        const result = presentEvidence(evidenceId);
        if (!result.ok || !result.evaluation) {
          showNotice(result.message);
          return;
        }
        const evaluation = result.evaluation;
        setFeedback(evaluation);
        if (evaluation.result === 'contradiction' && evaluation.hypothesis) {
          if (evaluation.alreadyFound) {
            showNotice('这条矛盾已经记录过了。');
            return;
          }
          setFlash(true);
          window.setTimeout(() => setFlash(false), reduceMotion ? 0 : 620);
          setOverlay({
            feedback: evaluation.feedback,
            hypothesis: evaluation.hypothesis,
          });
        } else if (evaluation.result === 'supports') {
          sfx.select();
        } else {
          sfx.wrong();
        }
      },
    });
  };

  const handleSimulation = () => {
    const result = enterSimulation();
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  return (
    <>
      <div className="vn-frame px-3 pb-4 pt-3 sm:px-6 sm:pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {switchable.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const result = selectWitness(item.id);
                  if (result.ok) {
                    sfx.flip();
                    setFeedback(null);
                  } else {
                    showNotice(result.message);
                  }
                }}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-[10px] tracking-[0.08em] transition',
                  item.id === witness.npcId
                    ? 'border-vn-amber/70 bg-vn-amber/15 text-vn-amber'
                    : 'border-white/15 bg-white/[0.04] text-vn-paper/55 hover:text-vn-paper',
                )}
              >
                {item.name}的证词
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {confirmed.length > 0 ? (
              confirmed.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-vn-alert/45 bg-vn-alert/12 px-2 py-1 text-[9px] text-[#F0C3C7]"
                >
                  {HYPOTHESES[id].title}
                </span>
              ))
            ) : (
              <span className="text-[9px] tracking-[0.1em] text-vn-paper/35">尚未确认矛盾</span>
            )}
          </div>
        </div>

        <div className="relative">
          <StageFrame
            bg={npc.bg}
            className="h-[240px] w-full sm:h-auto sm:aspect-video"
            bgClassName="brightness-[0.8]"
            impact={flash}
          >
            <CharacterSprite npc={npc.id} emotion={feedback?.emotion ?? statement.emotion} className="left-[66%] h-[96%] sm:left-[72%] sm:h-[92%]" dimmed />

            <div className="absolute inset-x-3 top-3 flex items-center justify-between sm:inset-x-5 sm:top-4">
              <div className="rounded-full border border-white/15 bg-vn-night/60 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">质询</span>
                <span className="mx-2 text-vn-paper/25">·</span>
                <span className="text-[11px] text-vn-paper/90">{witness.title}</span>
              </div>
              <div className="hidden rounded-full border border-white/15 bg-vn-night/60 px-3 py-1.5 text-[10px] tracking-[0.12em] text-vn-paper/60 backdrop-blur-sm sm:block">
                逐句核对 · 出示免费
              </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 hidden sm:bottom-5 sm:left-5 sm:right-auto sm:top-16 sm:block sm:w-[54%]">
              <div className="flex h-full items-start">
                <div className="w-full rounded-2xl border border-white/60 bg-vn-paper/[0.97] p-4 text-vn-ink shadow-vnPaper sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.22em] text-vn-quiet">证词 · {statement.sceneNo}</span>
                    <div className="flex items-center gap-1.5">
                      {statements.map((item, dotIndex) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => changeStatement(dotIndex)}
                          aria-label={`查看陈述 ${dotIndex + 1}`}
                          className={clsx(
                            'h-1.5 rounded-full transition-all',
                            dotIndex === testimonyIndex ? 'w-5 bg-vn-ink' : 'w-1.5 bg-vn-ink/20 hover:bg-vn-ink/40',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-start gap-2">
                    <span className="mt-1 text-[26px] leading-none text-vn-amber">「</span>
                    <p className="text-[15px] font-medium leading-7 tracking-[0.01em] sm:text-[16px] sm:leading-8">
                      {statement.text}
                    </p>
                  </div>

                  {statementReply && (
                    <div className="mt-3 rounded-lg border-l-2 border-vn-sage bg-vn-sage/10 px-3 py-2">
                      <div className="text-[9px] tracking-[0.18em] text-[#5F7F78]">追问补充</div>
                      <p className="mt-1 text-[12px] leading-6 text-vn-ink/80">{statementReply}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-vn-line/70 pt-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => changeStatement(testimonyIndex - 1)}
                        disabled={testimonyIndex === 0}
                        aria-label="上一句陈述"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-vn-ink/15 text-vn-ink/70 transition hover:border-vn-ink/35 hover:text-vn-ink disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-vn-quiet">
                        {testimonyIndex + 1} / {statements.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeStatement(testimonyIndex + 1)}
                        disabled={testimonyIndex === statements.length - 1}
                        aria-label="下一句陈述"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-vn-ink/15 text-vn-ink/70 transition hover:border-vn-ink/35 hover:text-vn-ink disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <VnButton
                      variant="ghost"
                      onClick={handleAsk}
                      disabled={asked || ap < 1}
                      title={asked ? '这句已经追问过了' : ap < 1 ? '行动点不足' : '追问这句陈述，消耗 1 行动点'}
                    >
                      <MessageCircleQuestion className="h-3 w-3" />
                      追问 <span className="font-mono text-[9px] opacity-70">-1</span>
                    </VnButton>
                  </div>
                </div>
              </div>
            </div>
          </StageFrame>

          <div className="mt-3 rounded-2xl border border-white/60 bg-vn-paper/[0.97] p-3.5 text-vn-ink shadow-vnPaper sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.22em] text-vn-quiet">证词 · {statement.sceneNo}</span>
              <span className="font-mono text-[10px] text-vn-quiet">{testimonyIndex + 1} / {statements.length}</span>
            </div>
            <p className="mt-2 text-[14px] leading-7">「{statement.text}」</p>
            {statementReply && (
              <p className="mt-2 rounded-lg border-l-2 border-vn-sage bg-vn-sage/10 px-3 py-2 text-[11px] leading-5 text-vn-ink/80">
                {statementReply}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-vn-line/70 pt-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeStatement(testimonyIndex - 1)}
                  disabled={testimonyIndex === 0}
                  aria-label="上一句陈述"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-vn-ink/15 text-vn-ink/70 disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeStatement(testimonyIndex + 1)}
                  disabled={testimonyIndex === statements.length - 1}
                  aria-label="下一句陈述"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-vn-ink/15 text-vn-ink/70 disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <VnButton variant="ghost" onClick={handleAsk} disabled={asked || ap < 1}>
                <MessageCircleQuestion className="h-3 w-3" />
                追问 <span className="font-mono text-[9px] opacity-70">-1</span>
              </VnButton>
            </div>
          </div>

          <div className="mt-3 sm:absolute sm:inset-x-4 sm:bottom-4 lg:inset-x-6">
            <div className="rounded-2xl border border-white/15 bg-vn-night/90 px-3 py-3 text-vn-paper shadow-vn backdrop-blur-md sm:px-4">
              {feedback && feedback.result !== 'contradiction' && (
                <div
                  className={clsx(
                    'mb-2 flex flex-wrap items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-[11px] leading-5',
                    FEEDBACK_TONE[feedback.result],
                  )}
                >
                  <span className="rounded-full border border-current px-2 py-0.5 text-[9px] tracking-[0.16em]">
                    {RESULT_LABEL[feedback.result]}
                  </span>
                  {feedback.feedback}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-[10px] leading-4 text-vn-paper/55">
                  <FileSearch className="h-3.5 w-3.5 shrink-0 text-vn-amber" />
                  <span className="truncate">
                    {contradictions.length > 0
                      ? `已确认 ${contradictions.length} 处矛盾 · ${confirmed.length} 类风险`
                      : '从证据包选一份能反驳这句话的材料。'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <VnButton variant="amber" size="md" onClick={handlePresent}>
                    出示证据
                  </VnButton>
                  <VnButton variant="darkGhost" size="md" onClick={handleSimulation}>
                    <Play className="h-3 w-3" />
                    进入模拟
                  </VnButton>
                </div>
              </div>
              {contradictions.length === 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[9px] leading-4 text-vn-amber/70">
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  无矛盾也可推演，结果为低置信。
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] tracking-[0.12em] text-vn-paper/35">
          出示错误不中断 · 同一组合只记一次
        </p>
      </div>

      {overlay && (
        <ContradictionOverlay
          feedback={overlay.feedback}
          copy={CONTRADICTION_COPY[overlay.hypothesis]}
          onContinue={() => {
            setOverlay(null);
            sfx.complete();
          }}
        />
      )}
    </>
  );
}
