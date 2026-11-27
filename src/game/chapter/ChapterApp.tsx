import { BookOpen, Home, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EVIDENCE, RISKS, RISK_IDS, VERIFICATIONS, type Mode, type Phase } from './caseFile';
import { confirmedRisks, evidenceStatus, STARTING_POINTS, type CaseState } from './caseEngine';
import { syncCaseTabs, useCaseSession } from './caseStore';
import { Action, Badge, Brand, Modal, Next, Settings, useLessMotion } from './components';
import { Briefing, Opening } from './Opening';
import { Investigation } from './Investigation';
import { Defense, Protection, Reversal } from './Student';
import { Conclusion } from './Conclusion';
import './chapter.css';

const OPEN_KEY = 'phantom.chapter.open';
const ROLE: Record<Phase, string> = { briefing: '序章', investigation: '获授权测试员', reversal: '交接', protection: '学生 · 沈一', defense: '学生 · 沈一', ending: '尾声' };

function markOpen(id?: string) {
  try { if (id) sessionStorage.setItem(OPEN_KEY, id); else sessionStorage.removeItem(OPEN_KEY); } catch { /* In-memory browsing still works. */ }
}

function savedInThisTab(run: CaseState | null) {
  try { return Boolean(run && sessionStorage.getItem(OPEN_KEY) === run.id); } catch { return false; }
}

function ArchiveDialog({ run, onClose }: { run: CaseState; onClose: () => void }) {
  const confirmed = confirmedRisks(run);
  return <Modal title="已交接的调查记录" onClose={onClose} wide>
    <div className="pp-summary-lines">{RISK_IDS.map((id) => <div key={id}><strong>{RISKS[id].name}</strong><Badge tone={confirmed.includes(id) ? 'good' : 'muted'}>
      {confirmed.includes(id) ? '判断已确认' : run.simulations[id] ? '仍有疑点' : '未模拟'}</Badge></div>)}</div>
    {!!run.verified.length && <div className="pp-inset"><strong><ShieldCheck size={17} /> 正式核实记录</strong>
      {run.verified.map((id) => <p key={id}>{VERIFICATIONS[id].evidence} · {VERIFICATIONS[id].record}</p>)}</div>}
    <h3>已保存证据</h3>
    {run.saved.length ? run.saved.map((id) => <details key={id} className="pp-event-details">
      <summary>{id} · {EVIDENCE[id].title}</summary><p className="pp-small pp-muted">{EVIDENCE[id].source} · {EVIDENCE[id].time} · {evidenceStatus(run, id)}</p>
      {EVIDENCE[id].text.map((line) => <p key={line}>{line}</p>)}</details>) : <p className="pp-muted">调查阶段没有保存证据。</p>}
    <div className="pp-action-row"><Action onClick={onClose}>返回当前任务</Action></div>
  </Modal>;
}

type Gate = { mode: Mode; quiz: boolean } | 'clear' | null;

export default function ChapterApp() {
  const run = useCaseSession((state) => state.run);
  const outdated = useCaseSession((state) => state.outdated);
  const storageFailed = useCaseSession((state) => state.storageFailed);
  const start = useCaseSession((state) => state.start);
  const clear = useCaseSession((state) => state.clear);
  const [active, setActive] = useState(() => savedInThisTab(run));
  const [gate, setGate] = useState<Gate>(null);
  const [notebook, setNotebook] = useState(false);
  const reduced = useLessMotion();
  const main = useRef<HTMLElement>(null);
  const phase = run?.phase;
  useEffect(syncCaseTabs, []);
  useEffect(() => { if (active) main.current?.focus({ preventScroll: true }); }, [active, phase]);

  function openRun() {
    markOpen(useCaseSession.getState().run?.id); setActive(true); setNotebook(false); setGate(null);
  }

  function begin(mode: Mode, quiz: boolean) { start(mode, quiz); openRun(); }
  function home() { markOpen(); setActive(false); setNotebook(false); }
  function askStart(mode: Mode, quiz: boolean) { if (run) setGate({ mode, quiz }); else begin(mode, quiz); }

  return <div className="pp" data-reduce-motion={reduced}>
    {!active || !run ? <Opening run={run} outdated={outdated} onStart={askStart} onResume={openRun} /> : <>
      <header className="nv-hud">
        <div className="nv-hud-inner">
          <div className="nv-brand"><button type="button" className="pp-icon-button" title="返回封面" aria-label="返回首页" onClick={home}><Home size={17} /></button><Brand /></div>
          <div className="nv-hud-role"><span>{ROLE[run.phase]}</span>{phase === 'defense' && <small>{run.round} / 4</small>}</div>
          <div className="nv-hud-tools">
            {phase === 'investigation' && <div className="nv-points" aria-label={`行动点 ${run.points} / 6`}>行动点<span aria-hidden="true">{Array.from({ length: STARTING_POINTS }, (_, index) => <i key={index} className={index < run.points ? 'is-filled' : ''} />)}</span><strong>{run.points}</strong></div>}
            {phase !== 'briefing' && <button className="nv-book-button" type="button" aria-label="打开证物簿" onClick={() => setNotebook(true)}>
              <BookOpen size={17} aria-hidden="true" /><span>证物簿</span><strong>{run.saved.length}</strong></button>}
            <Settings />
          </div>
        </div>
      </header>
      <main ref={main} tabIndex={-1} className="nv-main">
        {storageFailed && <p className="pp-inset" role="status">本机存储不可用。当前仍可继续，刷新可能丢失进度。</p>}
        {phase === 'briefing' && <Briefing key={run.id} run={run} />}
        {phase === 'investigation' && <Investigation key={run.id} run={run} notebook={notebook} onNotebook={setNotebook} />}
        {phase === 'reversal' && <Reversal key={run.id} run={run} />}
        {phase === 'protection' && <Protection key={run.id} run={run} />}
        {phase === 'defense' && <Defense key={run.id} run={run} />}
        {phase === 'ending' && <Conclusion key={run.id} run={run} onHome={home} onRestart={() => setGate({ mode: run.mode, quiz: false })} onClear={() => setGate('clear')} />}
      </main>
      {notebook && phase !== 'briefing' && phase !== 'investigation' && <ArchiveDialog run={run} onClose={() => setNotebook(false)} />}
    </>}
    {gate && <Modal title={gate === 'clear' ? '清除本机记录？' : '开始新的一局？'} onClose={() => setGate(null)}>
      <p>{gate === 'clear' ? '当前进度、旧版游戏存档和本机情境题记录将被清除。' : '当前这一局的游戏进度会被替换。'}</p>
      <div className="pp-action-row pp-action-row--split"><Action onClick={() => setGate(null)}>取消</Action>
        <Next onClick={() => {
          if (gate === 'clear') { clear(); setGate(null); home(); }
          else begin(gate.mode, gate.quiz);
        }}>{gate === 'clear' ? '确认清除' : '确认重开'}</Next></div>
    </Modal>}
  </div>;
}
