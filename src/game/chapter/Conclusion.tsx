import { ArrowRight, BadgeCheck, ClipboardList, FileText, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CauseId } from '../../../functions/shared/chapterAi';
import { ASSETS } from '../data/assets';
import { askRecap } from './caseApi';
import { ENDINGS, RISKS, RISK_IDS, type EndingId } from './caseFile';
import { COVERAGE_LABEL, determineEnding, type CaseEvent, type CaseState } from './caseEngine';
import { actionStyle, buildCauses, explainEnding } from './caseResults';
import { pairedGroup, useCaseSession } from './caseStore';
import { Action, Badge, Modal } from './components';
import { NovelScene, SceneAction } from './NovelScene';
import { epilogue } from './script';
import { Quiz } from './Opening';
import { QUESTIONS, score } from './questions';

function EventList({ events }: { events: CaseEvent[] }) {
  return <ol className="pp-event-list">{events.map((event) => <li key={event.id}>
    <div><time>{event.after.time}</time><strong>{event.title}</strong>{event.preset && <Badge>演示预置</Badge>}</div>
    <p>{event.detail}</p>
    {(Boolean(event.spent) || event.evidence.length > 0 || event.receipt) && <small className="pp-muted">
      {[event.spent && `${event.before.points} → ${event.after.points} 行动点`, event.evidence.length && event.evidence.join('、'), event.receipt && `回执 ${event.receipt}`].filter(Boolean).join(' · ')}
    </small>}
  </li>)}</ol>;
}

function Recap({ run, ending }: { run: CaseState; ending: EndingId }) {
  const causes = buildCauses(run);
  const [order, setOrder] = useState<CauseId[] | null>(null);
  const [mode, setMode] = useState<'local' | 'loading' | 'live' | 'fallback'>('local');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function generate() {
    if (pending.current) return;
    const request = new AbortController();
    pending.current = request;
    setMode('loading');
    const result = await askRecap({ causes: causes.map((cause) => cause.id), ending, pending: run.world.pending.length, rosterAt: run.world.rosterAt }, request.signal);
    if (request.signal.aborted) return;
    pending.current = null;
    setOrder(result);
    setMode(result ? 'live' : 'fallback');
  }

  const selected = order ? order.flatMap((id) => causes.filter((cause) => cause.id === id)) : causes.slice(0, 3);
  return <section className="pp-panel pp-recap">
    <div className="pp-panel-head"><h2><ClipboardList size={20} /> 为什么走到了这里</h2><Badge tone={mode === 'live' ? 'good' : 'default'}>{mode === 'live' ? '实时复盘' : '本局日志'}</Badge></div>
    <div className="pp-causes">
      {selected.map((cause) => <details key={cause.id} className="pp-event-details"><summary>{cause.text}</summary><EventList events={cause.events} /></details>)}
    </div>
    <p className="pp-inset"><strong>接下来</strong> {ENDINGS[ending].next}</p>
    <div className="pp-action-row pp-action-row--split"><span className="pp-small pp-muted" role="status">{mode === 'fallback' ? '当前为预置复盘，依据仍来自本局。' : mode === 'live' ? '模型按本局处置结果排列已发生的因果记录。' : '展开任一原因，查看当时的操作和执行回执。'}</span>
      {(mode === 'local' || mode === 'loading') && <Action disabled={mode === 'loading'} onClick={() => void generate()}><Sparkles size={16} />{mode === 'loading' ? '正在复盘…' : '生成情境复盘'}</Action>}</div>
  </section>;
}

function Style({ run }: { run: CaseState }) {
  const style = actionStyle(run);
  return <section className="pp-panel pp-style">
    <div className="pp-panel-head"><h2>本局行动风格</h2>{style.code && <Badge>{style.code}</Badge>}</div>
    {style.code && <div className="pp-style-portrait"><img loading="lazy" src={ASSETS.personality[style.code]} alt="" /><div><div className="pp-kicker">{style.code}</div><h3>{style.name}</h3></div></div>}
    <p className="pp-muted">这些倾向来自这一局的操作。预置调查和提示不计入。</p>
    <div className="pp-style-grid">
      {style.dimensions.map((dimension) => <details key={dimension.name} className="pp-event-details"><summary><small>{dimension.name}</small><strong>{dimension.label}</strong></summary>
        {dimension.evidence.length ? <ul className="pp-bullets">{dimension.evidence.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>本局没有足够的记录。</p>}
      </details>)}
    </div>
  </section>;
}

function QuizAfter({ run }: { run: CaseState }) {
  const entry = useCaseSession((state) => state.quizzes.runs[run.id]);
  const recordQuiz = useCaseSession((state) => state.recordQuiz);
  const [open, setOpen] = useState(false);
  if (!entry) return null;
  const postGroup = pairedGroup(entry.preGroup);
  if (entry.post && entry.pre) return <section className="pp-panel">
    <h2>本次情境题记录</h2><p>入场答对 {score(entry.preGroup, entry.pre)} / 3 题，离场答对 {score(postGroup, entry.post)} / 3 题。</p>
    <details className="pp-event-details"><summary>查看题目解释</summary>
      {([entry.preGroup, postGroup] as const).map((group, index) => <div key={group}><h3>{index === 0 ? '入场题' : '离场题'}</h3><ol className="pp-bullets">
        {QUESTIONS[group].map((question) => <li key={question.prompt}>{question.reason}</li>)}</ol></div>)}
    </details>
  </section>;
  if (entry.post) return <section className="pp-panel"><h2>离场题已记录</h2><p className="pp-muted">需要完成入场与离场两组情境题，才能在本机对照得分。</p></section>;
  return open ? <Quiz kind="post" group={postGroup} onFinish={(answers) => recordQuiz('post', answers)} onSkip={() => setOpen(false)} />
    : <section className="pp-panel pp-post-offer"><div><h2>试试另一个情境</h2><p className="pp-muted">三道离场题，可随时跳过。</p></div><Action onClick={() => setOpen(true)}>开始离场情境题<ArrowRight size={16} /></Action></section>;
}

function EndingReport({ run, ending, onClear }: { run: CaseState; ending: EndingId; onClear: () => void }) {
  const { pending, paused, cooperation, policy, rosterAt } = run.world;
  const results = [
    ['后续风险途径', `${3 - pending.length} / 3 已阻断`], ['官方报名', paused ? '全面暂停' : '开放'],
    ['后续协作', cooperation ? '已安排负责人' : '尚未建立'], ['长期规则', policy ? '已落实' : '待跟进'],
    ['志愿者分组', rosterAt ? rosterAt > '12:00' ? `${rosterAt} 名单已交付，需补排` : `${rosterAt} 名单已交付，可按时分组` : '名单待确认'],
  ];
  return <div className="nv-report">
    <p className="nv-report-intro">{explainEnding(run, ending)}</p>
    <div className="nv-report-grid">
      <section className="pp-panel">
        <div className="pp-panel-head"><h2><BadgeCheck size={20} /> 三条风险的去向</h2></div>
        <div className="pp-summary-lines">{RISK_IDS.map((id) => <div key={id}><strong>{RISKS[id].name}</strong>
          <Badge tone={pending.includes(id) ? 'warning' : 'good'}>{pending.includes(id) ? '待处理' : '已阻断'}</Badge></div>)}</div>
        <p className="pp-small pp-muted">{COVERAGE_LABEL[run.world.coverage]}。{paused && pending.length > 0 ? '暂停中的访问已隔离，待处理风险仍需修复。' : ''}</p>
      </section>
      <section className="pp-panel">
        <div className="pp-panel-head"><h2>活动结果</h2></div>
        <dl className="pp-summary-lines">{results.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>
    </div>
    <section className="pp-panel pp-followup"><FileText size={20} aria-hidden="true" /><div><h2>历史资料还要核查</h2><p>沈一已撤回通讯录和位置权限。先前提交的数据由管理方另行核实、处理删除请求。{run.saved.includes('E8') && '可疑来电与助手的关联仍待核实。'}</p></div></section>
    <div className="pp-action-row"><Action tone="quiet" onClick={onClear}><Trash2 size={16} /> 清除本机记录</Action></div>
  </div>;
}

const REPORT_SECTIONS = [
  { id: 'result', label: '结案结果' }, { id: 'causes', label: '因果记录' }, { id: 'log', label: '完整日志' },
  { id: 'style', label: '行动风格' }, { id: 'quiz', label: '情境题' },
] as const;

function ReportDialog({ run, ending, onClose, onClear }: { run: CaseState; ending: EndingId; onClose: () => void; onClear: () => void }) {
  const [section, setSection] = useState<typeof REPORT_SECTIONS[number]['id']>('result');
  const quiz = useCaseSession((state) => state.quizzes.runs[run.id]);
  return <Modal key={section} title={`${ENDINGS[ending].name} · 本局记录`} onClose={onClose} wide
    footer={<nav className="nv-report-sections" aria-label="本局记录分页">
      {REPORT_SECTIONS.filter(({ id }) => id !== 'quiz' || quiz).map(({ id, label }) => <Action key={id} tone={section === id ? 'primary' : 'secondary'}
        aria-pressed={section === id} onClick={() => setSection(id)}>{label}</Action>)}
    </nav>}>
    {section === 'result' && <EndingReport run={run} ending={ending} onClear={onClear} />}
    {section === 'causes' && <Recap run={run} ending={ending} />}
    {section === 'log' && <EventList events={run.events} />}
    {section === 'style' && <Style run={run} />}
    {section === 'quiz' && <QuizAfter run={run} />}
  </Modal>;
}

export function Conclusion({ run, onRestart, onClear, onHome }: { run: CaseState; onRestart: () => void; onClear: () => void; onHome: () => void }) {
  const ending = determineEnding(run.world);
  const [reportOpen, setReportOpen] = useState(false);
  return <>
    <NovelScene variant="ending" background={ASSETS.endings[ending]} location="第一章 · 信任裂缝" time={run.time}
      title={ENDINGS[ending].name} byline="尾声" line={epilogue(run, ending)} actions={<>
        <SceneAction onClick={() => setReportOpen(true)}>翻看本局记录</SceneAction>
        <Action onClick={onRestart}><RefreshCw size={16} /> 重新体验</Action>
        <Action tone="quiet" onClick={onHome}>返回封面</Action>
      </>} />
    {reportOpen && <ReportDialog run={run} ending={ending} onClose={() => setReportOpen(false)} onClear={() => { setReportOpen(false); onClear(); }} />}
  </>;
}
