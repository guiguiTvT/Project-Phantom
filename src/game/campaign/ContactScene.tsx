import { ChevronRight, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CAMPAIGN_CONTACTS, type CampaignMemory } from '../../../functions/shared/campaignDialogue';
import { CONTACTS, type DialogueInput, type DialogueReply, type Person } from '../../../functions/shared/chapterDialogue';
import { askContact } from '../chapter/caseApi';
import { Action, Modal, Next } from '../chapter/components';
import { CharacterSprite } from '../ui/CharacterSprite';
import type { Dispatch } from './CaseScene';
import { ModalActions, Reading } from './Interactions';
import { currentCase, extraInquiry, hasMet, knowsZhou, savedLin, type Campaign } from './engine';
import { personProfile } from './SceneTools';

function memoryFor(run: Campaign): CampaignMemory[] {
  const memory: CampaignMemory[] = [];
  const route = run.observations.find((item) => item.stepId === 'f-method')?.letter;
  if (route) memory.push(route === 'S' ? 'festival-formal' : 'festival-team');
  if (knowsZhou(run)) memory.push('job-team');
  if (savedLin(run)) memory.push('lin-saved');
  return memory;
}

function Conversation({ npc, run, dispatch, onBack, onClose }: {
  npc: Person; run: Campaign; dispatch: Dispatch; onBack: () => void; onClose: () => void;
}) {
  const definition = currentCase(run);
  const progress = run.cases[definition.id];
  const data = CAMPAIGN_CONTACTS[definition.id][npc];
  const [line, setLine] = useState('');
  const [reply, setReply] = useState<{ question: string; answer: DialogueReply }>();
  const [recent, setRecent] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [showSupplement, setShowSupplement] = useState(false);
  const pending = useRef<AbortController>();
  useEffect(() => () => pending.current?.abort(), []);
  const supplement = extraInquiry(run, npc);
  const already = Boolean(supplement && progress.seen.includes(supplement));

  async function ask(text: string) {
    const message = text.trim();
    if (!message || pending.current) return;
    const request = new AbortController();
    pending.current = request;
    setLine('');
    setShowSupplement(false);
    setBusy(true);
    const input: DialogueInput = {
      npc, message, verified: false, scope: definition.id, seen: progress.seen, recent, memory: memoryFor(run),
    };
    const answer = await askContact(input, request.signal);
    if (request.signal.aborted) return;
    pending.current = undefined;
    setBusy(false);
    setReply({ question: message, answer });
    setRecent((items) => [...items, ...answer.factIds].slice(-3));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(line);
  }
  if (!data) return null;
  return <Modal title={CONTACTS[npc].name} onClose={onClose} wide footer={<ModalActions>
    <Action tone="quiet" onClick={onBack}>查看联系名单</Action><Next onClick={onClose}>回到现场</Next>
  </ModalActions>}>
    <div className="c6-contact">
      <aside className="c6-contact-portrait"><CharacterSprite npc={npc} emotion={reply?.answer.tone === 'concerned' ? 'confused' : 'neutral'} /></aside>
      <div className="c6-contact-turn">
        {showSupplement && supplement && already ? <Reading material={definition.files[supplement]} /> : <>
          {reply && <p className="c6-contact-question">{reply.question}</p>}
          <p aria-live="polite">{busy ? '对方正在回复…' : reply?.answer.text ?? data.intro}</p>
          {reply && !busy && <small className="c6-source">{reply.answer.source === 'live' ? '基于当前记录的回复' : '预置剧情回复'}</small>}
        </>}
      </div>
    </div>
    <div className="c6-contact-questions">{data.questions.map((question) =>
      <Action key={question} disabled={busy} onClick={() => { void ask(question); }}>{question}</Action>)}</div>
    <form onSubmit={submit} className="c6-contact-form">
      <input aria-label="问角色一个问题" placeholder="问角色一个关于本案的问题" value={line} onChange={(event) => setLine(event.target.value)} maxLength={160} />
      <button className="pp-icon-button" type="submit" aria-label="发送问题" disabled={busy || !line.trim()}><Send size={16} aria-hidden="true" /></button>
    </form>
    {supplement && !progress.disposition && <Action className="c6-supplement" disabled={!already && progress.extraSpent >= 2}
      onClick={() => { if (!already) dispatch({ type: 'inquire', person: npc }); setShowSupplement(true); }}>
      {already ? '回看已收补充材料' : '补查一项并收进笔记 · 1 点'}
    </Action>}
  </Modal>;
}

export function ContactScene({ run, dispatch, onClose }: { run: Campaign; dispatch: Dispatch; onClose: () => void }) {
  const definition = currentCase(run);
  const contacts = CAMPAIGN_CONTACTS[definition.id];
  const available = (Object.keys(contacts) as Person[]).filter((id) =>
    definition.id !== 'voice' || id !== 'linxia' || run.cases.voice.seen.includes('V3'));
  const [npc, setNpc] = useState<Person>();
  if (npc && !hasMet(run, npc)) return <Modal title={CONTACTS[npc].name} onClose={onClose}
    footer={<ModalActions><Action tone="quiet" onClick={() => setNpc(undefined)}>返回联系人</Action>
      <Next onClick={() => dispatch({ type: 'meet', person: npc })}>开始交谈</Next></ModalActions>}>
    <p className="c6-source">{personProfile(npc).role}</p><p>{personProfile(npc).text}</p>
  </Modal>;
  if (npc) return <Conversation key={npc} npc={npc} run={run} dispatch={dispatch} onClose={onClose} onBack={() => setNpc(undefined)} />;
  return <Modal title="这件事可以找谁" onClose={onClose} footer={<ModalActions><Next onClick={onClose}>回到现场</Next></ModalActions>}>
    <div className="c6-record-list">{available.map((id) => <button className="c6-material-row" type="button" key={id} onClick={() => setNpc(id)}>
      <span><strong>{CONTACTS[id].name}</strong><small>{personProfile(id).role}</small></span><ChevronRight size={16} aria-hidden="true" />
    </button>)}</div>
  </Modal>;
}
