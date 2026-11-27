import { useRef, useState } from 'react';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { CASE_META } from '../data/evidence';
import { PROLOGUE } from '../data/story';
import { useVnStore } from '../store/vnStore';
import { DialogueBox, type DialogueBoxHandle } from '../ui/DialogueBox';
import { StageFrame } from '../ui/StageFrame';

export function PrologueScene() {
  const enterInvestigation = useVnStore((state) => state.enterInvestigation);
  const [index, setIndex] = useState(0);
  const boxRef = useRef<DialogueBoxHandle>(null);
  const line = PROLOGUE.lines[index] ?? PROLOGUE.lines[PROLOGUE.lines.length - 1];

  const advance = () => {
    sfx.flip();
    if (index < PROLOGUE.lines.length - 1) {
      setIndex(index + 1);
      return;
    }
    enterInvestigation();
  };

  return (
    <div className="vn-frame px-3 pb-4 pt-3 sm:px-6 sm:pt-5">
      <div className="relative">
        <StageFrame
          bg={ASSETS.cover}
          className="aspect-[4/3] w-full sm:aspect-video"
          bgClassName="scale-105 brightness-[0.55]"
          onBackgroundClick={() => boxRef.current?.advance()}
        >
          <div className="absolute inset-x-3 top-3 flex items-center justify-between sm:inset-x-5 sm:top-4">
            <div className="rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">序章</span>
              <span className="mx-2 text-vn-paper/25">·</span>
              <span className="text-[11px] text-vn-paper/90">{CASE_META.caseNo} {CASE_META.title}</span>
            </div>
            <div className="rounded-full border border-vn-amber/30 bg-vn-night/55 px-3 py-1.5 text-[10px] tracking-[0.12em] text-vn-amber/90 backdrop-blur-sm">
              授权 · 仅限虚构校园
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-5 text-center sm:bottom-8">
            <p className="text-[10px] tracking-[0.3em] text-vn-paper/40">CASE 01 / 信任裂缝</p>
            <p className="mt-2 text-[20px] font-black tracking-[0.12em] text-vn-paper/90 sm:text-[28px]">
              文化节前 48 小时
            </p>
          </div>
        </StageFrame>

        <div className="mt-3 sm:absolute sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:mt-0 sm:max-w-[980px] lg:inset-x-6">
          <DialogueBox
            ref={boxRef}
            name={PROLOGUE.speaker}
            role={PROLOGUE.role}
            text={line.text}
            emotion={line.emotion}
            onAdvance={advance}
          />
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] leading-5 tracking-[0.1em] text-vn-paper/35">
        点击或空格继续 · 不连接真实系统
      </p>
    </div>
  );
}
