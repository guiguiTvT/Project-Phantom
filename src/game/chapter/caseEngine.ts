import {
  CONTACT_IDS, DECISIONS, DIRECT_SOURCES, EVIDENCE, EVIDENCE_IDS, RISKS, RISK_IDS, VERIFICATIONS,
  type ContactId, type EndingId, type EvidenceId, type Mode, type OptionId, type Phase, type RiskId, type Round,
} from './caseFile';

export const SAVE_VERSION = 4;
export const STARTING_POINTS = 6;
export const VERIFY_COST = 1;
export const SIMULATION_COST = 2;

export type SimulationStatus = 'confirmed' | 'insufficient' | 'incorrect';
export type ProtectionAction = 'contacts' | 'location' | 'record';
export type Coverage = 'none' | 'groups' | 'records' | 'all';
export type Focus = RiskId | 'open';
export type PlayerAvatar = 'initial' | 'shield' | 'book';
type EventKind = 'enter' | 'save' | 'verify' | 'simulate' | 'recheck' | 'handoff' | 'switch' | 'protect'
  | 'hint' | 'beginDefense' | 'accepted' | 'receipt' | 'ending';

export interface SimulationReview {
  status: SimulationStatus;
  evidence: EvidenceId[];
  missing: string[];
  misused: EvidenceId[];
}

export interface CampusState {
  pending: RiskId[];
  paused: boolean;
  coverage: Coverage;
  cooperation: boolean;
  policy: boolean;
  rosterAt: string | null;
}

export interface Receipt {
  id: string;
  round: Round;
  option: OptionId;
  time: string;
  actor: ContactId | 'student';
  title: string;
  lines: string[];
  blocked: RiskId[];
}

interface EventSnapshot {
  phase: Phase;
  time: string;
  points: number;
  pending: RiskId[];
  paused: boolean;
  coverage: Coverage;
  cooperation: boolean;
  policy: boolean;
  rosterAt: string | null;
  protection: Record<ProtectionAction, boolean>;
}

export interface CaseEvent {
  id: string;
  kind: EventKind;
  title: string;
  detail: string;
  evidence: EvidenceId[];
  spent: number;
  before: EventSnapshot;
  after: EventSnapshot;
  preset?: boolean;
  receipt?: string;
  contact?: ContactId;
  risk?: RiskId;
  status?: SimulationStatus;
}

export interface CaseState {
  version: typeof SAVE_VERSION;
  id: string;
  mode: Mode;
  phase: Phase;
  time: string;
  points: number;
  saved: EvidenceId[];
  verified: ContactId[];
  slots: Record<RiskId, Array<EvidenceId | null>>;
  simulations: Partial<Record<RiskId, SimulationReview>>;
  focus: Focus;
  protection: Record<ProtectionAction, boolean>;
  usedHint: boolean;
  avatar: PlayerAvatar;
  world: CampusState;
  round: Round;
  activeReceipt: boolean;
  formalPending: boolean;
  receipts: Receipt[];
  events: CaseEvent[];
}

export type CaseCommand =
  | { type: 'enter' }
  | { type: 'save'; evidence: EvidenceId }
  | { type: 'verify'; contact: ContactId }
  | { type: 'slot'; risk: RiskId; index: number; evidence: EvidenceId | null }
  | { type: 'simulate'; risk: RiskId }
  | { type: 'recheck'; risk: RiskId }
  | { type: 'handoff'; focus: Focus }
  | { type: 'switch' }
  | { type: 'protect'; action: ProtectionAction }
  | { type: 'hint' }
  | { type: 'avatar'; avatar: PlayerAvatar }
  | { type: 'beginDefense' }
  | { type: 'decide'; round: Round; option: OptionId }
  | { type: 'receiveFormal' }
  | { type: 'advance'; round: Round };

export function createCase(id: string, mode: Mode): CaseState {
  return {
    version: SAVE_VERSION, id, mode, phase: 'briefing', time: '09:00', points: STARTING_POINTS,
    saved: [], verified: [], slots: { H1: [null, null], H2: [null, null, null, null], H3: [null, null] },
    simulations: {}, focus: 'open', protection: { contacts: false, location: false, record: false },
    usedHint: false, avatar: 'initial', round: 1, activeReceipt: false, formalPending: false, receipts: [], events: [],
    world: { pending: [...RISK_IDS], paused: false, coverage: 'none', cooperation: false, policy: false, rosterAt: null },
  };
}

type NewEvent = Pick<CaseEvent, 'kind' | 'title' | 'detail'> & Partial<CaseEvent>;

function snapshot(state: CaseState): EventSnapshot {
  return { phase: state.phase, time: state.time, points: state.points, protection: state.protection, ...state.world };
}

function record(state: CaseState, update: Partial<CaseState>, entry: NewEvent): CaseState {
  const next = { ...state, ...update };
  const event = {
    evidence: [], spent: 0, ...entry, id: `${state.id}-${state.events.length + 1}`,
    before: snapshot(state), after: snapshot(next),
  };
  return { ...next, events: [...state.events, event] };
}

export function evidenceStatus(state: CaseState, evidence: EvidenceId): string {
  if (evidence === 'E8') return '关联待查';
  if (evidence === 'E4') return state.verified.includes('chen') ? '身份已独立核实' : '身份待独立核实';
  if (evidence === 'E2') return state.verified.includes('linxia') ? '转发来源已核验' : '转发记录';
  return DIRECT_SOURCES.includes(evidence) ? '来源已核验' : '原始记录';
}

export function confirmedRisks(state: CaseState): RiskId[] {
  return RISK_IDS.filter((risk) => state.simulations[risk]?.status === 'confirmed');
}

export function touchedRisk(state: CaseState, risk: RiskId): boolean {
  return Boolean(state.simulations[risk]) || RISKS[risk].required.some((id) => state.saved.includes(id))
    || (risk === 'H1' && state.verified.includes('chen')) || (risk === 'H2' && state.verified.includes('gu'));
}

export function verificationBlock(state: CaseState, contact: ContactId): string | undefined {
  if (state.verified.includes(contact)) return '已完成正式核实';
  if (state.points < VERIFY_COST) return '行动点已用完。可以继续免费查阅并提交调查。';
  if (state.points - VERIFY_COST < SIMULATION_COST && !Object.keys(state.simulations).length) {
    return '已为一次模拟保留 2 点。你也可以直接提交调查记录。';
  }
}

export function reviewEvidence(state: CaseState, risk: RiskId): SimulationReview {
  const evidence = state.slots[risk].filter((id): id is EvidenceId => id !== null);
  const { required, gaps, supplementary } = RISKS[risk];
  const missing = gaps.filter((_, index) => !evidence.includes(required[index]));
  if (risk === 'H1' && evidence.includes('E4') && !state.verified.includes('chen')) {
    missing.push('当前截图只能看到显示名。还需通过校园通讯录独立核实身份。');
  }
  const misused = evidence.filter((id) => !required.includes(id) && id !== supplementary);
  const status = misused.length ? 'incorrect' : missing.length ? 'insufficient' : 'confirmed';
  return { status, evidence, missing, misused };
}

function runSimulation(state: CaseState, risk: RiskId, recheck: boolean): CaseState {
  const previous = state.simulations[risk];
  if (recheck ? !previous || previous.status === 'confirmed' : Boolean(previous) || state.points < SIMULATION_COST) return state;
  const review = reviewEvidence(state, risk);
  if (recheck && JSON.stringify(review) === JSON.stringify(previous)) return state;
  const spent = recheck ? 0 : SIMULATION_COST;
  const explanation = review.status === 'confirmed' ? RISKS[risk].supported
    : [...review.missing, ...review.misused.map((id) => `${id} 无法支持此项判断。`)].join(' ');
  return record(state, {
    points: state.points - spent, simulations: { ...state.simulations, [risk]: review },
  }, {
    kind: recheck ? 'recheck' : 'simulate', title: `${recheck ? '补证复核' : '隔离模拟'} · ${RISKS[risk].name}`,
    detail: explanation, evidence: review.evidence, spent, risk, status: review.status,
  });
}

function enterCampus(state: CaseState): CaseState {
  let next = record(state, { phase: 'investigation' }, {
    kind: 'enter', title: '进入校园', detail: '09:00，调查权限仅用于隔离副本。科技文化节 21:00 开幕。',
  });
  if (state.mode === 'full') return next;
  const startIndex = next.events.length;
  const prepared: EvidenceId[] = ['E1', 'E2', 'E3', 'E4', 'E5', 'E7'];
  for (const evidence of prepared) next = reduceCase(next, { type: 'save', evidence });
  next = reduceCase(next, { type: 'verify', contact: 'chen' });
  next = { ...next, slots: { ...next.slots, H1: ['E2', 'E4'], H2: ['E1', 'E3', 'E5', 'E7'] } };
  next = reduceCase(next, { type: 'simulate', risk: 'H2' });
  return { ...next, events: next.events.map((event, index) => index < startIndex ? event : { ...event, preset: true }) };
}

export function readyForDefense(state: CaseState): boolean {
  return Object.values(state.protection).every(Boolean);
}

function evidenceFor(state: CaseState, risks: RiskId[]): EvidenceId[] {
  return [...new Set(risks.flatMap((risk) => state.simulations[risk]?.evidence ?? []))];
}

export const COVERAGE_LABEL: Record<Coverage, string> = {
  none: '尚未发出提醒', groups: '已通知活动群', records: '活动群及已核实的报名记录', all: '已发全体提醒',
};

export function optionBlock(state: CaseState, round: Round, option: OptionId): string | undefined {
  if (round === 1 && option === 'B' && !confirmedRisks(state).length) return '需要至少一条已确认的风险作为定向依据。';
}

function receive(state: CaseState, option: OptionId, time: string, actor: Receipt['actor'], title: string,
  lines: string[], change: Partial<CampusState> = {}, evidence: EvidenceId[] = []): CaseState {
  const world = { ...state.world, ...change };
  const blocked = state.world.pending.filter((risk) => !world.pending.includes(risk));
  const receipt: Receipt = { id: `R${state.round}-${option}`, round: state.round, option, time, actor, title, lines, blocked };
  return record(state, { world, time, formalPending: false, activeReceipt: true, receipts: [...state.receipts, receipt] }, {
    kind: 'receipt', title, detail: lines.join(' '), evidence, receipt: receipt.id,
  });
}

function afterTenMinutes(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const total = hours * 60 + minutes + 10;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const CHANNEL_ACTIONS: Record<RiskId, string> = {
  H1: '已限制冒用账号的相关发布权限。', H2: '已停用报名助手的本届接入，停止新增权限访问。', H3: '已停用仍被转发的上届表单入口。',
};

function decide(state: CaseState, round: Round, option: OptionId): CaseState {
  if (state.round !== round || state.activeReceipt || state.formalPending || optionBlock(state, round, option)
    || !DECISIONS[round].options.some((item) => item.id === option)) return state;
  const confirmed = confirmedRisks(state);
  const { pending, paused } = state.world;
  switch (round) {
    case 1:
      if (option === 'A') return receive(state, option, '09:20', 'gu', '全面暂停已执行', [
        '「我先暂停报名写入，也封住风险跳转和助手新增权限访问。官方入口一起暂停。」', '三条底层风险仍待修复。历史资料另行核查。',
      ], { paused: true });
      if (option === 'B') return receive(state, option, '09:20', 'gu', '定向处置已执行', [
        ...confirmed.map((risk) => CHANNEL_ACTIONS[risk]), '本届官方入口保持开放。其余项目仍待处理。',
      ], { pending: pending.filter((risk) => !confirmed.includes(risk)) }, evidenceFor(state, confirmed));
      return receive(state, option, '09:20', 'linxia', '渠道维持原状', [
        '「我先记着。群里又有人来问，照那个页面填到底算不算报上。」', '沈一已保护自己的账号。校园渠道维持开放。',
      ]);
    case 2:
      if (option === 'A') return receive(state, option, '09:40', 'gu', '全体提醒已发布', [
        confirmed.length ? `公告列出已确认的${confirmed.map((risk) => RISKS[risk].name).join('、')}，请同学暂缓操作并通过本届入口核对。`
          : '公告提醒同学暂缓使用来源不明的入口，并通过现行公告核对。仍未确认的线索留待调查。',
        '许言收到多条报名咨询。公告没有公布学生信息。',
      ], { coverage: 'all' }, evidenceFor(state, confirmed));
      if (option === 'B') {
        const hasRange = state.verified.includes('gu');
        return receive(state, option, '09:40', 'xuyan', '定向通知已送达', [
          '「陈老师核对了说明，我负责联系活动群和后续报名核对，林夏帮忙把更正转回原群。」',
          hasRange ? '活动群管理员已确认收到，相关报名记录也已补发。群外未知转发仍需跟进。'
            : '活动群管理员已确认收到。影响范围尚未核实，报名批次及群外转发仍需跟进。',
        ], { coverage: hasRange ? 'records' : 'groups', cooperation: true }, hasRange ? ['E7'] : []);
      }
      return receive(state, option, '09:40', 'linxia', '暂未新增提醒', [paused
        ? '「我先不转。报名入口暂停了，群里还有人在等说法。」' : '「我先不转。刚才还有一条新报名消息进群。」']);
    case 3:
      if (option === 'A') return record(state, { formalPending: true }, {
        kind: 'accepted', title: '正式事件单已受理', detail: '09:40，顾老师接手全量复核，13:00 提供执行回执。', evidence: evidenceFor(state, confirmed),
      });
      if (option === 'B') {
        const fixable = [...new Set<RiskId>([...confirmed, 'H3'])];
        return receive(state, option, '10:20', 'xuyan', '协作修复回执已到达', [
          '「旧表单已经撤下。我负责给填错的同学安排补登记，陈老师接手通知和名单核对。」',
          ...pending.filter((risk) => risk !== 'H3' && confirmed.includes(risk)).map((risk) => CHANNEL_ACTIONS[risk]),
          '顾老师按已有依据处理。其余未证实项目保留，历史资料还需另查。',
        ], { pending: pending.filter((risk) => !fixable.includes(risk)), cooperation: true }, evidenceFor(state, confirmed));
      }
      return receive(state, option, '10:00', 'student', '已保留个人记录', [
        '沈一保存证据，维持本人已撤回的授权。这一轮没有新增校园修复任务。',
      ]);
    case 4:
      if (option === 'B') return receive(state, option, state.time, 'gu', '全面暂停继续生效', [
        '「我先保持全面暂停。正常报名和名单交付都要等下一次恢复安排。」',
      ], { paused: true });
      const time = afterTenMinutes(state.time);
      if (pending.length) return receive(state, option, time, 'gu', '现有渠道状态维持', [paused
        ? '「还有项目在待处理清单里，暂不解除暂停。名单仍待确认。」'
        : '「官方入口保持开放，但问题还没处理完。这份名单暂时不能交付分组。」']);
      return receive(state, option, time, 'gu', paused ? '官方报名已恢复' : '官方报名已核对', [
        '「三条风险都已阻断，官方入口可以使用。本届名单已核对并交付给许言。」',
        time > '12:00' ? '错过了 12:00 分组，许言将在收到这份名单后补排。' : '名单已在 12:00 前交付，志愿者可以按计划分组。',
      ], { paused: false, rosterAt: time });
  }
}

export function reduceCase(state: CaseState, command: CaseCommand): CaseState {
  switch (command.type) {
    case 'enter': return state.phase === 'briefing' ? enterCampus(state) : state;
    case 'save': {
      const { evidence } = command;
      if (state.phase !== 'investigation' || state.saved.includes(evidence)) return state;
      return record(state, { saved: [...state.saved, evidence] }, {
        kind: 'save', title: `存为证据 · ${EVIDENCE[evidence].title}`, detail: `${EVIDENCE[evidence].source} · ${EVIDENCE[evidence].time}`, evidence: [evidence],
      });
    }
    case 'verify': {
      const { contact } = command;
      if (state.phase !== 'investigation' || verificationBlock(state, contact)) return state;
      const item = VERIFICATIONS[contact];
      return record(state, { verified: [...state.verified, contact], points: state.points - VERIFY_COST }, {
        kind: 'verify', title: item.title, detail: item.record, evidence: [item.evidence], spent: VERIFY_COST, contact,
      });
    }
    case 'slot': {
      const { risk, index, evidence } = command;
      const slots = state.slots[risk];
      if (state.phase !== 'investigation' || state.simulations[risk]?.status === 'confirmed' || !(index in slots)
        || slots[index] === evidence || (evidence !== null && !state.saved.includes(evidence))) return state;
      const updated = slots.map((id, slot) => slot === index ? evidence : id === evidence ? null : id);
      return { ...state, slots: { ...state.slots, [risk]: updated } };
    }
    case 'simulate': case 'recheck':
      return state.phase === 'investigation' ? runSimulation(state, command.risk, command.type === 'recheck') : state;
    case 'handoff': {
      const { focus } = command;
      if (state.phase !== 'investigation' || (focus !== 'open' && !touchedRisk(state, focus))) return state;
      const evidence = [...new Set([...state.saved, ...state.verified.map((id) => VERIFICATIONS[id].evidence)])];
      return record(state, { phase: 'reversal', focus }, {
        kind: 'handoff', title: '调查记录已提交', detail: focus === 'open' ? '优先核实当前情况。' : `优先关注${RISKS[focus].name}。`, evidence,
      });
    }
    case 'switch': return state.phase === 'reversal' ? record(state, { phase: 'protection', time: '09:10' }, {
      kind: 'switch', title: '切换到沈一的账号', detail: '测试权限已回收。沈一可以处理本人授权，并向学校相关负责人提交申请。',
    }) : state;
    case 'protect': {
      const { action } = command;
      if (state.phase !== 'protection' || state.protection[action]) return state;
      const title = { contacts: '撤回通讯录权限', location: '撤回精确位置权限', record: '已核对本届报名记录' }[action];
      const detail = action === 'record' ? '沈一之前使用了助手，在当前本届名单中没有对应记录。请使用官方入口核对并补登记。'
        : '已停止该项新增访问，先前提交的资料仍需请求管理方核查。';
      return record(state, { protection: { ...state.protection, [action]: true } }, { kind: 'protect', title, detail });
    }
    case 'hint': return state.phase === 'protection' && !state.usedHint ? record(state, { usedHint: true }, {
      kind: 'hint', title: '查看本人保护指引', detail: '提示不影响结局或行动风格。',
    }) : state;
    case 'avatar': return state.phase === 'protection' ? { ...state, avatar: command.avatar } : state;
    case 'beginDefense': return state.phase === 'protection' && readyForDefense(state) ? record(state, { phase: 'defense' }, {
      kind: 'beginDefense', title: '进入校园处置', detail: '依次申请渠道处置、通知、修复和恢复。由对应负责人执行并返回回执。',
    }) : state;
    case 'decide': return state.phase === 'defense' ? decide(state, command.round, command.option) : state;
    case 'receiveFormal': return state.phase === 'defense' && state.round === 3 && state.formalPending ? receive(state, 'A', '13:00', 'gu', '正式复核执行完毕', [
      '「三个新增风险途径均已阻断。本届已落实应用接入审核、身份核验和旧入口管理。」',
      '12:00 志愿者分组已错过，许言需要补排。历史资料核查将继续。',
    ], { pending: [], policy: true }) : state;
    case 'advance': {
      if (state.phase !== 'defense' || !state.activeReceipt || state.round !== command.round) return state;
      if (state.round < 4) return { ...state, activeReceipt: false, round: (state.round + 1) as Round };
      return record(state, { phase: 'ending', activeReceipt: false }, {
        kind: 'ending', title: '结案', detail: '四轮处置回执已归档。',
      });
    }
  }
}

export function determineEnding({ pending, paused, coverage, cooperation, policy }: CampusState): EndingId {
  if (!paused && pending.length >= 2 && coverage !== 'all') return 'ending_domino';
  if (paused) return 'ending_isolation';
  if (pending.length === 0) {
    if (cooperation && policy) return 'ending_dawn';
    if (policy) return 'ending_rebuild';
    if (cooperation) return 'ending_consensus';
  }
  return 'ending_unresolved';
}

export function validSavedEvidence(value: string): value is EvidenceId {
  return EVIDENCE_IDS.some((id) => id === value);
}

export function verificationRecords(state: CaseState, evidence: EvidenceId) {
  return CONTACT_IDS.filter((id) => VERIFICATIONS[id].evidence === evidence && state.verified.includes(id))
    .map((id) => ({ ...VERIFICATIONS[id], preset: state.events.some((event) => event.contact === id && event.preset) }));
}
