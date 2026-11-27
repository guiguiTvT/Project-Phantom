import { Archive, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTACTS, containsSensitiveData, isOffTopicRequest, localDialogue } from '../../../functions/shared/chapterDialogue';
import { ASSETS } from '../data/assets';
import { sfx } from '../audio/sound';
import { VERIFICATIONS, type ContactId, type EvidenceId } from './caseFile';
import { verificationBlock, type CaseState } from './caseEngine';
import { useCaseSession } from './caseStore';
import { askContact } from './caseApi';
import { Action, Modal } from './components';
import { NovelScene, ScriptScene, type StoryLine } from './NovelScene';
import { CONTACT_BEATS } from './script';

export type ConversationMemory = { facts: string[]; latest?: StoryLine };

export function ContactScene({ run, npc, memory, onMemory, onBack, onEvidence }: {
  run: CaseState; npc: ContactId; memory?: ConversationMemory; onMemory: (entry: ConversationMemory) => void;
  onBack: () => void; onEvidence: (id: EvidenceId) => void;
}) {
  const act = useCaseSession((state) => state.act);
  const [introduced, setIntroduced] = useState(Boolean(memory));
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [waiting, setWaiting] = useState<'playing' | 'slow' | null>(null);
  const [error, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const person = CONTACTS[npc];
  const record = VERIFICATIONS[npc];
  const verified = run.verified.includes(npc);
  const blocked = verificationBlock(run, npc);
  const beats = CONTACT_BEATS[npc];
  const staff = npc === 'chen' || npc === 'gu';
  const scene = { background: staff ? ASSETS.serviceHall : ASSETS.activityRoom, location: staff ? '校园服务中心' : '文化节活动室',
    time: run.time, portrait: npc, onBack, backLabel: staff ? '回到服务中心' : '去找其他人' };

  useEffect(() => () => requestRef.current?.abort(), []);

  function closeQuestion() {
    requestRef.current?.abort();
    requestRef.current = null;
    setWaiting(null); setAsking(false); setError(''); setQuestion('');
  }

  async function ask(value: string) {
    const message = value.trim();
    if (!message || requestRef.current) return;
    if (containsSensitiveData(message)) { setError('请删去真实姓名、联系方式或凭据，再问剧情里的事。'); return; }
    const controller = new AbortController();
    requestRef.current = controller;
    setWaiting('playing'); setError('');
    const timer = window.setTimeout(() => { if (!controller.signal.aborted) setWaiting('slow'); }, 1_500);
    try {
      const input = { npc, message, verified, recent: memory?.facts ?? [], seen: run.saved };
      const reply = isOffTopicRequest(message) ? localDialogue(input) : await askContact(input, controller.signal);
      if (controller.signal.aborted) return;
      onMemory({ facts: [...(memory?.facts ?? []), ...reply.factIds].slice(-3), latest: {
        voice: npc, text: reply.text, mood: reply.tone === 'concerned' ? 'nervous' : reply.tone === 'relieved' ? 'happy' : 'neutral',
        source: reply.source === 'live' ? '实时情境回复' : '预置剧情回复',
      } });
      sfx.flip();
      setAsking(false); setQuestion('');
    } finally {
      window.clearTimeout(timer);
      if (requestRef.current === controller) { requestRef.current = null; setWaiting(null); }
    }
  }

  if (!introduced) return <ScriptScene {...scene} lines={beats.slice(0, -1)} finishLabel="接话" onFinish={() => {
    setIntroduced(true);
    onMemory({ facts: [] });
  }} />;

  return <>
    <NovelScene {...scene} line={memory?.latest ?? beats[beats.length - 1]} actions={<>
      <Action tone="primary" onClick={() => setAsking(true)}><MessageCircle size={16} /> 追问</Action>
      {verified ? <Action onClick={() => onEvidence(record.evidence)}><ShieldCheck size={16} /> 看核实记录</Action>
        : <Action disabled={Boolean(blocked)} onClick={() => {
          if (!act({ type: 'verify', contact: npc })) return;
          sfx.collect();
          onMemory({ facts: memory?.facts ?? [], latest: { voice: npc, text: record.record, mood: 'neutral', source: '已核实' } });
        }}><ShieldCheck size={16} /> {record.title} · 1 点</Action>}
      {!verified && <Action tone="quiet" onClick={() => onEvidence(record.evidence)}><Archive size={15} /> 看相关材料</Action>}
      {blocked && !verified && <span className="nv-small-paper">{blocked}</span>}
    </>} />
    {asking && <Modal title={`你想问${person.name}什么？`} onClose={closeQuestion}>
      <div className="nv-questions">{person.questions.map((text) => <Action key={text} disabled={Boolean(waiting)} onClick={() => void ask(text)}>{text}</Action>)}</div>
      <form className="nv-question-form" onSubmit={(event) => { event.preventDefault(); void ask(question); }}>
        <input value={question} aria-label={`向${person.name}提问`} maxLength={160} placeholder="也可以按你的话问…"
          onChange={(event) => { setQuestion(event.target.value); setError(''); }} />
        <Action tone="primary" type="submit" disabled={!question.trim() || Boolean(waiting)} aria-label="发送问题"><Send size={17} /></Action>
      </form>
      {error && <p className="nv-note" role="alert">{error}</p>}
      {waiting && <p className="nv-note" role="status">{waiting === 'slow' ? `${person.name}正在想怎么回答…` : '已送达'}</p>}
    </Modal>}
  </>;
}
