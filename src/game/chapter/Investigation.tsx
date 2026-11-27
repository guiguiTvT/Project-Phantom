import { ArrowRight, ClipboardList, FlaskConical, Laptop, MessageCircle, Smartphone } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { CONTACTS } from '../../../functions/shared/chapterDialogue';
import { ASSETS } from '../data/assets';
import { CASE_HOTSPOTS } from '../data/evidence';
import { sfx } from '../audio/sound';
import { RISKS, RISK_IDS, type ContactId, type EvidenceId } from './caseFile';
import { confirmedRisks, touchedRisk, type CaseState, type Focus } from './caseEngine';
import { useCaseSession } from './caseStore';
import { Action, Badge, Modal, Next } from './components';
import { AnalysisScene, EvidenceNotebook, EvidenceSlip, SIMULATION_LABEL } from './EvidenceBoard';
import { ContactScene, type ConversationMemory } from './ContactPanel';
import { NovelScene, SceneAction } from './NovelScene';

type Place = 'room' | 'meet' | 'service' | 'analysis' | 'handoff';
type Visit = { place: Place } | { place: 'contact'; npc: ContactId; from: 'meet' | 'service' };

const PROPS = {
  phone: { id: 'E2', icon: Smartphone, name: '桌上的手机' },
  laptop: { id: 'E3', icon: Laptop, name: '开着的电脑' },
  board: { id: 'E1', icon: ClipboardList, name: '墙上的公告' },
} as const;

function HandoffScene({ run, onBack }: { run: CaseState; onBack: () => void }) {
  const act = useCaseSession((state) => state.act);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<Focus>('open');
  const confirmed = confirmedRisks(run);
  const focusable = RISK_IDS.filter((id) => touchedRisk(run, id));
  return <>
    <NovelScene background={ASSETS.serviceHall} location="服务中心 · 交接" time={run.time} portrait="gu" framing="right" onBack={onBack}
      line={{ voice: 'gu', text: confirmed.length ? '你把查实的和还有疑点的分开写。先告诉我，接下来你最想盯哪件事？'
        : '还没查清的先留个记号。可以带着现有的记录交接，之后我们再一起核对。' }}
      actions={<SceneAction onClick={() => setOpen(true)}>交出调查记录</SceneAction>} />
    {open && <Modal title="交接信封" onClose={() => setOpen(false)} footer={<div className="pp-action-row pp-action-row--split"><Action onClick={() => setOpen(false)}>再想想</Action>
      <Next onClick={() => { if (act({ type: 'handoff', focus })) sfx.flip(); }}>确认交接</Next></div>}>
      <div className="nv-summary-list">{RISK_IDS.map((id) => {
        const record = run.simulations[id];
        return <div key={id}><span>{RISKS[id].name}</span><Badge tone={record?.status === 'confirmed' ? 'good' : 'muted'}>
          {record ? SIMULATION_LABEL[record.status] : touchedRisk(run, id) ? '未推演 · 待查' : '未调查'}
        </Badge></div>;
      })}</div>
      <fieldset className="nv-focus"><legend>优先关注</legend>
        <div>{(['open', ...focusable] as const).map((id) => <Action key={id} tone={focus === id ? 'primary' : 'secondary'}
          aria-pressed={focus === id} onClick={() => setFocus(id)}>{id === 'open' ? '先核实情况' : RISKS[id].name}</Action>)}</div>
      </fieldset>
      <p className="nv-note">交接后会收回测试权限。证物簿保留，剩余 {run.points} 点不会带入下一幕。</p>
    </Modal>}
  </>;
}

export function Investigation({ run, notebook, onNotebook }: { run: CaseState; notebook: boolean; onNotebook: (visible: boolean) => void }) {
  const [visit, setVisit] = useState<Visit>({ place: 'room' });
  const [evidence, setEvidence] = useState<EvidenceId[]>([]);
  const [backToNotebook, setBackToNotebook] = useState(false);
  const [memory, setMemory] = useState<Partial<Record<ContactId, ConversationMemory>>>({});
  const activeEvidence = evidence.at(-1);
  const confirmed = confirmedRisks(run).length;

  function go(place: Place) {
    sfx.flip(); setVisit({ place }); setEvidence([]); setBackToNotebook(false); onNotebook(false);
  }

  function openEvidence(id: EvidenceId, fromNotebook = false) {
    sfx.click(); setEvidence([id]); setBackToNotebook(fromNotebook); onNotebook(false);
  }

  function closeEvidence() {
    setEvidence([]);
    if (backToNotebook) onNotebook(true);
    setBackToNotebook(false);
  }

  function meet(npc: ContactId, from: 'meet' | 'service') {
    sfx.flip(); setVisit({ place: 'contact', npc, from }); setEvidence([]); setBackToNotebook(false); onNotebook(false);
  }

  const roomLine = run.mode === 'quick' && !confirmedRisks(run).includes('H1')
    ? '留给我的演示记录里，有一份已经核过的教师账号。点开桌上的手机，能找到那条消息。'
    : confirmed ? '我把推演的结论记在本子上。再问问其他人，或者到服务中心把记录交过去。'
      : run.saved.includes('E1') && run.saved.includes('E2') ? '墙上的公告和群里的消息写了两个入口。我得问问，那条转发是谁发的。'
        : '桌上的手机还亮着。墙上那张新钉的公告，和周宁手里的消息说的是同一件事吗？';

  return <>
    {visit.place === 'room' && <NovelScene background={ASSETS.activityRoom} location="文化节活动室" time={run.time} variant="room"
      line={{ voice: 'self', text: roomLine, source: run.mode === 'quick' ? '含演示预置' : undefined }}
      decoration={<div className="nv-hotspots" aria-label="可调查的物件">
        {CASE_HOTSPOTS.map((point) => {
          const prop = PROPS[point.icon];
          const Icon = prop.icon;
          return <button key={point.id} type="button" className={`nv-hotspot${run.saved.includes(prop.id) ? ' is-saved' : ''}`}
            style={{ '--nv-prop-x': `${point.x}%`, '--nv-prop-y': `${point.y}%` } as CSSProperties} onClick={() => openEvidence(prop.id)}>
            <span><Icon size={19} aria-hidden="true" /></span><strong>{prop.name}</strong>
          </button>;
        })}
      </div>}
      actions={<>
        <Action tone="primary" onClick={() => go('meet')}><MessageCircle size={16} /> 去问问在场的人</Action>
        <Action onClick={() => go('analysis')}><FlaskConical size={16} /> 在桌边对照证物</Action>
        <Action tone="quiet" onClick={() => go('handoff')}>去交接 <ArrowRight size={15} /></Action>
      </>} />}
    {(visit.place === 'meet' || visit.place === 'service') && <NovelScene background={visit.place === 'meet' ? ASSETS.activityRoom : ASSETS.serviceHall}
      location={visit.place === 'meet' ? '活动室 · 门口' : '校园服务中心'} time={run.time} onBack={() => go('room')}
      line={{ voice: 'narrator', text: visit.place === 'meet' ? '周宁还在等消息。林夏刚从走廊回来，许言坐在门边，膝上摊着一张分组表。'
        : '玻璃门一推开，办公桌那头的顾老师抬起头。陈老师正在柜台旁等人。' }}
      actions={visit.place === 'meet' ? <>
        {(['linxia', 'zhouning', 'xuyan'] as const).map((npc) => <Action key={npc} onClick={() => meet(npc, 'meet')}>问{CONTACTS[npc].name}</Action>)}
        <SceneAction onClick={() => go('service')}>走去服务中心</SceneAction>
      </> : <>
        {(['chen', 'gu'] as const).map((npc) => <Action key={npc} onClick={() => meet(npc, 'service')}>找{CONTACTS[npc].name}</Action>)}
        <Action tone="quiet" onClick={() => go('meet')}>回门口找同学</Action>
      </>} />}
    {visit.place === 'contact' && <ContactScene key={visit.npc} run={run} npc={visit.npc} memory={memory[visit.npc]}
      onMemory={(entry) => { const npc = visit.npc; setMemory((previous) => ({ ...previous, [npc]: entry })); }}
      onBack={() => go(visit.from)} onEvidence={openEvidence} />}
    {visit.place === 'analysis' && <AnalysisScene run={run} onBack={() => go('room')} onHandoff={() => go('handoff')} />}
    {visit.place === 'handoff' && <HandoffScene run={run} onBack={() => go('room')} />}
    {notebook && !activeEvidence && <EvidenceNotebook run={run} onClose={() => onNotebook(false)} onOpen={(id) => openEvidence(id, true)} />}
    {activeEvidence && <EvidenceSlip key={activeEvidence} run={run} id={activeEvidence} onClose={closeEvidence}
      onBack={evidence.length > 1 ? () => setEvidence((items) => items.slice(0, -1)) : undefined}
      onRelated={(id) => setEvidence((items) => [...items, id])} onVerifyAccount={() => meet('chen', 'service')} />}
  </>;
}
