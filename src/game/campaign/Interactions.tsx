import { ArrowLeft, Check, ChevronRight, Headphones, Link2, Play, Pause, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Action, Badge, Modal, Next } from '../chapter/components';
import { highlightWords } from '../chapter/NovelScene';
import { canUseToken, matchesPuzzle, type Campaign } from './engine';
import type { Attempt, CaseDefinition, Material, PuzzleStep, Token } from './types';

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="c6-modal-actions">{children}</div>;
}

export function Reading({ material }: { material: Material }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, []);
  return <article className="c6-reading">
    <p className="c6-source">{material.source}</p>
    {material.audio && <>
      <audio ref={audio} src={material.audio} preload="none" onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setUnavailable(true)} />
      <Action onClick={() => {
        if (playing) audio.current?.pause();
        else void audio.current?.play().catch(() => setUnavailable(true));
      }} disabled={unavailable}>{playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        {playing ? '暂停演练语音' : '播放演练语音'}
      </Action>
      <p className="c6-source">{unavailable ? '语音暂时无法播放，下方文字仍可用于核对。' : '语音文字与随附消息'}</p>
    </>}
    {material.lines.map((line) => <p key={line}>{highlightWords(line, line.match(/SIM-(?:FEST|HELP|TEMP)-\d+|CAM-S17|TRACE-14|等待买家付款|到账 20 元|垫付 300 元|没有发布|没有授权|没有发起/g) ?? [])}</p>)}
  </article>;
}

export function MaterialDeck({ materials, ids, initial = 0, onRead, onClose, finishLabel, onFinish }: {
  materials: CaseDefinition['files']; ids: readonly string[]; initial?: number; onRead?: (id: string) => void; onClose: () => void;
  finishLabel?: string; onFinish?: () => void;
}) {
  const [index, setIndex] = useState(initial);
  function next(to: number) {
    if (ids[to]) { setIndex(to); onRead?.(ids[to]); }
  }
  const id = ids[index];
  return <Modal title={materials[id].title} onClose={onClose} footer={<ModalActions>
    <Badge tone="good"><Check size={13} aria-hidden="true" /> 已收进笔记</Badge>
    <div className="c6-deck-pager">
      {ids.length > 1 && <><button type="button" className="pp-icon-button" aria-label="上一份材料" disabled={index === 0}
        onClick={() => next(index - 1)}><ArrowLeft size={16} aria-hidden="true" /></button><span aria-live="polite">{index + 1} / {ids.length}</span></>}
      {index < ids.length - 1 ? <Next onClick={() => next(index + 1)}>下一份材料</Next> : <Next onClick={onFinish ?? onClose}>{finishLabel ?? '读完，回到现场'}</Next>}
    </div>
  </ModalActions>}>
    <Reading key={id} material={materials[id]} />
  </Modal>;
}

type PuzzleProps = {
  run: Campaign; definition: CaseDefinition; step: PuzzleStep; onClose: () => void;
  onSolve: (attempt: Attempt) => void; onSkip: () => void;
};

export function PuzzleDialog({ run, definition, step, onClose, onSolve, onSkip }: PuzzleProps) {
  const { puzzle } = step;
  const [sequence, setSequence] = useState<string[]>([]);
  const [grouped, setGrouped] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string>();
  const [feedback, setFeedback] = useState('');
  const [clue, setClue] = useState(false);
  const tokenById = (id: string) => puzzle.tokens.find((token) => token.id === id);
  const usable = (id: string) => canUseToken(run, definition, id);
  const isGroup = puzzle.kind === 'group';
  const count = isGroup ? Object.keys(grouped).length : sequence.length;
  const need = isGroup ? puzzle.tokens.length : puzzle.answer.length;
  const complete = count === need;
  const blocked = puzzle.kind === 'link' && puzzle.answer.some((id) => !usable(id));

  function add(id: string) {
    if (puzzle.kind === 'group' || !tokenById(id) || !usable(id)) return;
    setSequence((current) => current.includes(id) ? current : [...current, id].slice(-need));
    setSelected(id);
    setFeedback('');
  }
  function press(id: string) {
    if (isGroup) { setSelected(selected === id ? undefined : id); return; }
    if (sequence.includes(id)) { setSequence(sequence.filter((item) => item !== id)); setSelected(undefined); setFeedback(''); }
    else add(id);
  }
  function place(id: string | undefined, group: string) {
    if (!id || !tokenById(id) || !usable(id)) return;
    setGrouped({ ...grouped, [id]: group });
    setSelected(undefined);
    setFeedback('');
  }
  function drop(event: DragEvent, placeToken: (id: string) => void) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (tokenById(id)) placeToken(id);
  }
  function submit() {
    const attempt = isGroup ? grouped : sequence;
    if (matchesPuzzle(step, attempt) && !blocked) onSolve(attempt);
    else {
      setClue(true);
      setFeedback('还有记录需要调整。');
    }
  }
  function renderToken(token: Token) {
    const active = isGroup ? selected === token.id : sequence.includes(token.id);
    const group = puzzle.kind === 'group' ? puzzle.groups.find((item) => item.id === grouped[token.id]) : undefined;
    const order = puzzle.kind === 'order' ? sequence.indexOf(token.id) : -1;
    return <button key={token.id} className="c6-token" type="button" aria-pressed={active} disabled={!usable(token.id)}
      draggable={usable(token.id)} onDragStart={(event) => {
        setSelected(token.id);
        event.dataTransfer.setData('text/plain', token.id);
        event.dataTransfer.effectAllowed = 'move';
      }} onClick={() => press(token.id)}>
      <strong>{order >= 0 && <span className="c6-order">{order + 1}</span>}{token.label}</strong>
      {(group || token.detail) && <span className="c6-token-detail">{group ? <><Check size={11} aria-hidden="true" /> {group.label}</> : token.detail}</span>}
      {!usable(token.id) && <span className="c6-token-detail">还没有取得这份回复</span>}
    </button>;
  }

  return <Modal title={step.button} onClose={onClose} wide footer={<ModalActions>
    <Action tone="quiet" onClick={onSkip}>保留疑点继续</Action>
    <Next disabled={!complete || blocked} onClick={submit}>核对整理结果</Next>
  </ModalActions>}>
    <div className="c6-puzzle">
      <p className="c6-instruction">{step.instruction}</p>
      <div className="c6-puzzle-parts">
        {puzzle.kind === 'group' ? <div className="c6-group-grid" aria-label="分类位置">
          {puzzle.groups.map((group) => <button key={group.id} type="button" className="c6-group"
            disabled={!selected} onClick={() => place(selected, group.id)} onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => drop(event, (id) => place(id, group.id))}>
            {group.label}<span>{Object.values(grouped).filter((value) => value === group.id).length}</span>
          </button>)}
        </div> : <div className="c6-selected" aria-label={puzzle.kind === 'order' ? '已排列' : '已选材料'} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, add)}>
          <Link2 size={16} aria-hidden="true" />
          <span>{count ? sequence.map((id) => tokenById(id)?.label).join(puzzle.kind === 'order' ? ' → ' : ' ＋ ')
            : puzzle.kind === 'order' ? '点记录从最早排到最晚，也可拖到这里' : '点选下方材料，也可拖到这里'}</span>
        </div>}
        <div className="c6-token-grid" aria-label="可用材料">{puzzle.tokens.map(renderToken)}</div>
      </div>
      <div className="c6-puzzle-tools">
        <small aria-live="polite">{isGroup ? '已归类' : '已选'} {count} / {need}</small>
        <Action tone="quiet" onClick={() => { setSequence([]); setGrouped({}); setSelected(undefined); setFeedback(''); }} disabled={!count}>
          <RotateCcw size={13} aria-hidden="true" /> 重排
        </Action>
        <Action tone="quiet" aria-pressed={clue} onClick={() => setClue(!clue)}>{clue ? '收起提示' : '提示'}</Action>
      </div>
      {(clue || blocked) && <p className="c6-hint" role="status">{feedback}{blocked ? '还缺独立确认。你可以把这条结论留在待核实清单。' : step.clue}</p>}
    </div>
  </Modal>;
}

export function SceneChoices({ children }: { children: ReactNode }) {
  return <div className="c7-flow-choices" role="group" aria-label="可以采取的行动">{children}</div>;
}

export function SceneChoice({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return <button className="nv-choice" type="button" onClick={onClick} disabled={disabled}><strong>{label}</strong><ChevronRight size={17} aria-hidden="true" /></button>;
}

export function AssistanceDialog({ open, onCheck, onClose }: { open: boolean; onCheck: (open: boolean) => void; onClose: () => void }) {
  return <Modal title="陌生协助会话" onClose={onClose} footer={<ModalActions><Next onClick={onClose}>回到订单</Next></ModalActions>}>
    <div className="c6-reading">
      <p className="c6-source"><Headphones size={16} aria-hidden="true" /> 新会话 · 客服身份待查</p>
      <p>这个会话自称可以查付款。原平台目前没有确认它的客服身份。</p>
      <Badge tone={open ? 'warning' : 'good'}>{open ? '演练协助已开启' : '协助已关闭'}</Badge>
      <p>演练会话只改变游戏内记录。它不会读取你的设备或共享画面。</p>
      <Action onClick={() => onCheck(!open)}>{open ? '结束演练协助' : '查看演练协助状态变化'}</Action>
    </div>
  </Modal>;
}
