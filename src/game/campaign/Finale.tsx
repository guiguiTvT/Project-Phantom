import { ArrowRight, ClipboardCheck, ClipboardList, FileCheck, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReviewId } from '../../../functions/shared/campaignReview';
import { askCampaignReview } from '../chapter/caseApi';
import { Action, Badge, Modal, Next } from '../chapter/components';
import { NovelScene, SceneAction } from '../chapter/NovelScene';
import { ASSETS } from '../data/assets';
import { CAMPAIGN_CASES } from './cases';
import { CaseReceipt, ResultBadges, SHORT_TITLE, type Dispatch } from './CaseScene';
import { ModalActions } from './Interactions';
import { caseSummary, endingFor, FOLLOW_ACTIONS, followExplanation, followOptions, hasMet, knowsZhou, results, styleFor, type Campaign } from './engine';
import { reviewRecords, STORY_SPREAD } from './review';
import { Introduction } from './SceneTools';
import { CASE_IDS, type CaseId, type FollowAction } from './types';

export function RoleSwitch({ run, dispatch }: { run: Campaign; dispatch: Dispatch }) {
  const [atDorm, setAtDorm] = useState(false);
  const [receipts, setReceipts] = useState(false);
  if (!hasMet(run, 'gu')) return <Introduction person="gu" location="校园信息中心 · 授权交接" background={ASSETS.cg.reversalAtrium}
    onMeet={() => dispatch({ type: 'meet', person: 'gu' })} />;
  const spread = run.spread.includes('festival') ? STORY_SPREAD.festival : run.spread.includes('job') ? STORY_SPREAD.job : undefined;
  const info = <button type="button" className="nv-phone-alert c6-notification" onClick={() => dispatch({ type: 'advance' })}>
    <Smartphone size={20} aria-hidden="true" /><span><strong>二手平台 · 新订单消息</strong><small>沈一的闲置相机</small></span><ArrowRight size={16} aria-hidden="true" />
  </button>;
  return <>
    {!atDorm ? <NovelScene focus background={ASSETS.cg.reversalAtrium} location="信息中心 · 暂时告别"
      title="交回通行证" variant="transfer" byline="两案已交接" portrait="gu" framing="right"
      line={{ voice: 'gu', text: '沈一，后续处理交给我们。沙盘和后台权限到这里就结束了。去歇一会儿吧，手机上那笔相机订单是不是还等着你？' }}
      cue={spread ? { label: '交接时发生', text: spread, tone: 'alert' } : { label: '交接完成', text: '两案的疑点和处置都已交给各自负责人。', tone: 'good' }}
      actions={<><SceneAction onClick={() => setAtDorm(true)}>回宿舍看看手机</SceneAction>
        <Action onClick={() => setReceipts(true)}><FileCheck size={15} aria-hidden="true" /> 查看前两案回执</Action></>} />
    : <NovelScene focus background={ASSETS.dormNight} location="宿舍 · 沈一的书桌" time="稍晚"
      line={{ voice: 'shen', text: knowsZhou(run)
        ? '通行证还回去了。周宁说有事可以叫他一起查。刚说完，买家的消息就来了。'
        : '通行证还回去了。现在用的是我自己的手机。买家说有笔急事要我处理。' }}
      objective="查看相机订单的新消息" decoration={info}
      actions={<SceneAction onClick={() => dispatch({ type: 'advance' })}>查看相机订单</SceneAction>} />}
    {receipts && <Modal title="前两案 · 实际交接归档" wide onClose={() => setReceipts(false)}
      footer={<ModalActions><Next onClick={() => setReceipts(false)}>回到剧情</Next></ModalActions>}>
      {(['festival', 'job'] as const).map((id) => <section className="c6-report-case" key={id}><h3>{SHORT_TITLE[id]}</h3><CaseReceipt run={run} id={id} /></section>)}
    </Modal>}
  </>;
}

function FollowDialog({ run, dispatch, onClose }: { run: Campaign; dispatch: Dispatch; onClose: () => void }) {
  const [caseId, setCase] = useState<CaseId>();
  const [action, setAction] = useState<FollowAction>();
  const used = run.followups.length;
  return <Modal title={caseId ? `跟进 · ${SHORT_TITLE[caseId]}` : '四案待办'} onClose={onClose} wide
    footer={<ModalActions>
      {caseId && <Action tone="quiet" onClick={() => { setCase(undefined); setAction(undefined); }}>回到四案待办</Action>}
      {caseId && action ? <Next onClick={() => { dispatch({ type: 'follow', caseId, action }); onClose(); }}>确认{FOLLOW_ACTIONS[action].verb}</Next>
        : <Action onClick={onClose}>回到剧情</Action>}
    </ModalActions>}>
    {caseId ? <div className="c6-reading">
      <p className="c6-source">{CAMPAIGN_CASES[caseId].handler}负责本案 · 剩余 {2 - used} 次跟进</p>
      <ResultBadges run={run} id={caseId} />
      <div className="c6-option-grid">{followOptions(run, caseId).map((option) => <button className="c6-option" type="button"
        key={option} aria-pressed={option === action} onClick={() => setAction(option)}>
        <strong>{FOLLOW_ACTIONS[option].label}</strong>
        {option === action && <small>{followExplanation(run, caseId, option)}</small>}
      </button>)}</div>
    </div> : <>
      <p className="c6-source">{used < 2 ? `还可以跟进 ${2 - used} 次。一次处理一件具体的事。` : '两次跟进已用完，可以查看各案当前状态。'}</p>
      <div className="c6-option-grid">{CASE_IDS.map((id) => <button className="c6-option" type="button" key={id}
        disabled={used >= 2 || followOptions(run, id).length === 0} onClick={() => { setCase(id); setAction(undefined); }}>
        <strong>{SHORT_TITLE[id]}</strong><small>{caseSummary(run, id)}</small>
      </button>)}</div>
      {run.spread.includes('voice') && <p className="c6-hint">{STORY_SPREAD.voice}</p>}
    </>}
  </Modal>;
}

export function Followup({ run, dispatch }: { run: Campaign; dispatch: Dispatch }) {
  const [dialog, setDialog] = useState<'follow' | 'end'>();
  const last = run.followups.at(-1);
  const left = 2 - run.followups.length;
  const text = last ? `${SHORT_TITLE[last.caseId]}：${last.text}`
    : `四件事都调查过了。${run.spread.includes('voice') ? STORY_SPREAD.voice : '周宁也拿到了林夏的更正。'} 现在可以对留下的待办再跟进两次。`;
  return <>
    <NovelScene focus background={ASSETS.serviceHall} location="澄川大学 · 最后的交接" time={`剩余跟进 ${left} 次`}
      line={{ voice: last ? 'system' : 'gu', text }} portrait={last ? undefined : 'gu'} framing="right"
      objective={left ? '打开待办，选择要跟进的一件事' : '确认四案状态，查看结局'}
      actions={<><SceneAction onClick={() => left ? setDialog('follow') : dispatch({ type: 'end' })}>{left ? '打开四案待办' : '查看故事结局'}</SceneAction>
        {left > 0 && <Action tone="quiet" onClick={() => setDialog('end')}>保留当前状态</Action>}
        {left === 0 && <Action onClick={() => setDialog('follow')}><ClipboardList size={15} aria-hidden="true" /> 查看待办</Action>}</>} />
    {dialog === 'follow' && <FollowDialog key={last?.caseId ?? 'first'} run={run} dispatch={dispatch} onClose={() => setDialog(undefined)} />}
    {dialog === 'end' && <Modal title="以当前处置结果结束" onClose={() => setDialog(undefined)}
      footer={<ModalActions><Action onClick={() => setDialog('follow')}>继续跟进</Action><Next onClick={() => dispatch({ type: 'end' })}>进入尾声</Next></ModalActions>}>
      <p>还有 {left} 次可用的跟进。结束后，未完成的事项将以当前状态留在复盘里。</p>
    </Modal>}
  </>;
}

const ENDINGS = {
  ending_dawn: { name: '破晓', text: '校园里的正常事务又开始了。已经修好的问题留有执行回执，没人再靠一张截图猜事情有没有处理。' },
  ending_consensus: { name: '共识', text: '林夏、周宁、许言和老师各自接下能做的那一步。几件棘手的事有了可核实的解释，也还有人负责下一步。' },
  ending_rebuild: { name: '新秩序', text: '新的核验办法已经生效。以后碰到相似请求，负责人有明确的步骤去确认来源、执行和留下回执。' },
  ending_isolation: { name: '孤岛', text: '可疑路径已经被压住，许多正常事务也停了下来。群里安静了，报名、投递、交易或约见还在等恢复。' },
  ending_domino: { name: '多米诺', text: '查过的疑点写在了记录里。有些入口还在流传，已经出现新的收件人或新提交的材料。' },
  ending_unresolved: { name: '未完待续', text: '有的事收到了回执，有的还在等待下一次核实。沈一把材料和接手人整理好，留给之后的跟进。' },
} as const;

function KeyMoments({ run, onClose }: { run: Campaign; onClose: () => void }) {
  const records = useMemo(() => reviewRecords(run), [run]);
  const [selection, setSelection] = useState<ReviewId[]>();
  useEffect(() => {
    const controller = new AbortController();
    void askCampaignReview({ scope: 'campaign', ending: endingFor(run), causes: records.map((item) => item.id) }, controller.signal).then((order) => {
      if (order && !controller.signal.aborted) setSelection(order);
    });
    return () => controller.abort();
  }, [run, records]);
  const visible = selection ? selection.flatMap((id) => records.filter((item) => item.id === id)) : records.slice(0, 3);
  return <Modal title="本局关键节点" onClose={onClose} footer={<ModalActions><Next onClick={onClose}>回到四案复盘</Next></ModalActions>}>
    <p className="c6-source">根据本局执行回执和实际影响整理</p>
    <div className="c6-record-list">{visible.map((item) => <article key={item.id}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
  </Modal>;
}

export function Finale({ run, dispatch, onHome }: { run: Campaign; dispatch: Dispatch; onHome: () => void }) {
  const [panel, setPanel] = useState<'report' | 'style' | 'moments' | 'replay'>();
  const [id, setId] = useState<CaseId>();
  const endingId = endingFor(run);
  const ending = ENDINGS[endingId];
  const epilogue = endingId === 'ending_dawn' && run.cases.festival.world.normal && run.cases.voice.world.normal
    ? '灯光亮起来的时候，周宁抱着音箱从后台跑过去。林夏用原来的号码喊你到舞台旁边。你把相机从包里拿了出来。' : ending.text;
  const { profile, dimensions } = styleFor(run);
  const { safety, fix, order, relations } = results(run);
  return <>
    <NovelScene focus background={ASSETS.endings[endingId]} location="澄川大学 · 尾声" variant="ending"
      title={ending.name} byline="本局结局" line={{ voice: 'narrator', text: epilogue }}
      actions={<>
        <SceneAction onClick={() => setPanel('report')}><ClipboardCheck size={15} aria-hidden="true" /> 查看四案复盘</SceneAction>
        <Action onClick={() => setPanel('style')}>行动风格</Action>
        <Action tone="quiet" onClick={onHome}>返回标题</Action>
      </>} />
    {panel === 'report' && <Modal key={id ?? 'report'} title={id ? `${SHORT_TITLE[id]} · 回执` : `${ending.name} · 四案复盘`} wide onClose={() => { setPanel(undefined); setId(undefined); }}
      footer={<ModalActions>{id ? <>
        <Action onClick={() => setPanel('replay')}>重走本案</Action><Next onClick={() => setId(undefined)}>回到四案复盘</Next>
      </> : <><Action onClick={() => setPanel('moments')}>查看关键节点</Action><Next onClick={() => setPanel(undefined)}>回到尾声</Next></>}</ModalActions>}>
      {id ? <><CaseReceipt run={run} id={id} /><p className="c6-source">{CAMPAIGN_CASES[id].result.lesson}</p></> : <>
        <div className="c6-badges"><Badge>安全 {safety}</Badge><Badge>修复 {fix}</Badge><Badge>秩序 {order}</Badge><Badge>协作 {relations}</Badge></div>
        {run.rule && <p className="c6-hint">{run.rule.receipt.text}</p>}
        <div className="c6-option-grid">{CASE_IDS.map((key) => <button type="button" className="c6-option" key={key} onClick={() => setId(key)}>
          <strong>{SHORT_TITLE[key]}</strong><small>{caseSummary(run, key)}</small>
        </button>)}</div>
        <p className="c6-source">熟人语音使用预先制作的合成演练音频。通过已知联系独立核实，能判断请求是否来自本人。</p>
      </>}
    </Modal>}
    {panel === 'moments' && <KeyMoments run={run} onClose={() => setPanel('report')} />}
    {panel === 'replay' && id && <Modal title={`重走${SHORT_TITLE[id]}`} onClose={() => setPanel('report')}
      footer={<ModalActions><Action onClick={() => setPanel('report')}>返回回执</Action>
        <Next onClick={() => dispatch({ type: 'replay', caseId: id })}>从本案开头继续</Next></ModalActions>}>
      <p>本案和之后的案件会重新开始。更早的案件保留当前结果和人物协作。</p>
    </Modal>}
    {panel === 'style' && <Modal title="Phantom Type · 本局行动风格" wide onClose={() => setPanel(undefined)}
      footer={<ModalActions><Next onClick={() => setPanel(undefined)}>回到尾声</Next></ModalActions>}>
      {profile && <div className="pp-style-portrait">
        <img src={ASSETS.personality[profile.code]} alt="" /><div><h3>{profile.nameCn} · {profile.code}</h3><p>{profile.style}</p></div>
      </div>}
      <p className="c6-source">取自本局 {run.observations.length} 次实际选择，用于回顾游戏里的做法。</p>
      <div className="c6-style-grid">{dimensions.map((dimension) => <article key={dimension.axis}>
        <h3>{dimension.name}</h3><p>{dimension.label}</p>
        <ul>{dimension.actions.map((item) => <li key={item.stepId}><strong>{SHORT_TITLE[item.caseId]}</strong> {item.action}</li>)}</ul>
      </article>)}</div>
    </Modal>}
  </>;
}
