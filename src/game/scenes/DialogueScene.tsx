import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Loader2,
  MessageCircle,
  MessageCircleQuestion,
  RotateCcw,
  Send,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react';
import { NPC_DIALOGUE } from '../../../shared/npcDialogue';
import { askNpc, type NpcDialogueReply } from '../api/npcDialogue';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { VN_EVIDENCE_BY_ID } from '../data/evidence';
import { NPC_LIST } from '../data/story';
import { canEnterTestimony } from '../engine/StoryEngine';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import { CharacterSprite } from '../ui/CharacterSprite';
import { DialogueBox, type DialogueBoxHandle } from '../ui/DialogueBox';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

function NpcHub() {
  const npcDoneIds = useVnStore((state) => state.npcDoneIds);
  const npcVerifiedIds = useVnStore((state) => state.npcVerifiedIds);
  const selectNpc = useVnStore((state) => state.selectNpc);
  const backToInvestigation = useVnStore((state) => state.backToInvestigation);
  const showNotice = useVnUi((state) => state.showNotice);

  const open = (id: (typeof NPC_LIST)[number]['id']) => {
    const result = selectNpc(id);
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  return (
    <div className="vn-frame px-3 pb-4 pt-3 sm:px-6 sm:pt-5">
      <StageFrame bg={ASSETS.activityRoom} className="w-full sm:aspect-video" bgClassName="brightness-[0.58]">
        <div className="relative flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">人物调查</span>
              <span className="mx-2 text-vn-paper/25">·</span>
              <span className="text-[11px] text-vn-paper/90">文化节活动室</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sfx.click();
                backToInvestigation();
              }}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-vn-night/45 px-3 py-1.5 text-[10px] text-vn-paper/65 backdrop-blur-sm transition hover:text-vn-paper"
            >
              <RotateCcw className="h-3 w-3" />
              回现场
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto mt-5 max-w-[760px] text-center">
              <p className="text-[10px] tracking-[0.28em] text-vn-amber/80">先听谁开口</p>
              <h1 className="mt-2 text-[24px] font-black leading-tight tracking-[0.04em] text-vn-paper sm:text-[34px]">
                五个人，五条线索
              </h1>
              <p className="mx-auto mt-2 max-w-[430px] text-[11px] leading-6 text-vn-paper/60">
                顺序随意。每个人知道的不同，谈过即记录。
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
              {NPC_LIST.map((npc) => {
                const done = npcDoneIds.includes(npc.id);
                const verified = npcVerifiedIds.includes(npc.id);
                return (
                  <button
                    key={npc.id}
                    type="button"
                    onClick={() => open(npc.id)}
                    className="group relative overflow-hidden rounded-xl border border-white/12 bg-vn-night/55 text-left backdrop-blur-sm transition hover:border-vn-amber/55 hover:bg-vn-night/75"
                  >
                    <div className="relative h-24 overflow-hidden sm:h-36 lg:h-44">
                      <img
                        src={ASSETS.characters[npc.id].neutral}
                        alt=""
                        className="h-full w-full object-cover object-top opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-vn-night via-vn-night/20 to-transparent" />
                      {done && (
                        <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-vn-sage/90 px-1.5 py-0.5 text-[8px] font-medium text-[#15221f]">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          {verified ? '已追问' : '已谈'}
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 pb-2.5 pt-1.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] font-semibold text-vn-paper">{npc.name}</span>
                        <span className="truncate text-[9px] text-vn-paper/40">{npc.role.split(' · ')[0]}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-vn-paper/55">{npc.short}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
            <p className="text-[10px] leading-5 text-vn-paper/45">
              至少一位证人说完，才能进入质询。
            </p>
            <span className="text-[9px] tracking-[0.14em] text-vn-paper/30">T-36h · 活动室</span>
          </div>
        </div>
      </StageFrame>
    </div>
  );
}

export function DialogueScene() {
  const activeNpcId = useVnStore((state) => state.activeNpcId);
  const npcLineIndex = useVnStore((state) => state.npcLineIndex);
  const npcReply = useVnStore((state) => state.npcReply);
  const npcVerifiedIds = useVnStore((state) => state.npcVerifiedIds);
  const npcDoneIds = useVnStore((state) => state.npcDoneIds);
  const ap = useVnStore((state) => state.ap);
  const advanceNpc = useVnStore((state) => state.advanceNpc);
  const verifyNpc = useVnStore((state) => state.verifyNpc);
  const enterTestimony = useVnStore((state) => state.enterTestimony);
  const backToNpcHub = useVnStore((state) => state.backToNpcHub);
  const showNotice = useVnUi((state) => state.showNotice);
  const boxRef = useRef<DialogueBoxHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [freeOpen, setFreeOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [freeLog, setFreeLog] = useState<{ q: string; a: NpcDialogueReply }[]>([]);
  const [lastReply, setLastReply] = useState<NpcDialogueReply | null>(null);

  useEffect(() => {
    setFreeOpen(false);
    setDraft('');
    setPending(false);
    setFreeLog([]);
    setLastReply(null);
  }, [activeNpcId]);

  if (!activeNpcId) return <NpcHub />;

  const npc = NPC_LIST.find((item) => item.id === activeNpcId);
  if (!npc) return <NpcHub />;

  const line = npcReply ?? npc.lines[npcLineIndex] ?? npc.lines[npc.lines.length - 1];
  const done = npcDoneIds.includes(npc.id);
  const verified = npcVerifiedIds.includes(npc.id);
  const showActions = !npcReply && npcLineIndex >= npc.lines.length - 1;
  const witnessReady = canEnterTestimony(useVnStore.getState());

  const advance = () => {
    const result = advanceNpc();
    if (!result.ok) {
      showNotice(result.message);
      return;
    }
    if (result.grantedEvidenceId) {
      sfx.collect();
      showNotice(`已收进证据包 · ${result.grantedEvidenceId} ${VN_EVIDENCE_BY_ID[result.grantedEvidenceId].title}`);
    } else {
      sfx.flip();
    }
  };

  const handleVerify = () => {
    const result = verifyNpc();
    if (result.ok) {
      sfx.collect();
      showNotice(result.message);
    } else {
      showNotice(result.message);
    }
  };

  const handleTestimony = () => {
    const result = enterTestimony();
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  const submitFree = async () => {
    const text = draft.trim();
    if (!text || pending) return;
    setPending(true);
    sfx.click();
    const reply = await askNpc(npc.id, text);
    setFreeLog((prev) => [...prev.slice(-2), { q: text, a: reply }]);
    setLastReply(reply);
    setDraft('');
    setPending(false);
    sfx.flip();
  };

  return (
    <div className="vn-frame px-3 pb-4 pt-3 sm:px-6 sm:pt-5">
      <div className="relative">
        <StageFrame
          bg={npc.bg}
          className="aspect-[4/3] w-full sm:aspect-video"
          onBackgroundClick={() => boxRef.current?.advance()}
        >
          <CharacterSprite npc={npc.id} emotion={lastReply?.emotion ?? line.emotion} className="left-[52%] h-[88%] sm:left-[50%]" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between sm:inset-x-5 sm:top-4">
            <div className="rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">对话</span>
              <span className="mx-2 text-vn-paper/25">·</span>
              <span className="text-[11px] text-vn-paper/90">{npc.name} · {npc.role}</span>
            </div>
            <div className="hidden rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 text-[10px] tracking-[0.1em] text-vn-paper/60 backdrop-blur-sm sm:block">
              {done ? '这段对话已记录' : '先听对方说完'}
            </div>
          </div>
        </StageFrame>

        <div className="mt-3 sm:absolute sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:mt-0 sm:max-w-[980px] lg:inset-x-6">
          <DialogueBox
            ref={boxRef}
            name={npc.name}
            role={npc.role}
            text={line.text}
            emotion={lastReply?.emotion ?? line.emotion}
            tag={npcReply ? '追问回应' : done ? (verified ? '已归档' : '已谈完') : undefined}
            onAdvance={advance}
            footer={
              showActions ? (
                <div className="mt-2 border-t border-vn-ink/10 pt-2">
                  {freeOpen ? (
                    <>
                      {freeLog.length > 0 && (
                        <div className="mb-2 max-h-36 space-y-1.5 overflow-y-auto pr-1">
                          {freeLog.map((item, index) => (
                            <div key={`${item.q}-${index}`} className="text-[12px] leading-5">
                              <p className="text-vn-quiet">你：{item.q}</p>
                              <p className="text-vn-ink/85">{npc.name}：{item.a.reply}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submitFree();
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          ref={inputRef}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          maxLength={60}
                          placeholder={`问${npc.name}一句…`}
                          aria-label={`向${npc.name}自由提问`}
                          className="min-w-0 flex-1 rounded-full border border-vn-ink/15 bg-white/70 px-3 py-1.5 text-[12px] text-vn-ink placeholder:text-vn-quiet/70 focus:border-vn-amber focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={pending || !draft.trim()}
                          aria-label="发送提问"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-vn-ink text-vn-paper transition disabled:opacity-40"
                        >
                          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFreeOpen(false)}
                          aria-label="收起自由提问"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-vn-ink/15 text-vn-quiet transition hover:text-vn-ink"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {NPC_DIALOGUE[npc.id].suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setDraft(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="rounded-full border border-vn-ink/12 bg-white/55 px-2 py-0.5 text-[10px] text-vn-ink/65 transition hover:border-vn-amber/60 hover:text-vn-ink"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      <p className="mt-1 text-[9px] leading-4 text-vn-quiet">
                        自由提问不消耗行动点，也不改变证据。
                        {lastReply?.source === 'local' && ' 当前为本地规则回答。'}
                      </p>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sfx.click();
                        setFreeOpen(true);
                        window.setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-vn-quiet transition hover:text-vn-ink"
                    >
                      <MessageCircle className="h-3 w-3" />
                      自由提问 · 不消耗行动点
                    </button>
                  )}
                </div>
              ) : undefined
            }
            actions={
              showActions ? (
                <>
                  {!verified && (
                    <VnButton
                      variant="ghost"
                      onClick={handleVerify}
                      disabled={ap < 1}
                      title={ap < 1 ? '行动点不足' : '追问会消耗 1 行动点'}
                    >
                      <MessageCircleQuestion className="h-3 w-3" />
                      追问 <span className="font-mono text-[9px] opacity-70">-1</span>
                    </VnButton>
                  )}
                  <VnButton
                    variant="quiet"
                    onClick={() => {
                      sfx.click();
                      backToNpcHub();
                    }}
                  >
                    换个人
                  </VnButton>
                  {witnessReady && (
                    <VnButton variant="amber" onClick={handleTestimony}>
                      <SquareArrowOutUpRight className="h-3 w-3" />
                      去质询
                      <ChevronRight className="h-3 w-3" />
                    </VnButton>
                  )}
                </>
              ) : undefined
            }
          />
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] tracking-[0.12em] text-vn-paper/35">
        点击或空格继续 · 追问 -1
      </p>
    </div>
  );
}
