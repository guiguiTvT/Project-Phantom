import { ArrowRight, Camera, Check, ChevronRight, FileText, FolderOpen, Monitor, Package, PhoneCall, Search, ShieldCheck, Smartphone, ToggleLeft, ToggleRight, Wallet, X } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CONTACTS, type Person } from '../../../functions/shared/chapterDialogue';
import { sfx } from '../audio/sound';
import { Action, Badge, Modal, Next } from '../chapter/components';
import { NovelScene, SceneAction, type StoryLine } from '../chapter/NovelScene';
import { ModalActions, Reading } from './Interactions';
import { foundPair, type FocusCard, type FocusField, type SearchArea } from './investigation';
import type { CaseDefinition, Token } from './types';

const PEOPLE_INTRO = {
  linxia: { role: '你的志愿者搭档', text: '你们一起负责文化节报名。林夏熟悉社团的消息群，今天抱着手机来得有点急。', prompt: '听林夏说' },
  gu: { role: '信息中心值班老师', text: '顾老师维护校园活动平台，也负责演练授权。你们刚找到的报名入口差异，需要他查一眼。', prompt: '把两份通知给他看' },
  zhouning: { role: '布展队的音响志愿者', text: '周宁是沈一的同学，负责把器材分给各个组。他手里有一些刚发现的记录。', prompt: '听周宁说' },
  xuyan: { role: '文化节的社团负责人', text: '许言要在彩排前交志愿者名单。流程有哪里改过，先问他。', prompt: '问问许言' },
  chen: { role: '文化节指导老师', text: '陈老师负责发布活动正式通知。学校通讯录存着一直在用的工作联系方式。', prompt: '看陈老师的核验' },
} satisfies Record<Person, { role: string; text: string; prompt: string }>;

export function Introduction({ person, location, background, onMeet }: { person: Person; location: string; background: string; onMeet: () => void }) {
  const { role, text, prompt } = PEOPLE_INTRO[person];
  return <NovelScene focus background={background} location={location} title={CONTACTS[person].name} byline={role}
    variant="intro" framing="right" portrait={person} line={{ voice: 'narrator', text }}
    actions={<SceneAction onClick={() => { sfx.flip(); onMeet(); }}>{prompt}</SceneAction>} />;
}

export function personProfile(person: Person) { return PEOPLE_INTRO[person]; }

export function PlayPanel({ title, label, children, onClose, icon, tone = 'paper' }: {
  title: string; label: string; children: ReactNode; onClose: () => void; icon: ReactNode; tone?: 'paper' | 'dark' | 'phone';
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    heading.current?.focus({ preventScroll: true });
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={dialogRef} className={`c7-play c7-play--${tone}`} aria-label={title}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className="c7-play-head">
      <div className="c7-play-icon">{icon}</div>
      <div><p>{label}</p><h2 tabIndex={-1} ref={heading}>{title}</h2></div>
      <button type="button" className="pp-icon-button" aria-label="关闭" onClick={onClose}><X size={19} aria-hidden="true" /></button>
    </header>
    {children}
  </dialog>;
}

const PROP_ICONS = { phone: Smartphone, notice: FileText, folder: FolderOpen, screen: Monitor, wallet: Wallet, photo: Camera, box: Package };

export function SearchScene({ area, seen, required, materials, line, portrait, onFind, onLeave, forward, alternate }: {
  area: SearchArea; seen: readonly string[]; required: readonly string[]; materials: CaseDefinition['files']; line: StoryLine;
  portrait?: Person; onFind: (id: string) => void; onLeave: () => void; forward: string; alternate?: string;
}) {
  const [open, setOpen] = useState<string>();
  const [hint, setHint] = useState(false);
  const count = required.filter((id) => seen.includes(id)).length;
  const ready = count === required.length;
  const material = open ? materials[open] : undefined;
  const targets = area.props.filter((prop) => Boolean(materials[prop.id]));
  return <>
    <NovelScene focus background={area.background} location={area.location} variant="room" line={line} framing="right" portrait={portrait}
      objective={ready ? '线索已找到，还可以继续翻看' : alternate ?? '在场景里找线索'}
      decoration={<div className={`c7-room-props${hint ? ' c7-room-props--hint' : ''}`} role="group" aria-label="可以调查的物件">
        {targets.map((prop) => {
          const Icon = PROP_ICONS[prop.icon];
          const collected = seen.includes(prop.id);
          return <button key={prop.id} className={`c7-prop${collected ? ' c7-prop--found' : ''}`} type="button" aria-label={`调查${prop.label}`}
            style={{ '--prop-x': `${prop.position[0]}%`, '--prop-y': `${prop.position[1]}%` } as CSSProperties}
            onClick={() => { if (!collected) sfx.collect(); else sfx.flip(); onFind(prop.id); setOpen(prop.id); }}>
            <span>{collected ? <Check size={19} aria-hidden="true" /> : <Icon size={19} aria-hidden="true" />}</span>
            <strong>{prop.label}</strong>
          </button>;
        })}
      </div>}
      actions={<>
        {ready ? <SceneAction onClick={onLeave}>{forward}</SceneAction>
          : <div className="c7-find-count" aria-live="polite"><Search size={16} aria-hidden="true" />线索 {count} / {required.length}</div>}
        <Action tone="quiet" aria-pressed={hint} onClick={() => setHint(!hint)}>{hint ? '收起物件提示' : '提示可调查物件'}</Action>
      </>} />
    {material && <Modal title={material.title} wide onClose={() => setOpen(undefined)}
      footer={<ModalActions><Badge tone="good"><Check size={14} aria-hidden="true" /> 已收入笔记</Badge><Next onClick={() => setOpen(undefined)}>继续搜查</Next></ModalActions>}>
      <Reading material={material} />
    </Modal>}
  </>;
}

export function FieldCompare({ title, cards, wanted, instruction, lesson, suggest, onFinish, onClose, lead = false, onSkip }: {
  title: string; cards: readonly [FocusCard, FocusCard]; wanted: readonly string[]; instruction: string; lesson: string; suggest: string;
  onFinish: (fields: readonly string[], lead: 'notice' | 'forward') => void; onClose: () => void; lead?: boolean; onSkip?: () => void;
}) {
  const [picked, setPicked] = useState<readonly (FocusField | undefined)[]>([undefined, undefined]);
  const selections = picked.flatMap((field) => field ? [field.id] : []);
  const solved = foundPair(selections, wanted);
  function point(card: number, field: FocusField) {
    const next = picked.map((old, index) => index === card ? field : old);
    const chosen = next.flatMap((item) => item ? [item.id] : []);
    if (foundPair(chosen, wanted)) sfx.collect(); else sfx.select();
    setPicked(next);
  }
  return <PlayPanel title={title} label="对照眼前的两份记录" onClose={onClose} icon={<Search size={22} aria-hidden="true" />}>
    <p className="c7-play-instruction">{instruction}</p>
    <div className="c7-compare">
      {cards.map((card, index) => <article key={card.title}>
        <header><h3>{card.title}</h3><p>{card.source}</p></header>
        {card.fields.map((field) => <button type="button" key={field.id} aria-label={`${card.title}${field.title} ${field.value}`}
          className="c7-field" aria-pressed={picked[index]?.id === field.id} onClick={() => point(index, field)}>
          <span>{field.title}</span><strong>{field.value}</strong>
        </button>)}
      </article>)}
    </div>
    <div className={`c7-play-feedback${solved ? ' c7-play-feedback--good' : ''}`} role="status">
      {solved ? <><Check size={17} aria-hidden="true" />{lesson}</> : selections.length === 2 ? suggest : selections.length === 1 ? '再点另一份记录上的对应字段。' : '每份记录可以圈出一个字段。'}
    </div>
    <div className="c7-play-actions">
      {onSkip && <Action tone="quiet" onClick={onSkip}>留待核实</Action>}
      {lead && solved && <Action onClick={() => onFinish(selections, 'forward')}>记下疑点，再去求证</Action>}
      <Next disabled={!solved} onClick={() => onFinish(selections, 'notice')}>{lead ? '带两份通知去找顾老师' : '记下重复流水'}</Next>
    </div>
  </PlayPanel>;
}

export function PhoneCheck({ saved, onCall, onClose, onSkip }: {
  saved: boolean; onCall: () => void; onClose: () => void; onSkip: () => void;
}) {
  const [message, setMessage] = useState('从你原来使用的联系人找林夏。');
  return <PlayPanel title="拨哪个号码？" label="沈一的手机" tone="phone" onClose={onClose} icon={<PhoneCall size={21} aria-hidden="true" />}>
    <p className="c7-play-instruction">你要确认请求是不是林夏本人发的。选一条可以独立核实的联系路径。</p>
    <div className="c7-phone-list">
      <button type="button" onClick={() => { setMessage('这个号码来自可疑会话。对方即使接起，也还是同一个来源。试试以前存下的联系。'); sfx.wrong(); }}>
        <Smartphone size={20} aria-hidden="true" /><span><strong>发来语音的新号</strong><small>来自刚收到的消息</small></span><ChevronRight size={17} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => { sfx.collect(); onCall(); }}>
        <PhoneCall size={20} aria-hidden="true" /><span><strong>{saved ? '林夏 · 原有联系' : '许言 · 原有通讯录'}</strong>
          <small>{saved ? '文化节那天，由林夏亲自确认' : '请已认识的许言当面联系林夏'}</small></span><ArrowRight size={17} aria-hidden="true" />
      </button>
    </div>
    <div className="c7-play-feedback" role="status">{message}</div>
    <div className="c7-play-actions"><Action tone="quiet" onClick={onSkip}>稍后再核实</Action></div>
  </PlayPanel>;
}

export function ReconcilePayment({ onFinish, onClose, onSkip }: {
  onFinish: () => void; onClose: () => void; onSkip: () => void;
}) {
  const [choice, setChoice] = useState<'ledger' | 'claim'>();
  return <PlayPanel title="这笔订单能退多少？" label="沈一的订单与账单" onClose={onClose} icon={<Wallet size={22} aria-hidden="true" />}>
    <div className="c7-compare c7-ledger">
      <article><header><h3>从原平台打开</h3><p>订单 CAM-S17 · 等待买家付款</p></header><strong>¥0</strong><p>本人账单的实际入账</p></article>
      <article><header><h3>来自买家截图</h3><p>消息内的说法 · 平台待确认</p></header><strong>¥800</strong><p>对方说需要退的金额</p></article>
    </div>
    <div className="c7-play-feedback" role="status">{choice === 'claim'
      ? '买家截图是对方提供的说明。先看你从原平台找到的订单和本人账单。'
      : '亲自打开的账单，才能说明有多少款已经到账。'}</div>
    <div className="c7-play-actions">
      <Next onClick={() => { sfx.collect(); onFinish(); }}>到账 ¥0，先不退款</Next>
      <Action onClick={() => { setChoice('claim'); sfx.wrong(); }}>用截图确认 ¥800</Action>
      <Action tone="quiet" onClick={onSkip}>留待核实</Action>
    </div>
  </PlayPanel>;
}

const REQUEST_MARKS = [
  { id: 'voice-name', fact: '头像是林夏，发来消息的是新号', label: '身份主张' },
  { id: 'voice-action', fact: '附言请我尽快转钱', label: '实际请求' },
  { id: 'voice-payee', fact: '收款人是另一位我不认识的人', label: '收款对象' },
];

export function VoiceRequest({ onFinish, onClose, onSkip }: { onFinish: () => void; onClose: () => void; onSkip: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const ready = picked.length === REQUEST_MARKS.length;
  return <PlayPanel title="这条语音在要求什么？" label="沈一的手机 · 新会话" tone="phone" onClose={onClose} icon={<ShieldCheck size={22} aria-hidden="true" />}>
    <p className="c7-play-instruction">把对方的身份、请求和收款人各找出来。</p>
    <div className="c7-phone-list">
      {REQUEST_MARKS.map(({ id, fact, label }) => {
        const seen = picked.includes(id);
        return <button key={id} type="button" aria-pressed={seen} onClick={() => {
          if (!seen) { sfx.select(); setPicked([...picked, id]); }
        }}>
          {seen ? <Check size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          <span><strong>{fact}</strong>{seen && <small>{label}</small>}</span>
        </button>;
      })}
    </div>
    <div className="c7-play-feedback" role="status">{ready ? '原请求已分清。现在从熟悉的渠道确认本人。' : `已经标出 ${picked.length} / 3 项。`}</div>
    <div className="c7-play-actions"><Next disabled={!ready} onClick={() => { sfx.collect(); onFinish(); }}>带着线索去核实</Next>
      <Action tone="quiet" onClick={onSkip}>留待核实</Action></div>
  </PlayPanel>;
}

export function PermissionsReview({ fields, needs, onFinish, onClose, onSkip }: {
  fields: readonly Token[]; needs: readonly string[]; onFinish: () => void; onClose: () => void; onSkip: () => void;
}) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);
  const kept = fields.filter(({ id }) => !removed.includes(id));
  const valid = kept.length === needs.length && kept.every(({ id }) => needs.includes(id));
  return <PlayPanel title="收回多余的权限" label="报名助手 · 测试副本" onClose={onClose} icon={<ShieldCheck size={24} aria-hidden="true" />}>
    <p className="c7-play-instruction">对照已找到的公告。保留报名需要的 <strong>姓名、学号和场次</strong>，其余项目点一下关闭。</p>
    <div className="c7-switches">{fields.map(({ id, label }) => {
      const enabled = !removed.includes(id);
      return <button type="button" role="switch" aria-checked={enabled} aria-label={label} key={id} onClick={() => {
        setRemoved(enabled ? [...removed, id] : removed.filter((field) => field !== id));
        setAttempted(false);
        sfx.select();
      }}>{enabled ? <ToggleRight size={23} aria-hidden="true" /> : <ToggleLeft size={23} aria-hidden="true" />}<span>{label}</span></button>;
    })}</div>
    <div className="c7-play-feedback" role="status">{attempted ? '再和公告对一次。只有姓名、学号和场次是本届明确要求的信息。'
      : `还开着 ${kept.length} 项。这些改动只会写进沙盘核验记录。`}</div>
    <div className="c7-play-actions"><Next onClick={() => { if (valid) { sfx.collect(); onFinish(); } else { sfx.wrong(); setAttempted(true); } }}>核对并记录权限</Next>
      <Action tone="quiet" onClick={onSkip}>留待核实</Action></div>
  </PlayPanel>;
}
