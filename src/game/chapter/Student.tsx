import { ArrowRight, BookOpen, Check, ClipboardCheck, MapPin, Shield, Smartphone, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { CONTACTS } from '../../../functions/shared/chapterDialogue';
import { ASSETS } from '../data/assets';
import { sfx } from '../audio/sound';
import { DECISIONS, RISKS, type OptionId } from './caseFile';
import { confirmedRisks, COVERAGE_LABEL, optionBlock, readyForDefense, type CaseState, type PlayerAvatar, type Receipt } from './caseEngine';
import { useCaseSession } from './caseStore';
import { Action, Badge, Modal, Next } from './components';
import { NovelScene, SceneAction, ScriptScene, type StoryLine } from './NovelScene';
import { DECISION_BEATS, DECISION_REPLY } from './script';

const FUTURE_WITHOUT_FOCUS = ['不同入口继续在群里流转。', '有同学以为自己报上名，却找不到本届记录。', '如果无人核对，真正需要帮忙的同学可能错过分组。'];

export function Reversal({ run }: { run: CaseState }) {
  const act = useCaseSession((state) => state.act);
  const [future, setFuture] = useState(false);
  const enter = () => { if (act({ type: 'switch' })) sfx.flip(); };
  const risk = run.focus === 'open' ? undefined : RISKS[run.focus];
  if (future) {
    const frames: StoryLine[] = (risk?.future ?? FUTURE_WITHOUT_FOCUS).map((text, index) => ({
      voice: 'narrator', text, background: index === 0 ? ASSETS.cg.reversalCorridor : ASSETS.cg.reversalAtrium,
    }));
    return <ScriptScene key="future" background={ASSETS.cg.reversalAtrium} variant="transfer" location="未来推演 · 尚未发生"
      lines={frames} title={risk?.name ?? '无人核对之后'} byline="假设这些情况持续" finishLabel="回到今天 09:10"
      onFinish={enter} skipLabel="跳过推演" />;
  }
  const handoff: StoryLine[] = [
    { voice: 'narrator', text: '我把记录递过柜台。临时测试证上的灯暗了，屏幕也退回登录页。' },
    { voice: 'narrator', text: '下一次亮起的是沈一的手机。这个账号已经使用过报名助手，而沈一只有学生能用的权限。' },
  ];
  return <ScriptScene key="handoff" background={ASSETS.cg.reversalCorridor} location="交接之后" variant="transfer" lines={handoff}
    finishLabel="看看如果没人处理" onFinish={() => setFuture(true)} actions={<Action tone="quiet" onClick={enter}>跳过推演，回到 09:10</Action>} />;
}

const AVATARS = { initial: '文字', shield: '盾牌', book: '书本' } as const;

function Avatar({ avatar }: { avatar: PlayerAvatar }) {
  return <span className="nv-avatar" aria-hidden="true">{avatar === 'shield' ? <Shield size={20} /> : avatar === 'book' ? <BookOpen size={20} /> : '沈'}</span>;
}

export function Protection({ run }: { run: CaseState }) {
  const act = useCaseSession((state) => state.act);
  const [phone, setPhone] = useState(false);
  const [hint, setHint] = useState(false);
  const { contacts, location, record } = run.protection;
  const ready = readyForDefense(run);
  return <>
    <NovelScene background={ASSETS.serviceHall} location="服务中心 · 等候区" time="09:10" line={{ voice: 'shen', text: ready
      ? '我把两项授权关了。本届名单里还是没有我。柜台那边有顾老师，我得把手上的证据交给她。'
      : '手机又亮了一下。昨天用的报名助手还留着两个授权。我先看看自己能关掉什么。' }}
      decoration={<div className="nv-phone-alert"><Smartphone size={19} /><span><strong>沈一的手机</strong><small>{ready ? '本人授权已处理' : '报名助手仍有授权'}</small></span></div>}
      actions={ready ? <><SceneAction onClick={() => { if (act({ type: 'beginDefense' })) sfx.flip(); }}>走到顾老师的柜台</SceneAction>
        <Action tone="quiet" onClick={() => setPhone(true)}>再看看手机</Action></> : <SceneAction onClick={() => setPhone(true)}>打开手机</SceneAction>} />
    {phone && <Modal title="沈一的手机" onClose={() => setPhone(false)} footer={<div className="pp-action-row pp-action-row--split"><Action tone="quiet" aria-expanded={hint} onClick={() => { setHint(!hint); act({ type: 'hint' }); }}>带我完成</Action>
      <Next onClick={() => setPhone(false)}>收起手机</Next></div>}>
      <div className="nv-phone-header"><Avatar avatar={run.avatar} /><div><strong>沈一</strong><small>澄川大学 · 学生账号</small></div>
        <details className="nv-avatar-picker"><summary>换头像</summary><div>{(Object.keys(AVATARS) as PlayerAvatar[]).map((id) => <button key={id} className="pp-icon-button" aria-label={AVATARS[id]}
          aria-pressed={run.avatar === id} onClick={() => act({ type: 'avatar', avatar: id })}><Avatar avatar={id} /></button>)}</div></details></div>
      <div className="nv-phone-settings" aria-label="本人授权和报名记录">
        {([{ id: 'contacts', name: '通讯录', icon: UsersRound }, { id: 'location', name: '精确位置', icon: MapPin }] as const).map(({ id, name, icon: Icon }) => <div key={id}>
          <Icon size={18} aria-hidden="true" /><span><strong>{name}</strong><small>{run.protection[id] ? '已撤回' : '报名助手已获访问权限'}</small></span>
          <Action disabled={run.protection[id]} onClick={() => { if (act({ type: 'protect', action: id })) sfx.select(); }}>
            {run.protection[id] ? <Check size={17} aria-label="已撤回" /> : `撤回${name}权限`}
          </Action>
        </div>)}
        <div><ClipboardCheck size={18} aria-hidden="true" /><span><strong>本届报名</strong><small>{record ? '官方名单里没有你的记录' : '上次使用了报名助手'}</small></span>
          <Action disabled={record} onClick={() => { if (act({ type: 'protect', action: 'record' })) sfx.select(); }}>{record ? '已核对' : '核对本届报名记录'}</Action></div>
      </div>
      {contacts && location && <p className="pp-inset" role="status">新增访问已停止。已经提交的资料需要请管理方另行核查和删除。</p>}
      {hint && <p className="nv-note">{!contacts ? '先撤回通讯录权限。' : !location ? '再撤回精确位置权限。' : !record ? '最后核对本届报名记录。' : '完成了。收起手机后可以继续。'}</p>}
    </Modal>}
  </>;
}

function RoundPrompt({ run }: { run: CaseState }) {
  const act = useCaseSession((state) => state.act);
  const decision = DECISIONS[run.round];
  const [prompt, setPrompt] = useState(run.mode === 'quick');
  const [selected, setSelected] = useState<OptionId | null>(null);
  const picked = decision.options.find((item) => item.id === selected);
  const beats = DECISION_BEATS[run.round];
  const scene = { background: decision.actor === 'gu' ? ASSETS.serviceHall : ASSETS.activityRoom,
    location: decision.actor === 'gu' ? '校园服务中心' : '文化节活动室', time: run.time, portrait: decision.actor, framing: 'right' as const };

  if (!prompt) return <ScriptScene {...scene} lines={beats.slice(0, -1)} finishLabel="接话" onFinish={() => setPrompt(true)} />;

  if (picked) return <NovelScene {...scene} line={{ voice: 'shen', text: DECISION_REPLY[run.round][picked.id] ?? picked.title }} actions={<>
    <SceneAction onClick={() => { if (act({ type: 'decide', round: run.round, option: picked.id })) sfx.select(); }}>确认这项决定</SceneAction>
    <Action tone="quiet" onClick={() => setSelected(null)}>改选</Action>
    <span className="nv-small-paper">{picked.detail}</span>
  </>} />;

  const confirmed = confirmedRisks(run);
  const context = run.round === 1 ? (confirmed.length ? `已核实 ${confirmed.map((id) => RISKS[id].name).join('、')}` : '手上还有疑点，可以先暂停入口')
    : run.round === 4 ? (run.world.pending.length ? `待处理 ${run.world.pending.map((id) => RISKS[id].name).join('、')}` : '三条风险都已阻断') : undefined;
  return <NovelScene {...scene} line={beats[beats.length - 1]} actions={<div className="nv-choice-list" aria-label={decision.title}>
    {context && <p>{context}</p>}
    {decision.options.map((item) => {
      const blocked = optionBlock(run, run.round, item.id);
      return <button key={item.id} className="nv-choice" type="button" onClick={() => { setSelected(item.id); sfx.select(); }} disabled={Boolean(blocked)}>
        <span><strong>{DECISION_REPLY[run.round][item.id] ?? item.title}</strong><small>{blocked ?? item.cost}</small></span><ArrowRight size={16} aria-hidden="true" />
      </button>;
    })}
  </div>} />;
}

function RoundReceipt({ run, receipt }: { run: CaseState; receipt: Receipt }) {
  const act = useCaseSession((state) => state.act);
  const [open, setOpen] = useState(false);
  const actor = receipt.actor === 'student' ? undefined : receipt.actor;
  const lines = receipt.lines.map((text): StoryLine => ({ voice: actor ?? 'shen', text: text.replace(/^「|」$/g, '') }));
  return <>
    <ScriptScene key={receipt.id} location={actor === 'linxia' || actor === 'xuyan' ? '文化节活动室' : '校园服务中心'}
      background={actor === 'linxia' || actor === 'xuyan' ? ASSETS.activityRoom : ASSETS.serviceHall} time={receipt.time}
      portrait={actor} framing="right" lines={run.mode === 'quick' ? [lines[0]] : lines}
      finishLabel={run.round === 4 ? '看看后来' : '继续下一幕'} onFinish={() => {
        if (act({ type: 'advance', round: run.round }) && run.round === 4) sfx.complete();
      }} actions={<Action tone="quiet" onClick={() => setOpen(true)}>翻看回执</Action>} />
    {open && <Modal title={receipt.title} onClose={() => setOpen(false)}>
      <p className="pp-small pp-muted">{receipt.time} · {actor ? CONTACTS[actor].name : '沈一'}</p>
      {receipt.lines.map((line) => <p key={line}>{line}</p>)}
      <div className="nv-summary-list">
        <div><span>本轮阻断</span><strong>{receipt.blocked.map((id) => RISKS[id].name).join('、') || '无'}</strong></div>
        <div><span>待处理</span><strong>{run.world.pending.map((id) => RISKS[id].name).join('、') || '无'}</strong></div>
        <div><span>报名</span><Badge tone={run.world.paused ? 'warning' : 'good'}>{run.world.paused ? '暂停' : '开放'}</Badge></div>
        <div><span>提醒</span><strong>{COVERAGE_LABEL[run.world.coverage]}</strong></div>
      </div>
    </Modal>}
  </>;
}

export function Defense({ run }: { run: CaseState }) {
  const act = useCaseSession((state) => state.act);
  const receipt = run.activeReceipt ? run.receipts.at(-1) : undefined;
  if (receipt) return <RoundReceipt key={receipt.id} run={run} receipt={receipt} />;
  if (run.formalPending) return <ScriptScene background={ASSETS.serviceHall} location="事件单已受理" time="09:40" portrait="gu" framing="right"
    lines={[{ voice: 'gu', text: '我接手复核。名单来不及赶中午了，你替我告诉许言，先留出补排的位置。' },
      { voice: 'narrator', text: '十二点，原定集合的时间过去了。又过了一会儿，顾老师带着新回执回到柜台。' }]}
    finishLabel="查看 13:00 复核回执" onFinish={() => act({ type: 'receiveFormal' })} />;
  return <RoundPrompt key={run.round} run={run} />;
}
