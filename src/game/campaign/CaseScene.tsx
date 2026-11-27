import { ArrowRight, FileCheck, Mail, Radio, Smartphone, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CONTACTS, type Person } from '../../../functions/shared/chapterDialogue';
import { Action, Badge, Modal, Next } from '../chapter/components';
import { NovelScene, SceneAction, type StoryLine } from '../chapter/NovelScene';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { CAMPAIGN_CASES } from './cases';
import { AssistanceDialog, MaterialDeck, ModalActions, PuzzleDialog, SceneChoice, SceneChoices } from './Interactions';
import { currentCase, currentStep, followingStep, hasMet, knowsZhou, pendingChecks, repairReady, savedLin, type Campaign, type Command } from './engine';
import { PAYMENT_COMPARISON, PAYMENT_FIELDS, SEARCH_AREAS } from './investigation';
import { CircuitExercise, SignalDefense } from './RedExercises';
import { STORY_SPREAD } from './review';
import { FieldCompare, Introduction, PermissionsReview, PhoneCheck, ReconcilePayment, SearchScene, VoiceRequest } from './SceneTools';
import type { CaseDefinition, CaseId, Disposition } from './types';

export type Dispatch = (command: Command) => void;

const READ_LABELS: Record<string, string> = {
  'f-open': '打开群消息',
  'f-notices': '查看两份原通知',
  'f-process': '查看权限和审批',
  'f-last': '查看旧表与来电反馈',
  'j-receipt': '查看工作与到账',
  'j-next': '查看后续要求',
  'c-shots': '打开买家的两张图',
  'c-ledger': '打开原平台订单与账单',
  'v-open': '打开语音消息',
  'v-post': '查看原有联系与公开动态',
};

const OFFICE_STEPS = new Set(['f-notices', 'f-process', 'f-sender', 'f-chen', 'f-fields', 'f-gu', 'f-sim']);

const MOMENTS: Readonly<Record<string, { label: string; text: string; emphasis: readonly string[] }>> = {
  'f-entry': { label: '发现线索', text: '学校公告与群转发指向两个不同的入口。', emphasis: ['SIM-FEST-01', 'SIM-HELP-02'] },
  'f-chen': { label: '独立核验', text: '老师本人确认，群里的推荐由其他账号发出。', emphasis: ['那条推荐也不是我发的'] },
  'f-gu': { label: '发现线索', text: '许言同意试用，审批记录里却只有学校入口。', emphasis: ['没有批准 SIM-HELP-02'] },
  'f-sim': { label: '沙盘完成', text: '截停错误入口，保留已经核验的报名路径。', emphasis: [] },
  'j-time': { label: '找到转折', text: '真工资已经收到。垫付要求出现在第二天。', emphasis: ['20 元到账', '垫付 300 元'] },
  'j-official': { label: '企业回信', text: '原招聘渠道确认，这份招募未经授权。', emphasis: ['没有获得授权'] },
  'j-sim': { label: '沙盘完成', text: '把已到账的报酬与后来要求支出的钱分开。', emphasis: [] },
  'c-ids': { label: '发现线索', text: '两张图重复使用 TRACE-14。还要查自己的入账。', emphasis: ['同一订单和同一流水'] },
  'c-money': { label: '本人账单', text: '确认收款为 ¥0，平台原订单仍是等待付款。', emphasis: ['0 元'] },
  'v-owner': { label: '原有联系已接通', text: '林夏亲自确认没有提出付款请求。', emphasis: ['没有让你给别人付款'] },
};

const RESOLVED_SCENES: Readonly<Record<CaseId, StoryLine>> = {
  festival: { voice: 'xuyan', text: '我把官方入口发回了群。周宁拎着那张旧表去补登记了，他还等着今晚试音呢。' },
  job: { voice: 'zhouning', text: '我拿着真的收款记录和后来那几条要求，给刚问我的同学讲了一遍。他点开了企业自己的招聘页。' },
  camera: { voice: 'shen', text: '平台回信了。那笔钱没到账，弹窗也不是官方客服。我把门口的相机盒搬回书桌，等下一位买家。' },
  voice: { voice: 'linxia', text: '我在原来的群里说清楚了，也请许言挨个提醒。等到彩排，还是用这个号码喊你出来拍照。' },
};

export const SHORT_TITLE: Readonly<Record<CaseId, string>> = { festival: '文化节报名', job: '远程实习', camera: '相机订单', voice: '熟人语音' };

const DISPOSITIONS: Readonly<Record<Disposition, { name: string; description: string }>> = {
  resolve: { name: '定向处置，恢复可信路径', description: '完成具体整改，确认原有入口可用或争议可以安全结束。' },
  'pause-repaired': { name: '落实整改，继续暂停', description: '完成具体整改，暂缓恢复正常事务。' },
  isolate: { name: '先做临时隔离', description: '先限制继续传播或损失，后续仍需逐项核实和处理。' },
  pending: { name: '把疑点暂存为未决', description: '留下已有材料和负责人，当前风险与事务状态照实记录。' },
};

export function speakerFor(line: StoryLine): Person | undefined {
  return line.voice in CONTACTS ? line.voice as Person : undefined;
}

function Resolution({ run, definition, onClose, onSelect }: { run: Campaign; definition: CaseDefinition; onClose: () => void; onSelect: (choice: Disposition) => void }) {
  const progress = run.cases[definition.id];
  const ready = repairReady(definition, progress);
  const missing = pendingChecks(definition, progress);
  const [choice, setChoice] = useState<Disposition>();
  const repairHelp = missing.length ? `仍待核实 ${missing.map((step) => step.button.split(' · ')[0]).join('、')}。`
    : '要完成对账处置，请先保持寄件和退款未执行。';
  const options = Object.entries(DISPOSITIONS) as [Disposition, typeof DISPOSITIONS[Disposition]][];
  return <Modal title={`${SHORT_TITLE[definition.id]} · 这一步怎么处理`} onClose={onClose} wide footer={<ModalActions>
    <Action tone="quiet" onClick={onClose}>回到现场</Action>
    <Next disabled={!choice} onClick={() => { if (choice) onSelect(choice); }}>确认处理安排</Next>
  </ModalActions>}>
    <p className="c6-source">执行与回执由{definition.handler}负责。</p>
    {!ready && <p className="c6-hint">{repairHelp} 你仍可以先申请隔离或暂存未决。</p>}
    <div className="c6-option-grid">
      {options.map(([id, option]) => <button key={id} className="c6-option" type="button"
        disabled={!ready && (id === 'resolve' || id === 'pause-repaired')} aria-pressed={choice === id} onClick={() => setChoice(id)}>
        <strong>{option.name}</strong><small>{option.description}</small>
      </button>)}
    </div>
  </Modal>;
}

export function ResultBadges({ run, id }: { run: Campaign; id: CaseId }) {
  const { world } = run.cases[id];
  return <div className="c6-badges">
    <Badge tone={world.safe ? 'good' : 'warning'}>{world.safe ? '风险已受控' : '风险待处置'}</Badge>
    <Badge tone={world.fixed ? 'good' : 'muted'}>{world.fixed ? '整改已落实' : '尚未整改'}</Badge>
    <Badge tone={world.normal ? 'good' : 'muted'}>{world.normal ? '正常事务可继续' : '正常事务待确认'}</Badge>
    <Badge tone={world.cooperation ? 'good' : 'muted'}>{world.cooperation ? '协作已接手' : '协作待确认'}</Badge>
  </div>;
}

export function CaseReceipt({ run, id }: { run: Campaign; id: CaseId }) {
  const { world, lockedOrder, help } = run.cases[id];
  const definition = CAMPAIGN_CASES[id];
  return <article className="c6-reading">
    <ResultBadges run={run} id={id} />
    {id === 'camera' && <p className="c6-order-status">相机未寄出 · 退款未执行 · 协助{help === 'open' ? '开启' : '关闭'}{lockedOrder && ' · 寄件与退款保持未执行'}</p>}
    {id === 'voice' && <p className="c6-order-status">转账未提交</p>}
    <div className="c6-record-list">
      {world.receipts.length ? world.receipts.map((item) => <article key={item.id}>
        <h3>{item.actor} <small>{item.id}</small></h3><p>{item.text}</p>
      </article>) : <article><h3>待跟进 · {definition.handler}</h3><p>{definition.result.pending}</p></article>}
    </div>
    {world.safe && !world.fixed && <p className="c6-source">隔离已经执行，具体问题仍待复核与处理。</p>}
    {id !== 'camera' && run.spread.includes(id) && <p className="c6-hint">{STORY_SPREAD[id]}</p>}
  </article>;
}

export function CaseScene({ run, dispatch }: { run: Campaign; dispatch: Dispatch }) {
  const definition = currentCase(run);
  const step = currentStep(run);
  const progress = run.cases[definition.id];
  const status = progress.completed[step.id];
  const next = followingStep(run);
  const area = SEARCH_AREAS[step.id];
  const office = OFFICE_STEPS.has(step.id);
  const location = area?.location ?? (office ? '信息中心 · 值班室' : definition.place);
  const background = area?.background ?? (office ? ASSETS.serviceHall : definition.background);
  const [overlay, setOverlay] = useState<'puzzle' | 'verify' | 'simulate' | 'help' | 'resolve' | 'receipt'>();
  const [deck, setDeck] = useState<{ ids: readonly string[]; initial: number; track?: boolean }>();
  const advance = () => dispatch({ type: 'advance' });
  const skip = () => dispatch({ type: 'skip' });
  const close = () => setOverlay(undefined);
  let line = step.line;
  let goal = step.goal;
  let actions: ReactNode;
  let advanceLabel = step.button;
  const scripted = step.kind === 'scene';
  const person = step.id === 'f-notices' ? 'xuyan' : speakerFor(step.line);
  if (person && !hasMet(run, person)) {
    return <Introduction person={person} location={location} background={background}
      onMeet={() => dispatch({ type: 'meet', person })} />;
  }
  if (area && step.kind === 'read') {
    const roomLine = step.id === 'f-notices' ? { voice: 'xuyan' as const, text: '我把相关物件摆在这里。你可以先翻审批夹，也可以看电脑里的群记录。查完跟我说。' } : step.line;
    return <SearchScene area={area} seen={progress.seen} required={step.cards} materials={definition.files}
      line={roomLine} portrait={person} onFind={(record) => dispatch({ type: 'explore', record })} onLeave={advance}
      forward={next?.kind === 'read' ? '带着线索继续' : '把线索用起来'} />;
  }
  if (!run.cases.voice.seen.includes('V3') && definition.id === 'voice' && line.voice === 'linxia') {
    const text = step.id === 'v-post' ? '先看公开动态。那张合照本来就能看到，发消息的人从哪里知道这些细节还无法确认。'
      : step.id === 'v-scope' ? '我还没联系上林夏。我可以先稳住手里的请求，也可以问问其他人有没有收到类似消息。'
      : '先用原有渠道联系林夏，并把更正任务留给能核实身份的人。';
    line = { voice: 'shen', text };
  }
  if (step.id === 'v-owner') {
    line = { ...line, text: '语音听起来像林夏。先翻一翻我以前用过的通讯录，看看从哪里打过去。', emphasis: ['以前用过的通讯录'] };
  }
  if (step.id === 'c-method') {
    line = { ...line, text: knowsZhou(run)
      ? '实习那次是周宁和我一起整理的。这回他也答应核对我给他的两张图。只有平台能确认付款和客服身份。'
      : '我可以先向周宁解释争议，把两张图给他核对。真实付款和客服身份仍要让原平台查。' };
  }
  if (step.id === 'j-money' && progress.completed['j-time'] === 'pending') {
    line = { ...line, text: '时间顺序还待核实。我们仍可以看钱的方向：哪一条是收入，哪些是后来要求周宁支出的资金？' };
  }
  if (step.kind === 'assistance' && !status && progress.lockedOrder) {
    line = { voice: 'shen', text: '相机和钱都先留在我手里。接下来只从原平台核查。' };
    goal = progress.help === 'open' ? '先结束陌生协助，再回原平台' : '带着现有凭证回原平台';
  }

  if (status) {
    switch (step.kind) {
      case 'read':
        line = { voice: definition.number <= 2 ? 'self' : 'shen', text: step.id === 'f-open'
          ? '林夏转发的是报名助手。顾老师让我查的是，它和学校公告写的是不是同一个入口。'
          : next?.line.text ?? step.line.text };
        goal = next?.goal ?? step.goal;
        advanceLabel = step.button;
        break;
      case 'observe':
        line = { voice: 'narrator', text: run.observations.find((item) => item.stepId === step.id)?.action ?? line.text };
        goal = next?.goal ?? step.goal;
        advanceLabel = next?.kind === 'resolve' ? '查看处理安排' : '接着看';
        break;
      case 'puzzle':
        line = { voice: 'system', text: status === 'done' ? step.conclusion : '这一步的判断已记为待核实。凭已有材料可以继续调查。' };
        goal = next?.goal ?? '带着结论继续';
        advanceLabel = '带着线索继续';
        break;
      case 'verify':
        line = { ...line, voice: status === 'done' && step.id === 'v-owner' ? 'linxia' : line.voice,
          text: status === 'done' ? step.confirmation : '这次独立核实还未完成。它会留在本案的待办里。' };
        goal = next?.goal ?? '带着核验状态继续';
        advanceLabel = '带着回复继续';
        break;
      case 'simulation':
        line = { voice: definition.id === 'festival' ? 'gu' : 'zhouning', text: status !== 'done' ? '手里的材料留好了，我们先回现场处理。'
          : !progress.exercise ? step.scenes[1].text
          : definition.id === 'festival' ? '闸口回放跑通了。你把两条有问题的入口单独拦住，学校的报名还能继续。带这份记录去找许言。'
            : '我终于看明白了。那 20 块钱已经在账上，后面叫我出的 300 是另一笔。我们得把这个区别告诉同学。' };
        goal = '回到本案，决定跟进范围';
        advanceLabel = '回到案件';
        break;
      case 'contact':
        line = { voice: 'linxia', text: status === 'saved' ? '好，已经存下了。临时号来找你时，先用这个原有入口问我。' : '先继续吧。以后需要找我，也可以从原来的通讯录问许言。' };
        goal = '向顾老师和许言交接本案';
        advanceLabel = '继续交接';
        break;
      case 'assistance':
        line = { voice: 'shen', text: progress.lockedOrder ? '寄件和退款已经保持未执行，陌生协助已关闭。我可以把证据交给原平台。' : '寄件和退款还没执行，陌生协助目前关闭。订单争议继续保持待核实。' };
        goal = '选择由谁协助核对';
        advanceLabel = '准备核查';
        break;
      case 'resolve': {
        const { world } = progress;
        line = world.fixed && world.normal ? RESOLVED_SCENES[definition.id]
          : { voice: 'system', text: world.fixed ? `${definition.result.repaired}正常事务仍暂停。`
          : world.safe ? definition.result.isolated : definition.result.pending };
        goal = definition.id === 'voice' ? '确认归档结果，打开四案待办' : '确认归档结果，再到下一幕';
        advanceLabel = ({ festival: '看周宁的实习消息', job: '接收交接消息', camera: '查看下一条新消息', voice: '打开四案待办' })[definition.id];
        break;
      }
    }
    actions = <>
      <SceneAction onClick={advance}>{advanceLabel}</SceneAction>
      {step.kind === 'resolve' && <Action onClick={() => setOverlay('receipt')}><FileCheck size={15} aria-hidden="true" /> 查看本案归档</Action>}
    </>;
  } else {
    switch (step.kind) {
      case 'read':
        actions = <SceneAction onClick={() => {
          dispatch({ type: 'read', record: step.cards[0] });
          setDeck({ ids: step.cards, initial: 0, track: true });
        }}>{READ_LABELS[step.id] ?? '打开材料'}</SceneAction>;
        break;
      case 'observe':
        actions = <SceneChoices>{step.choices.map((choice) => <SceneChoice key={choice.letter}
          label={choice.optionalPoint && progress.seen.includes(choice.material ?? '') ? choice.label.replace(' · 1 点', ' · 已有记录') : choice.label}
          disabled={choice.optionalPoint && !progress.seen.includes(choice.material ?? '') && progress.extraSpent >= 2}
          onClick={() => {
            sfx.select();
            dispatch({ type: 'observe', letter: choice.letter });
            if (choice.material) setDeck({ ids: [choice.material], initial: 0 });
            else advance();
          }} />)}</SceneChoices>;
        break;
      case 'puzzle': actions = <SceneAction onClick={() => setOverlay('puzzle')}>{step.button}</SceneAction>; break;
      case 'verify':
        actions = <>
          <SceneAction onClick={() => { if (step.id === 'v-owner') setOverlay('verify'); else { sfx.collect(); dispatch({ type: 'verify' }); } }}>
            {step.id === 'v-owner' ? '打开通讯录' : step.button}
          </SceneAction>
          <Action tone="quiet" onClick={skip}>留待核实</Action>
        </>;
        break;
      case 'simulation':
        actions = <><SceneAction onClick={() => { sfx.select(); setOverlay('simulate'); }}>
          {definition.id === 'festival' ? <Radio size={16} aria-hidden="true" /> : <Zap size={16} aria-hidden="true" />}{step.button}
        </SceneAction><Action tone="quiet" onClick={skip}>稍后练习</Action></>;
        break;
      case 'contact':
        actions = <><SceneAction onClick={() => dispatch({ type: 'saveContact' })}>{step.button}</SceneAction><Action tone="quiet" onClick={skip}>稍后再联系</Action></>;
        break;
      case 'assistance':
        actions = <>
          {progress.lockedOrder ? <SceneAction disabled={progress.help === 'open'} onClick={() => dispatch({ type: 'proceedOrder' })}>带凭证回原平台</SceneAction>
            : <SceneAction onClick={() => { dispatch({ type: 'lockOrder' }); dispatch({ type: 'proceedOrder' }); }}>{step.button}</SceneAction>}
          <Action onClick={() => setOverlay('help')}>{progress.help === 'open' ? '检查已开启的协助' : '查看陌生协助'}</Action>
          {!progress.lockedOrder && progress.help !== 'open' && <Action tone="quiet" onClick={() => dispatch({ type: 'proceedOrder' })}>暂存订单疑点</Action>}
        </>;
        break;
      case 'resolve': actions = <SceneAction onClick={() => setOverlay('resolve')}>{step.button}</SceneAction>; break;
      case 'scene': break;
    }
  }
  const moment = status === 'done' && (step.kind !== 'simulation' || progress.exercise) ? MOMENTS[step.id] : undefined;
  const dispositionCue = step.kind === 'resolve' && progress.world.fixed && progress.world.normal
    ? { label: '收到处置回执', text: definition.result.normal, tone: 'good' as const } : undefined;
  if (moment) line = { ...line, emphasis: moment.emphasis };
  const portrait = speakerFor(line) ?? (['f-open', 'f-first', 'f-notices', 'f-entry'].includes(step.id) ? 'linxia' : undefined);
  const notification = !status && (step.id === 'f-open' || step.id === 'v-open');
  const completePuzzle = (attempt: Extract<Command, { type: 'solve' }>['attempt']) => { dispatch({ type: 'solve', attempt }); close(); };
  const skipAndClose = () => { skip(); close(); };
  const Exercise = definition.id === 'festival' ? SignalDefense : CircuitExercise;
  return <>
    <NovelScene focus location={location} time={definition.time} background={background} line={line}
      portrait={portrait} framing="right" objective={goal} actions={actions} onAdvance={scripted ? advance : undefined}
      cue={moment ? { label: moment.label, text: moment.text, tone: 'good' } : dispositionCue}
      advanceLabel={advanceLabel} decoration={notification && <button type="button" className="nv-phone-alert c6-notification"
        onClick={() => {
          if (step.kind !== 'read') return;
          dispatch({ type: 'read', record: step.cards[0] });
          setDeck({ ids: step.cards, initial: 0, track: true });
        }} aria-label={step.id === 'f-open' ? '查看志愿者群的新消息' : '查看新账号语音'}>
        {step.id === 'f-open' ? <Mail size={20} aria-hidden="true" /> : <Smartphone size={20} aria-hidden="true" />}
        <span><strong>{step.id === 'f-open' ? '志愿者群 · 林夏' : '陌生账号 · 1 段语音'}</strong><small>{step.id === 'f-open' ? '收到一条转发' : '头像显示林夏'}</small></span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>} />
    {deck && <MaterialDeck ids={deck.ids} materials={definition.files} initial={deck.initial}
      onRead={deck.track ? (record) => dispatch({ type: 'read', record }) : undefined} onClose={() => setDeck(undefined)}
      finishLabel={status === 'done' ? deck.track ? step.button : '带着这份材料继续' : undefined}
      onFinish={status === 'done' ? () => { setDeck(undefined); advance(); } : undefined} />}
    {overlay === 'puzzle' && step.kind === 'puzzle' && (step.id === 'c-ids'
      ? <FieldCompare title="找出重复使用的凭证" cards={PAYMENT_COMPARISON} wanted={PAYMENT_FIELDS}
        instruction="点两份截图上能识别付款记录的字段。"
        lesson="流水号一模一样。先去原平台查这笔钱是否到账。"
        suggest="订单号和金额可能相同。用流水号核对所声称的两笔付款。"
        onClose={close} onSkip={skipAndClose} onFinish={(fields) => { dispatch({ type: 'paymentPair', fields }); close(); }} />
      : step.id === 'f-fields' && step.puzzle.kind === 'group' ? <PermissionsReview fields={step.puzzle.tokens}
        needs={Object.keys(step.puzzle.answer).filter((id) => step.puzzle.kind === 'group' && step.puzzle.answer[id] === 'needed')}
        onClose={close} onSkip={skipAndClose} onFinish={() => completePuzzle(step.puzzle.answer)} />
      : step.id === 'c-money' ? <ReconcilePayment onClose={close} onSkip={skipAndClose} onFinish={() => completePuzzle(step.puzzle.answer)} />
      : step.id === 'v-request' ? <VoiceRequest onClose={close} onSkip={skipAndClose} onFinish={() => completePuzzle(step.puzzle.answer)} />
      : <PuzzleDialog run={run} definition={definition} step={step} onClose={close} onSolve={completePuzzle} onSkip={skipAndClose} />)}
    {overlay === 'verify' && step.id === 'v-owner' && <PhoneCheck saved={savedLin(run)} onClose={close} onSkip={skipAndClose}
      onCall={() => { dispatch({ type: 'call', via: savedLin(run) ? 'saved' : 'trusted-friend' }); close(); }} />}
    {overlay === 'simulate' && step.kind === 'simulation' && <Exercise onClose={close} onSkip={skipAndClose}
      onFinish={(attempt) => { dispatch({ type: 'simulate', attempt }); close(); }} />}
    {overlay === 'help' && <AssistanceDialog open={progress.help === 'open'} onCheck={(open) => dispatch({ type: 'help', open })} onClose={close} />}
    {overlay === 'resolve' && <Resolution run={run} definition={definition} onClose={close}
      onSelect={(disposition) => { dispatch({ type: 'dispose', disposition }); close(); }} />}
    {overlay === 'receipt' && <Modal title={`${SHORT_TITLE[definition.id]} · 归档`} onClose={close} wide
      footer={<ModalActions><Next onClick={close}>回到现场</Next></ModalActions>}><CaseReceipt run={run} id={definition.id} /></Modal>}
  </>;
}
