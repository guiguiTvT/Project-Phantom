import { ArrowRight, BookOpen, ChevronRight, Contact, Home, UserRound } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Action, Badge, Brand, Modal, Next, Settings, useLessMotion } from '../chapter/components';
import { ASSETS } from '../data/assets';
import { CaseReceipt, CaseScene, SHORT_TITLE } from './CaseScene';
import { ContactScene } from './ContactScene';
import { Finale, Followup, RoleSwitch } from './Finale';
import { MaterialDeck, ModalActions } from './Interactions';
import { Prologue } from './Prologue';
import { currentCase, type Campaign } from './engine';
import { openInTab, syncCampaignTabs, tabRun, useCampaign } from './store';
import '../chapter/chapter.css';
import './campaign.css';
import './play.css';

function Cover({ run, onBegin, onResume }: { run: Campaign | null; onBegin: () => void; onResume: () => void }) {
  return <main className="pp-cover c6-cover" style={{ '--pp-art': `url("${ASSETS.cover}")` } as CSSProperties}>
    <div className="pp-cover-frame">
      <header className="pp-cover-header"><Brand /><Settings /></header>
      <div className="pp-cover-body">
        <p className="pp-cover-kicker"><span /> 澄川大学 · 科技文化节前夕</p>
        <h1>破壁<span>行动</span></h1>
        <p className="pp-cover-story">周宁填完了报名表，志愿者名单上却没有他的名字。林夏抬起手机。那条报名消息，又被顶上来了。</p>
        <div className="c6-cover-actions">
          {run && <Next onClick={onResume}>{run.stage === 'ending' ? '查看上次结局' : '继续上次演练'}</Next>}
          <Action tone={run ? 'secondary' : 'primary'} onClick={onBegin}>{run ? '开始新故事' : '走进活动室'}<ArrowRight size={17} aria-hidden="true" /></Action>
        </div>
      </div>
      <footer className="pp-cover-foot">四案均为虚构演练，无需真实注册、付款或开启设备共享。</footer>
    </div>
  </main>;
}

function Notebook({ run, onClose }: { run: Campaign; onClose: () => void }) {
  const [active, setActive] = useState<number>();
  const [tab, setTab] = useState<'materials' | 'checks' | 'receipt'>('materials');
  const definition = currentCase(run);
  const progress = run.cases[definition.id];
  if (active !== undefined) return <MaterialDeck materials={definition.files} ids={progress.seen}
    initial={active} onClose={() => setActive(undefined)} />;
  const checks = definition.steps.filter((step) => (step.kind === 'puzzle' || step.kind === 'verify') && progress.completed[step.id]);
  return <Modal title={`${SHORT_TITLE[definition.id]} · 随身笔记`} onClose={onClose} wide
    footer={<ModalActions><Next onClick={onClose}>回到现场</Next></ModalActions>}>
    <div className="c6-badges">
      <Action aria-pressed={tab === 'materials'} onClick={() => setTab('materials')}>已收材料</Action>
      <Action aria-pressed={tab === 'checks'} onClick={() => setTab('checks')}>核查结论</Action>
      {progress.disposition && <Action aria-pressed={tab === 'receipt'} onClick={() => setTab('receipt')}>处理归档</Action>}
    </div>
    {tab === 'materials' && (progress.seen.length ? <div className="c6-record-list">
      {progress.seen.map((id, index) => <button className="c6-material-row" key={id} type="button" onClick={() => setActive(index)}>
        <span><strong>{definition.files[id].title}</strong><small>{definition.files[id].source}</small></span><ChevronRight size={16} aria-hidden="true" />
      </button>)}
    </div> : <p>还没有收进笔记的材料。回到现场，按当前目标打开第一份材料。</p>)}
    {tab === 'checks' && (checks.length ? <div className="c6-record-list">{checks.map((step) => {
      const done = progress.completed[step.id] === 'done';
      return <article key={step.id}><h3>{step.goal} <Badge tone={done ? 'good' : 'warning'}>{done ? '已核查' : '待核实'}</Badge></h3>
        {done && <p>{step.kind === 'puzzle' ? step.conclusion : step.kind === 'verify' ? step.confirmation : ''}</p>}
      </article>;
    })}</div> : <p>核查有结果后会显示在这里。</p>)}
    {tab === 'receipt' && <CaseReceipt run={run} id={definition.id} />}
  </Modal>;
}

export default function CampaignApp() {
  const { run, storageFailed, start, act } = useCampaign();
  const reduced = useLessMotion();
  const [open, setOpen] = useState(tabRun);
  const [dialog, setDialog] = useState<'notebook' | 'contacts' | 'restart'>();
  useEffect(syncCampaignTabs, []);
  const active = run && run.id === open;
  const definition = run && currentCase(run);
  const red = run?.stage === 'case' && run.caseIndex < 2;
  const inCase = run?.stage === 'case';
  const progress = run && definition && run.cases[definition.id];
  const role = red ? '沈一 · 临时红客' : run?.stage === 'opening' ? '沈一 · 志愿者'
    : run?.stage === 'switch' ? '沈一 · 交回授权' : run?.stage === 'ending' ? '尾声' : '沈一 · 学生';
  const home = () => { openInTab(); setOpen(null); setDialog(undefined); };
  function enter(id: string) {
    openInTab(id);
    setOpen(id);
    setDialog(undefined);
  }
  const startNew = () => enter(start().id);
  const sceneKey = run && `${run.id}:${run.stage}:${run.caseIndex}:${run.stepIndex}`;
  return <div className={`pp c6${red ? ' c6--red' : ' c6--student'}`} data-reduce-motion={reduced}>
    {!active && <Cover run={run} onResume={() => { if (run) enter(run.id); }}
      onBegin={() => run ? setDialog('restart') : startNew()} />}
    {active && run && definition && progress && <>
      <header className="nv-hud">
        <div className="nv-hud-inner">
          <div className="nv-brand"><button type="button" className="pp-icon-button" aria-label="返回标题" onClick={home}><Home size={16} aria-hidden="true" /></button><Brand /></div>
          <div className="nv-hud-role">
            {inCase && <small>{definition.number} / 4</small>}<UserRound size={15} aria-hidden="true" /><span>{role}</span>
            {inCase && <strong className="c6-case-name" title={definition.title}>{definition.title}</strong>}
          </div>
          <div className="nv-hud-tools">
            {red && inCase && <span className="nv-points" aria-label={`行动点 ${6 - progress.requiredSpent - progress.extraSpent} / 6`}
              title={`主线预留 ${4 - progress.requiredSpent}，自由行动 ${2 - progress.extraSpent}`}><span className="c7-point-label">行动点</span>
              <strong>{6 - progress.requiredSpent - progress.extraSpent} / 6</strong></span>}
            {inCase && <button type="button" className="nv-book-button" aria-label="随身笔记" onClick={() => setDialog('notebook')}>
              <BookOpen size={16} aria-hidden="true" /><span>笔记</span><strong>{progress.seen.length}</strong>
            </button>}
            {inCase && <button type="button" className="pp-icon-button c6-contacts" aria-label="联系人" title="联系人" onClick={() => setDialog('contacts')}>
              <Contact size={17} aria-hidden="true" />
            </button>}
            <Settings />
          </div>
        </div>
      </header>
      <main className="nv-main" aria-label="故事现场">
        {run.stage === 'opening' && <Prologue key={run.id} run={run} act={act} />}
        {run.stage === 'case' && <CaseScene key={sceneKey} run={run} dispatch={act} />}
        {run.stage === 'switch' && <RoleSwitch key={run.id} run={run} dispatch={act} />}
        {run.stage === 'followup' && <Followup key={run.id} run={run} dispatch={act} />}
        {run.stage === 'ending' && <Finale key={run.id} run={run} dispatch={act} onHome={home} />}
      </main>
    </>}
    {storageFailed && <div className="c6-storage" role="status">浏览器暂时无法保存，当前演练仍可继续。</div>}
    {dialog === 'notebook' && active && run && inCase && <Notebook key={sceneKey} run={run} onClose={() => setDialog(undefined)} />}
    {dialog === 'contacts' && active && run && inCase && <ContactScene key={sceneKey} run={run} dispatch={act} onClose={() => setDialog(undefined)} />}
    {dialog === 'restart' && <Modal title="开始新故事" onClose={() => setDialog(undefined)}
      footer={<ModalActions><Action onClick={() => setDialog(undefined)}>返回</Action><Next onClick={startNew}>从活动室开始</Next></ModalActions>}>
      <p>开始后，本浏览器的上次四案进度将由新演练替换。</p>
    </Modal>}
  </div>;
}
