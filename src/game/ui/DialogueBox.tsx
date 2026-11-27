import { clsx } from 'clsx';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import type { Expression } from '../types';

const EMOTION_LABEL: Record<Expression, string> = {
  neutral: '平静',
  happy: '轻松',
  confused: '迟疑',
  nervous: '不安',
};

export interface DialogueBoxHandle {
  advance: () => void;
}

interface DialogueBoxProps {
  name: string;
  role?: string;
  text: string;
  emotion: Expression;
  tag?: string;
  hint?: string;
  onAdvance?: () => void;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(function DialogueBox(
  { name, role, text, emotion, tag, hint, onAdvance, actions, footer, className },
  ref,
) {
  const { visible, done, finish } = useTypewriter(text);

  const handleAdvance = useCallback(() => {
    if (!done) {
      finish();
      return;
    }
    onAdvance?.();
  }, [done, finish, onAdvance]);

  useImperativeHandle(ref, () => ({ advance: handleAdvance }), [handleAdvance]);

  useEffect(() => {
    if (actions) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      event.preventDefault();
      handleAdvance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, handleAdvance]);

  const handleBoxClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, summary')) return;
    handleAdvance();
  };

  return (
    <div
      onClick={handleBoxClick}
      className={clsx(
        'relative cursor-pointer rounded-2xl border border-white/50 bg-vn-paper/[0.97] text-vn-ink shadow-vnPaper backdrop-blur-sm',
        className,
      )}
    >
      <div className="absolute -top-4 left-4 flex items-center gap-2 sm:left-6">
        <div className="flex items-center gap-2 rounded-full border border-vn-ink/15 bg-vn-ink px-3 py-1.5 shadow-md">
          <span className="h-1.5 w-1.5 rotate-45 bg-vn-amber" />
          <span className="text-[12px] font-semibold tracking-[0.08em] text-vn-paper">{name}</span>
          {role && <span className="hidden text-[10px] text-vn-paper/55 sm:inline">{role}</span>}
        </div>
        <span className="rounded-full border border-vn-ink/10 bg-vn-paper/80 px-2 py-0.5 text-[10px] text-vn-ink/55">
          {EMOTION_LABEL[emotion]}
        </span>
        {tag && (
          <span className="rounded-full border border-vn-amber/60 bg-vn-amber/20 px-2 py-0.5 text-[10px] text-[#8E6036]">
            {tag}
          </span>
        )}
      </div>

      <div className="px-4 pb-3 pt-6 sm:px-6 sm:pb-4">
        <p className="min-h-[4.2rem] text-[15px] leading-8 tracking-[0.01em] sm:min-h-[4.6rem] sm:text-[17px] sm:leading-8">
          {visible}
          {!done && <span className="ml-0.5 inline-block h-4 w-[6px] translate-y-0.5 animate-pulse bg-vn-amber/80" />}
        </p>
        {hint && <p className="mt-1 text-[10px] leading-4 text-vn-quiet">{hint}</p>}
        {footer}
        <div className="mt-2 flex items-end justify-between gap-3">
          {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : <span />}
          {!actions && (
            <span
              className={clsx(
                'ml-auto flex items-center gap-1 text-[10px] tracking-[0.14em] text-vn-quiet/80 transition-opacity',
                done ? 'opacity-100' : 'opacity-0',
              )}
            >
              点击继续
              <span className="animate-vn-bob text-[9px]">▼</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
