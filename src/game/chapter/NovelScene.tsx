import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CONTACTS } from '../../../functions/shared/chapterDialogue';
import { sfx } from '../audio/sound';
import { useTypewriter } from '../hooks/useTypewriter';
import type { Expression } from '../types';
import { CharacterSprite } from '../ui/CharacterSprite';
import { StageFrame } from '../ui/StageFrame';
import type { ContactId } from './caseFile';
import { Action, useLessMotion } from './components';

export interface StoryLine {
  voice: ContactId | 'self' | 'narrator' | 'system' | 'shen';
  text: string;
  actor?: ContactId;
  mood?: Expression;
  background?: string;
  source?: string;
  emphasis?: readonly string[];
}

const VOICES = { self: '我', narrator: '旁白', system: '演练记录', shen: '沈一' } as const;

export function contactName(voice: StoryLine['voice']): string {
  return voice in VOICES ? VOICES[voice as keyof typeof VOICES] : CONTACTS[voice as ContactId].name;
}

interface NovelSceneProps {
  background: string;
  location: string;
  time?: string;
  line: StoryLine;
  portrait?: ContactId;
  framing?: 'center' | 'right';
  variant?: 'room' | 'transfer' | 'simulation' | 'ending' | 'intro';
  title?: string;
  byline?: string;
  objective?: string;
  focus?: boolean;
  cue?: { label: string; text: string; tone?: 'good' | 'alert' };
  decoration?: ReactNode;
  actions?: ReactNode;
  onAdvance?: () => void;
  advanceLabel?: string;
  onBack?: () => void;
  backLabel?: string;
}

export function highlightWords(text: string, emphasis?: readonly string[]) {
  if (!emphasis?.length) return text;
  const located = emphasis.map((part) => ({ part, start: text.indexOf(part) }))
    .filter(({ part, start }) => part && start >= 0).sort((a, b) => a.start - b.start);
  const words: ReactNode[] = [];
  let end = 0;
  for (const { part, start } of located) {
    if (start < end) continue;
    words.push(text.slice(end, start), <mark key={start}>{part}</mark>);
    end = start + part.length;
  }
  words.push(text.slice(end));
  return words;
}

export function NovelScene({ background, location, time, line, portrait, framing = 'center', variant,
  title, byline, objective, focus = false, cue, decoration, actions, onAdvance, advanceLabel = '继续', onBack, backLabel = '返回活动室' }: NovelSceneProps) {
  const reduced = useLessMotion();
  const actor = line.actor ?? portrait;
  const { visible, done, finish } = useTypewriter(onAdvance && !reduced ? line.text : '', 21);
  const waiting = Boolean(onAdvance && !reduced && !done);
  const sceneRef = useRef<HTMLElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<() => void>(() => undefined);
  advanceRef.current = () => {
    if (!onAdvance || document.querySelector('dialog[open]')) return;
    if (waiting) finish();
    else { sfx.flip(); onAdvance(); }
  };

  useEffect(() => {
    if (!onAdvance) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== ' ' && event.key !== 'Enter') || document.querySelector('dialog[open]')) return;
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, summary, [contenteditable]')) return;
      event.preventDefault();
      advanceRef.current();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [onAdvance]);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const dialogue = dialogueRef.current;
    if (variant !== 'room' || !scene || !dialogue) return;
    const clearDialogue = () => {
      const edge = dialogue.getBoundingClientRect().top - scene.getBoundingClientRect().top;
      scene.style.setProperty('--nv-prop-limit-y', `${Math.max(0, Math.floor(edge - 54))}px`);
    };
    clearDialogue();
    const observer = new ResizeObserver(clearDialogue);
    observer.observe(scene);
    observer.observe(dialogue);
    return () => observer.disconnect();
  }, [variant]);

  return <section ref={sceneRef} className={`nv-scene${variant ? ` nv-scene--${variant}` : ''}`} aria-label={location}>
    <StageFrame bg={line.background ?? background} className={`nv-stage nv-stage--${framing}`} bgClassName="nv-stage-art">
      {actor && <CharacterSprite key={actor} npc={actor} emotion={line.mood ?? 'neutral'} className="nv-sprite" />}
      {onAdvance && <button type="button" className="nv-stage-advance" tabIndex={-1} aria-hidden="true" onClick={() => advanceRef.current()} />}
      <div className="nv-slate">
        {title ? <span>{location}</span> : <h1>{location}</h1>}{time && <time>{time}</time>}
      </div>
      {objective && !focus && <div className="nv-objective"><small>当前目标</small><strong>{objective}</strong></div>}
      {onBack && <button type="button" className="nv-back" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" /> {backLabel}</button>}
      {title && <div className="nv-scene-title"><span>{byline}</span><h1>{title}</h1></div>}
      {decoration}
    </StageFrame>
    <div ref={dialogueRef} className={`nv-dialogue${onAdvance ? ' nv-dialogue--advance' : ''}${focus ? ' nv-dialogue--focus' : ''}`}>
      <div className="nv-speaker"><span aria-hidden="true" /><strong>{contactName(line.voice)}</strong>{line.source && <small>{line.source}</small>}</div>
      {objective && focus && <div className="c7-intent"><span>当前目标</span><strong>{objective}</strong></div>}
      <p className="nv-line" onClick={onAdvance ? () => advanceRef.current() : undefined}>
        {waiting ? <><span aria-hidden="true">{highlightWords(visible, line.emphasis)}<span className="nv-caret" /></span><span className="sr-only">{line.text}</span></> : highlightWords(line.text, line.emphasis)}
      </p>
      {cue && <div className={`c7-story-cue${cue.tone ? ` c7-story-cue--${cue.tone}` : ''}`} role="status"><strong>{cue.label}</strong><span>{cue.text}</span></div>}
      {(actions || onAdvance) && <div className="nv-controls">
        {actions && <div className="nv-actions">{actions}</div>}
        {onAdvance && <button className="nv-advance" type="button" onClick={() => advanceRef.current()}>{objective && waiting ? '显示整句' : advanceLabel}<ChevronDown size={15} aria-hidden="true" /></button>}
      </div>}
    </div>
  </section>;
}

interface ScriptSceneProps extends Omit<NovelSceneProps, 'line' | 'onAdvance' | 'advanceLabel'> {
  lines: readonly StoryLine[];
  finishLabel: string;
  onFinish: () => void;
  skipLabel?: string;
}

export function ScriptScene({ lines, finishLabel, onFinish, skipLabel, actions, ...scene }: ScriptSceneProps) {
  const [index, setIndex] = useState(0);
  const last = index === lines.length - 1;
  const skip = !last && skipLabel && <Action tone="quiet" onClick={onFinish}>{skipLabel}</Action>;
  return <NovelScene {...scene} line={lines[index]} onAdvance={() => last ? onFinish() : setIndex(index + 1)}
    advanceLabel={last ? finishLabel : '继续'} actions={actions || skip ? <>{actions}{skip}</> : undefined} />;
}

export function SceneAction({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <Action tone="primary" onClick={onClick} disabled={disabled}>{children}<ArrowRight size={15} aria-hidden="true" /></Action>;
}
