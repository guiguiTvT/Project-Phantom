import { Archive, ArrowLeft, ArrowRight, Check, FileText, FlaskConical, Plus, ShieldCheck, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { ASSETS } from '../data/assets';
import { sfx } from '../audio/sound';
import { EVIDENCE, EVIDENCE_IDS, RISKS, RISK_IDS, type EvidenceId, type RiskId } from './caseFile';
import { evidenceStatus, reviewEvidence, SIMULATION_COST, validSavedEvidence, verificationRecords, type CaseState, type SimulationReview } from './caseEngine';
import { useCaseSession } from './caseStore';
import { Action, Badge, Modal, Next } from './components';
import { NovelScene, ScriptScene, type StoryLine } from './NovelScene';

export const SIMULATION_LABEL = { confirmed: '判断已确认', insufficient: '依据不足', incorrect: '需要纠正判断' } as const;

export function EvidenceSlip({ run, id, onClose, onBack, onRelated, onVerifyAccount }: {
  run: CaseState; id: EvidenceId; onClose: () => void; onBack?: () => void;
  onRelated: (id: EvidenceId) => void; onVerifyAccount: () => void;
}) {
  const act = useCaseSession((state) => state.act);
  const card = EVIDENCE[id];
  const saved = run.saved.includes(id);
  const records = verificationRecords(run, id);
  const chat = id === 'E2' || id === 'E4' || id === 'E8';
  return <Modal title={card.title} onClose={onClose} scrollKey={`${run.id}-${id}`} wide footer={<div className="pp-action-row pp-action-row--split"><Action onClick={onClose}>收起</Action>
    <Action tone="primary" onClick={() => { if (act({ type: 'save', evidence: id })) sfx.collect(); }} disabled={saved}>
      {saved ? <Check size={16} /> : <Archive size={16} />} {saved ? '已存入证物簿' : '留作证据'}
    </Action>
  </div>}>
    {onBack && <Action tone="quiet" onClick={onBack}><ArrowLeft size={16} /> 上一份材料</Action>}
    <div className={`nv-prop${chat ? ' nv-prop--phone' : ''}`}>
      <div className="nv-prop-source">{chat ? <Smartphone size={17} /> : <FileText size={17} />}<span>{card.source}</span><time>{card.time}</time></div>
      <div className="nv-prop-text">{card.text.map((line) => <p key={line}>{line}</p>)}</div>
    </div>
    {records.map((record) => <div className="pp-inset nv-verified-stamp" key={record.source}>
      <strong><ShieldCheck size={17} /> {record.source}{record.preset ? ' · 演示预置' : ''}</strong><p>{record.record}</p>
    </div>)}
    <p className="nv-note"><span>{id} · {evidenceStatus(run, id)}</span> {card.limit}</p>
    <div className="nv-slip-links">
      {card.related.map((related) => <Action key={related} tone="quiet" onClick={() => onRelated(related)}>
        {id === 'E2' && related === 'E4' ? '查看原消息' : EVIDENCE[related].title}<ArrowRight size={14} />
      </Action>)}
      {id === 'E4' && !run.verified.includes('chen') && <Action tone="quiet" onClick={onVerifyAccount}>从通讯录联系陈老师 <ArrowRight size={14} /></Action>}
    </div>
  </Modal>;
}

export function EvidenceNotebook({ run, onClose, onOpen }: { run: CaseState; onClose: () => void; onOpen: (id: EvidenceId) => void }) {
  const [all, setAll] = useState(false);
  const cards = all ? EVIDENCE_IDS : run.saved;
  return <Modal title="证物簿" onClose={onClose} wide>
    <div className="nv-book-tabs"><Action tone={all ? 'secondary' : 'primary'} aria-pressed={!all} onClick={() => setAll(false)}>留下的证物 · {run.saved.length}</Action>
      <Action tone={all ? 'primary' : 'secondary'} aria-pressed={all} onClick={() => setAll(true)}>翻查其他材料</Action></div>
    {!cards.length && <p className="pp-muted">簿子还是空的。先去看桌上的手机或墙上的公告。</p>}
    <ol className="nv-records">{cards.map((id) => <li key={id}><button type="button" onClick={() => onOpen(id)}>
      <span className="pp-mono">{id}</span><span><strong>{EVIDENCE[id].title}</strong><small>{run.saved.includes(id) ? evidenceStatus(run, id) : EVIDENCE[id].source}</small></span>
      <ArrowRight size={15} aria-hidden="true" />
    </button></li>)}</ol>
  </Modal>;
}

function Gaps({ review }: { review: SimulationReview }) {
  return <ul className="pp-bullets">
    {review.missing.map((gap) => <li key={gap}>{gap}</li>)}
    {review.misused.map((id) => <li key={id}>{id === 'E8' ? '这份反馈只说明来电发生在报名之后，还不能证明资料泄露。' : `「${EVIDENCE[id].title}」还不能用来支持这条判断。`}</li>)}
  </ul>;
}

function LayOutEvidence({ run, risk, onClose, onPlay }: { run: CaseState; risk: RiskId; onClose: () => void; onPlay: () => void }) {
  const act = useCaseSession((state) => state.act);
  const [view, setView] = useState<'arrange' | 'check' | 'confirm'>('arrange');
  const item = RISKS[risk];
  const slots = run.slots[risk];
  const result = run.simulations[risk];
  const review = reviewEvidence(run, risk);
  const emptySlot = slots.indexOf(null);
  const frozen = result?.status === 'confirmed';
  const revised = JSON.stringify(review) !== JSON.stringify(result);

  function place(index: number, evidence: EvidenceId | null) {
    if (act({ type: 'slot', risk, index, evidence })) sfx.select();
  }

  return <Modal key={view} title={view === 'confirm' ? '运行推演' : view === 'check' ? '证物核对' : item.claim} onClose={onClose} wide footer={view === 'confirm'
    ? <div className="pp-action-row pp-action-row--split"><Action onClick={() => setView('arrange')}>再看看材料</Action>
      <Next onClick={() => { if (act({ type: 'simulate', risk })) { sfx.flip(); onPlay(); } }}>
        {review.status === 'confirmed' ? '开始推演 · 2 点' : '按现有证据推演 · 2 点'}
      </Next></div>
    : <div className="pp-action-row pp-action-row--split">
      <Action onClick={() => setView(view === 'check' ? 'arrange' : 'check')}>{view === 'check' ? '返回证物' : '检查依据'}</Action>
      {result ? !frozen && <Next disabled={!revised} onClick={() => { if (act({ type: 'recheck', risk })) onClose(); }}>更新判断 · 免费</Next>
        : <Next disabled={run.points < SIMULATION_COST} onClick={() => setView('confirm')}><FlaskConical size={15} /> 运行推演 · 2 点</Next>}
    </div>}>
    {view === 'confirm' ? <>
      <p>把这 {review.evidence.length} 份材料送入隔离副本。运行消耗 2 点，之后可以免费补证。</p>
      {review.status !== 'confirmed' && <div className="pp-inset"><Gaps review={review} /></div>}
    </> : view === 'check' ? <>
      <p className="pp-muted">{item.claim}</p>
      <div className="pp-inset" aria-live="polite">{review.status === 'confirmed' ? '这几份材料能相互印证。' : <Gaps review={review} />}</div>
    </> : <>
      <p className="pp-muted">{frozen ? '这几份材料已作为判断的依据。' : '从下面挑出有关的证物，放到这条判断里。'}</p>
      <div className="nv-evidence-slots">
        {item.slots.map((label, index) => {
          const card = slots[index];
          return <div key={label} className={card ? 'is-filled' : ''} onDragOver={(event) => { if (!frozen) event.preventDefault(); }}
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData('text/plain');
              if (validSavedEvidence(id)) place(index, id);
            }}>
            <span><small>{label}</small><strong>{card ? EVIDENCE[card].title : '待补材料'}</strong></span>
            {card && !frozen && <button type="button" className="pp-icon-button" aria-label={`移出 ${card}`} onClick={() => place(index, null)}><X size={16} /></button>}
          </div>;
        })}
      </div>
      {!frozen && <div className="nv-evidence-pick" aria-label="可以放入的证物">
        {!run.saved.length && <p className="pp-muted">还没有证物。可以返回房间查看物件。</p>}
        {run.saved.map((id) => <Action draggable={!slots.includes(id)} disabled={slots.includes(id) || emptySlot < 0} key={id}
          onDragStart={(event) => event.dataTransfer.setData('text/plain', id)} onClick={() => place(emptySlot, id)}>
          {slots.includes(id) ? <Check size={15} /> : <Plus size={15} />} {id} {EVIDENCE[id].title}
        </Action>)}
      </div>}
      {!result && run.points < SIMULATION_COST && <p className="nv-note">行动点不足。你仍可带着当前的材料交接。</p>}
    </>}
  </Modal>;
}

export function AnalysisScene({ run, onBack, onHandoff }: { run: CaseState; onBack: () => void; onHandoff: () => void }) {
  const [risk, setRisk] = useState<RiskId | null>(null);
  const [editor, setEditor] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const base = { background: ASSETS.activityRoom, location: '活动室 · 桌边', time: run.time };

  if (!risk) return <NovelScene {...base} onBack={onBack} line={{ voice: 'self', text: '我把线索摊在桌上。那几个问题得分开看，我先挑一个验证。' }}
    actions={<>{RISK_IDS.map((id) => <Action key={id} onClick={() => {
      setRisk(id);
      if (!run.simulations[id]) setEditor(true);
    }}>{RISKS[id].name} {run.simulations[id]?.status === 'confirmed' && <Check size={15} />}</Action>)}</>} />;

  const item = RISKS[risk];
  const result = run.simulations[risk];
  if (playing) {
    const frames: StoryLine[] = item.demonstration.map((text, index) => ({ voice: 'system', text, background: index === 1 ? ASSETS.cg.reversalAtrium : ASSETS.cg.reversalCorridor }));
    return <ScriptScene {...base} location="隔离副本 · 推演中" variant="simulation" lines={frames}
      finishLabel="查看推演结果" skipLabel="跳过演出" onFinish={() => setPlaying(false)} />;
  }
  const line: StoryLine = result ? {
    voice: 'system', source: SIMULATION_LABEL[result.status], text: result.status === 'confirmed' ? item.supported : item.limited,
  } : { voice: 'self', text: item.claim + '。这个判断要靠手里的记录来验证。' };
  return <>
    <NovelScene {...base} line={line} onBack={() => setRisk(null)} backLabel="换一个判断" actions={<>
      {result && <Action onClick={() => setResultOpen(true)}>翻看推演记录</Action>}
      {result?.status !== 'confirmed' && <Action onClick={() => setEditor(true)}>{result ? '重新摆放证物' : '摆放证物'}</Action>}
      <Action tone="primary" onClick={onHandoff}>交出调查记录 <ArrowRight size={15} /></Action>
    </>} />
    {editor && <LayOutEvidence run={run} risk={risk} onClose={() => setEditor(false)} onPlay={() => { setEditor(false); setPlaying(true); }} />}
    {resultOpen && result && <Modal title="推演记录" onClose={() => setResultOpen(false)} wide>
      <Badge tone={result.status === 'confirmed' ? 'good' : 'warning'}>{SIMULATION_LABEL[result.status]}</Badge>
      <dl className="nv-simulation-result"><div><dt>这次验证了什么</dt><dd>{line.text}{risk === 'H2' && result.evidence.includes('E7') && ' 接入名单中没有报名助手。'}</dd></div>
        <div><dt>还有什么不确定</dt><dd>{item.boundary}{result.status !== 'confirmed' && <Gaps review={result} />}</dd></div>
        <div><dt>交接后可以做什么</dt><dd>{item.remedy}</dd></div></dl>
      <p className="pp-small pp-muted">引用 {result.evidence.join('、') || '无'}{run.events.some((event) => event.risk === risk && event.preset) && ' · 演示预置'}</p>
    </Modal>}
  </>;
}
