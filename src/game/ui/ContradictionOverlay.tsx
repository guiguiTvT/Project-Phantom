import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sfx } from '../audio/sound';

interface ContradictionOverlayProps {
  feedback: string;
  copy: { title: string; body: string; recap: string };
  onContinue: () => void;
}

export function ContradictionOverlay({ feedback, copy, onContinue }: ContradictionOverlayProps) {
  useEffect(() => {
    sfx.contradiction();
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="发现矛盾">
      <div className="absolute inset-0 bg-vn-night/85 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute inset-0 animate-vn-flash bg-vn-paper/80" />
      <div className="pointer-events-none absolute inset-0 vn-scanlines opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(173,98,103,0.22),transparent_58%)]" />

      <div className="relative z-10 w-full max-w-xl animate-vn-rise text-center">
        <div className="mb-3 flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-vn-paper/55">
          <span className="h-px w-10 bg-vn-paper/30" />
          矛盾成立
          <span className="h-px w-10 bg-vn-paper/30" />
        </div>

        <div className="relative mx-auto inline-block animate-vn-stamp">
          <h2 className="text-[42px] font-black leading-none tracking-[0.08em] text-vn-paper drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-[58px]">
            发现矛盾
            <span className="text-vn-alert">！</span>
          </h2>
          <span className="absolute -inset-x-4 bottom-1 -z-10 h-3 bg-vn-alert/60" />
        </div>

        <div className="mx-auto mt-7 max-w-md rounded-2xl border border-vn-paper/15 bg-vn-paper/[0.97] px-5 py-5 text-left text-vn-ink shadow-vn sm:px-6">
          <p className="text-[10px] tracking-[0.24em] text-vn-alert">陈述被推翻</p>
          <h3 className="mt-1.5 text-[17px] font-semibold">{copy.title}</h3>
          <p className="mt-2 text-[12px] leading-6 text-vn-ink/80">{feedback}</p>
          <div className="my-3 h-px w-full bg-vn-line" />
          <p className="text-[12px] leading-6 text-vn-ink/70">{copy.body}</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-vn-ink px-4 py-2.5 text-[13px] font-medium tracking-[0.1em] text-vn-paper transition hover:bg-[#33465C] active:scale-[0.99]"
          >
            收下这条裂缝
          </button>
        </div>
        <p className="mt-3 text-[10px] tracking-[0.16em] text-vn-paper/40">{copy.recap}</p>
      </div>
    </div>,
    document.body,
  );
}
