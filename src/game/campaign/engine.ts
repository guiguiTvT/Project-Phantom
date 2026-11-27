import { PERSONALITY_BY_CODE } from '@/data/personalities';
import type { PersonalityCode } from '@/types/personality';
import type { Person } from '../../../functions/shared/chapterDialogue';
import { CAMPAIGN_CASES } from './cases';
import { completedExercise, type ExerciseAttempt } from './exercises';
import { foundPair, NOTICE_FIELDS, OPENING_AREA, OPENING_FILES, PAYMENT_FIELDS, SEARCH_AREAS, type OpeningBeat } from './investigation';
import { CASE_IDS, type Attempt, type Axis, type CaseDefinition, type CaseId, type Disposition, type FollowAction, type Letter, type Stage, type Step } from './types';

export interface Observation { caseId: CaseId; stepId: string; axis: Axis; letter: Letter; action: string }
export type StepStatus = 'done' | 'pending' | 'saved';
interface Receipt { id: string; actor: string; text: string }
interface World {
  safe: boolean;
  fixed: boolean;
  normal: boolean;
  cooperation: boolean;
  receipts: Receipt[];
}

export interface CaseProgress {
  completed: Record<string, StepStatus | undefined>;
  seen: string[];
  requiredSpent: number;
  extraSpent: number;
  disposition: Disposition | null;
  lockedOrder: boolean;
  help: 'untouched' | 'open' | 'closed';
  exercise?: ExerciseAttempt['kind'];
  world: World;
}

export interface Campaign {
  version: 6;
  id: string;
  stage: Stage;
  caseIndex: number;
  stepIndex: number;
  opening?: OpeningBeat;
  met?: Person[];
  cases: Record<CaseId, CaseProgress>;
  observations: Observation[];
  spread: CaseId[];
  followups: { caseId: CaseId; action: FollowAction; text: string }[];
  rule: { caseId: CaseId; receipt: Receipt } | null;
}

function emptyCase(): CaseProgress {
  return { completed: {}, seen: [], requiredSpent: 0, extraSpent: 0, disposition: null, lockedOrder: false, help: 'untouched',
    world: { safe: false, fixed: false, normal: false, cooperation: false, receipts: [] } };
}

export function startCampaign(id?: string): Campaign {
  const crypto = globalThis.crypto;
  const runId = id ?? (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return { version: 6, id: runId, stage: 'opening', caseIndex: 0, stepIndex: 0,
    cases: { festival: emptyCase(), job: emptyCase(), camera: emptyCase(), voice: emptyCase() },
    observations: [], spread: [], followups: [], rule: null };
}

export function currentCase(run: Campaign) { return CAMPAIGN_CASES[CASE_IDS[run.caseIndex]]; }
export function currentStep(run: Campaign) { return currentCase(run).steps[run.stepIndex]; }
export function hasMet(run: Campaign, person: Person) { return run.met?.includes(person) ?? false; }
export function openingBeat(run: Campaign): OpeningBeat { return run.opening ?? 'arrival'; }
export function savedLin(run: Campaign) { return run.cases.festival.completed['f-contact'] === 'saved'; }
export function knowsZhou(run: Campaign) {
  return run.observations.some((item) => item.stepId === 'j-method' && item.letter === 'R');
}

const SUPPLEMENTS = {
  festival: { linxia: { record: 'FRelay', after: 'E4' }, xuyan: { record: 'FExtra', after: 'E6' } },
  job: { zhouning: { record: 'JExtra', after: 'JOfficial' }, gu: { record: 'JCampus', after: 'J4' } },
  camera: {}, voice: {},
} satisfies Record<CaseId, Partial<Record<Person, { record: string; after: string }>>>;

export function extraInquiry(run: Campaign, person: Person) {
  const id = currentCase(run).id;
  const available: Partial<Record<Person, { record: string; after: string }>> = SUPPLEMENTS[id];
  const candidate = available[person];
  if (!candidate || !run.cases[id].seen.includes(candidate.after)) return undefined;
  return candidate.record;
}

function updateCase(run: Campaign, caseId: CaseId, progress: CaseProgress): Campaign {
  return { ...run, cases: { ...run.cases, [caseId]: progress } };
}

function finish(progress: CaseProgress, id: string, status: StepStatus = 'done'): CaseProgress {
  return { ...progress, completed: { ...progress.completed, [id]: status } };
}

function file(progress: CaseProgress, record: string): CaseProgress {
  return progress.seen.includes(record) ? progress : { ...progress, seen: [...progress.seen, record] };
}

function needsProof(step: Step) { return step.kind === 'puzzle' || step.kind === 'verify'; }

export function pendingChecks(definition: CaseDefinition, progress: CaseProgress) {
  return definition.steps.filter((step) => needsProof(step) && progress.completed[step.id] !== 'done');
}

export function repairReady(definition: CaseDefinition, progress: CaseProgress) {
  return pendingChecks(definition, progress).length === 0 && (definition.id !== 'camera' || progress.lockedOrder && progress.help !== 'open');
}

export function canUseToken(run: Campaign, definition: CaseDefinition, id: string) {
  return !definition.files[id] || run.cases[definition.id].seen.includes(id);
}

export function matchesPuzzle(step: Extract<Step, { kind: 'puzzle' }>, attempt: Attempt) {
  const { puzzle } = step;
  if (puzzle.kind === 'group') {
    return !Array.isArray(attempt) && Object.keys(attempt).length === puzzle.tokens.length
      && puzzle.tokens.every(({ id }) => (attempt as Record<string, string>)[id] === puzzle.answer[id]);
  }
  return Array.isArray(attempt) && attempt.length === puzzle.answer.length && new Set(attempt).size === attempt.length
    && puzzle.answer.every((id, index) => puzzle.kind === 'order' ? attempt[index] === id : attempt.includes(id));
}

function receipt(world: World, id: string, actor: string, text: string): World {
  return { ...world, receipts: [...world.receipts, { id, actor, text }] };
}

function cooperate(run: Campaign, definition: CaseDefinition) {
  const choices = run.observations.filter((item) => item.caseId === definition.id);
  return choices.some((item) => item.letter === 'R') || definition.id === 'voice' && choices.some((item) => item.letter === 'A');
}

function disposeCase(run: Campaign, definition: CaseDefinition, disposition: Disposition): Campaign {
  const { id, result, handler } = definition;
  const step = currentStep(run);
  const progress = run.cases[id];
  if (progress.disposition) return run;
  const fixed = disposition === 'resolve' || disposition === 'pause-repaired';
  if (fixed && !repairReady(definition, progress)) return run;
  const safe = disposition !== 'pending';
  const normal = disposition === 'resolve';
  const cooperation = safe && cooperate(run, definition);
  let world: World = { ...progress.world, fixed, safe, normal, cooperation };
  if (safe) world = receipt(world, `${definition.number}-处置`, handler, fixed ? result.repaired : result.isolated);
  if (normal) world = receipt(world, `${definition.number}-恢复`, handler, result.normal);
  if (cooperation) world = receipt(world, `${definition.number}-接手`, handler, result.cooperation);
  if (!safe && definition.id === 'job' && knowsZhou(run)) {
    world = receipt({ ...world, cooperation: true }, '2-协作', '周宁', '周宁已经把岗位、任务和资金材料整理交接，并留下联系同学的安排。发布负责人仍待确认处置。');
  }
  return updateCase(run, id, {
    ...finish(progress, step.id, safe ? 'done' : 'pending'), disposition, world,
    lockedOrder: id === 'camera' && safe ? true : progress.lockedOrder,
    help: id === 'camera' && safe && progress.help === 'open' ? 'closed' : progress.help,
  });
}

function nextStepIndex(run: Campaign, definition: CaseDefinition) {
  const { completed } = run.cases[definition.id];
  return definition.steps.findIndex((item, index) => index > run.stepIndex && !completed[item.id]);
}

export function followingStep(run: Campaign): Step | undefined {
  const definition = currentCase(run);
  return definition.steps[nextStepIndex(run, definition)];
}

function advance(run: Campaign, definition: CaseDefinition, step: Step): Campaign {
  if (step.kind !== 'scene' && !run.cases[definition.id].completed[step.id]) return run;
  const next = nextStepIndex(run, definition);
  if (next !== -1) return { ...run, stepIndex: next };
  if (definition.id === 'job') {
    const spread = CASE_IDS.slice(0, 2).filter((id) => !run.cases[id].world.safe);
    return { ...run, stage: 'switch', spread };
  }
  if (definition.id === 'voice') {
    const spread = run.cases.voice.world.fixed ? run.spread : [...run.spread, 'voice' as const];
    return { ...run, stage: 'followup', spread };
  }
  return { ...run, caseIndex: run.caseIndex + 1, stepIndex: 0 };
}

export const FOLLOW_ACTIONS: Readonly<Record<FollowAction, { label: string; verb: string }>> = {
  repair: { label: '补齐核验并落实处置', verb: '补齐处置' },
  coordinate: { label: '请联系人落实接手', verb: '落实接手' },
  restore: { label: '恢复已核验的正常入口', verb: '恢复正常事务' },
  rule: { label: '将核验办法落实为规则', verb: '让规则生效' },
  wait: { label: '维持现状，等待回执', verb: '保留待办' },
};

export function followOptions(run: Campaign, id: CaseId): FollowAction[] {
  const { world } = run.cases[id];
  const choices: FollowAction[] = [];
  if (!world.fixed) choices.push('repair');
  if (!world.cooperation) choices.push('coordinate');
  if (world.safe && !world.normal && (world.fixed || id !== 'festival')) choices.push('restore');
  if (world.fixed && !run.rule) choices.push('rule');
  if (choices.length) choices.push('wait');
  return choices;
}

export function followExplanation(run: Campaign, id: CaseId, action: FollowAction) {
  const definition = CAMPAIGN_CASES[id];
  switch (action) {
    case 'repair': {
      const outstanding = pendingChecks(definition, run.cases[id]).map((step) => step.goal);
      return outstanding.length
        ? `${definition.handler}将补查这 ${outstanding.length} 项依据。${outstanding.map((goal) => `${goal}。`).join('')} 复核后由有权处理的人执行并签收。`
        : `${definition.handler}依据已有记录办理具体整改，完成后给出执行回执。`;
    }
    case 'coordinate': return `请${definition.handler}明确分工，实际完成一次提醒、核对或交接。`;
    case 'restore': return `由${definition.handler}复核可以安全使用的入口，再确认开放或安全结束。`;
    case 'rule': return definition.result.rule;
    case 'wait': return '记录目前的未决事项，交由已有负责人等待回执。';
  }
}

function follow(run: Campaign, id: CaseId, action: FollowAction): Campaign {
  if (run.followups.length >= 2 || !followOptions(run, id).includes(action)) return run;
  const { result, handler, ruleOwner, number } = CAMPAIGN_CASES[id];
  const progress = run.cases[id];
  const idPrefix = `${number}-跟进${run.followups.length + 1}`;
  let next = progress;
  let note = '已记录等待事项。当前处理状态保留。';
  let rule = run.rule;
  switch (action) {
    case 'repair': {
      note = result.repaired;
      const reviewed = pendingChecks(CAMPAIGN_CASES[id], progress).map((step) => step.button.split(' · ')[0]);
      const proof = reviewed.length ? `负责人已补查：${reviewed.join('、')}。` : '';
      const world = receipt({ ...progress.world, safe: true, fixed: true }, idPrefix, handler, `${proof}${note}`);
      next = { ...progress, world, lockedOrder: id === 'camera' || progress.lockedOrder, help: progress.help === 'open' ? 'closed' : progress.help };
      break;
    }
    case 'coordinate':
      note = result.cooperation;
      next = { ...progress, world: receipt({ ...progress.world, cooperation: true }, idPrefix, handler, note) };
      break;
    case 'restore':
      note = result.normal;
      next = { ...progress, world: receipt({ ...progress.world, normal: true }, idPrefix, handler, note) };
      break;
    case 'rule':
      note = result.rule;
      rule = { caseId: id, receipt: { id: idPrefix, actor: ruleOwner, text: note } };
      next = { ...progress, world: { ...progress.world, receipts: [...progress.world.receipts, rule.receipt] } };
      break;
  }
  return { ...updateCase(run, id, next), rule, followups: [...run.followups, { caseId: id, action, text: note }] };
}

export type Command =
  | { type: 'advance' | 'skip' | 'verify' | 'authorize' | 'saveContact' | 'lockOrder' | 'proceedOrder' | 'end' }
  | { type: 'help'; open: boolean }
  | { type: 'meet'; person: Person }
  | { type: 'explore'; record: string }
  | { type: 'noticePair'; fields: readonly string[]; lead: 'notice' | 'forward' }
  | { type: 'paymentPair'; fields: readonly string[] }
  | { type: 'call'; via: 'saved' | 'trusted-friend' }
  | { type: 'simulate'; attempt: ExerciseAttempt }
  | { type: 'read'; record: string }
  | { type: 'inquire'; person: Person }
  | { type: 'observe'; letter: Letter }
  | { type: 'solve'; attempt: Attempt }
  | { type: 'dispose'; disposition: Disposition }
  | { type: 'replay'; caseId: CaseId }
  | { type: 'follow'; caseId: CaseId; action: FollowAction };

function replay(run: Campaign, caseId: CaseId) {
  const caseIndex = CAMPAIGN_CASES[caseId].number - 1;
  const previous = CASE_IDS.slice(0, caseIndex);
  const cases = Object.fromEntries(CASE_IDS.map((id) => [id, previous.includes(id) ? run.cases[id] : emptyCase()])) as Campaign['cases'];
  return { ...run, stage: caseId === 'festival' ? 'opening' as const : 'case' as const, opening: 'arrival' as const, caseIndex, stepIndex: 0, cases,
    observations: run.observations.filter((item) => previous.includes(item.caseId)),
    spread: run.spread.filter((id) => previous.includes(id)), followups: [],
    rule: run.rule && previous.includes(run.rule.caseId) ? run.rule : null };
}

function openingCommand(run: Campaign, command: Command) {
  const beat = openingBeat(run);
  const progress = run.cases.festival;
  if (command.type === 'advance' && beat === 'arrival') return { ...run, opening: 'search' as const };
  if (command.type === 'explore' && beat === 'search' && OPENING_AREA.props.some((prop) => prop.id === command.record)) {
    return updateCase(run, 'festival', file(progress, command.record));
  }
  if (command.type === 'advance' && beat === 'search' && OPENING_FILES.every((fileId) => progress.seen.includes(fileId))) {
    return { ...run, opening: 'compare' as const };
  }
  if (command.type === 'noticePair' && beat === 'compare' && foundPair(command.fields, NOTICE_FIELDS)) {
    const first = command.lead === 'notice' ? 'E' : 'I';
    const observation: Observation = { caseId: 'festival', stepId: 'f-first', axis: 'EI', letter: first,
      action: first === 'E' ? '你带上两份通知，请顾老师看原公告的入口。' : '你先把入口疑似被替换记成一个疑点，再请顾老师核实。' };
    const compared = ['f-open', 'f-first', 'f-entry'].reduce((state, id) => finish(state, id), progress);
    return { ...updateCase(run, 'festival', compared), opening: 'invite' as const, observations: [...run.observations, observation] };
  }
  if (command.type === 'authorize' && beat === 'invite') {
    const firstOffice = CAMPAIGN_CASES.festival.steps.findIndex((step) => step.id === 'f-notices');
    return { ...run, stage: 'case' as const, caseIndex: 0, stepIndex: firstOffice };
  }
  return run;
}

function explore(run: Campaign, definition: CaseDefinition, step: Step, record: string) {
  const area = SEARCH_AREAS[step.id];
  if (step.kind !== 'read' || !area?.props.some((prop) => prop.id === record)) return run;
  const progress = run.cases[definition.id];
  let next = file(progress, record);
  for (const id of area.relatedReads ?? [step.id]) {
    const nearby = definition.steps.find((item) => item.id === id);
    if (nearby?.kind === 'read' && !next.completed[id] && nearby.cards.every((fileId) => next.seen.includes(fileId))) next = finish(next, id);
  }
  return updateCase(run, definition.id, next);
}

export function campaignReducer(run: Campaign, command: Command): Campaign {
  if (command.type === 'meet') return hasMet(run, command.person) ? run : { ...run, met: [...(run.met ?? []), command.person] };
  if (run.stage === 'opening') return openingCommand(run, command);
  if (run.stage === 'switch') return command.type === 'advance' ? { ...run, stage: 'case', caseIndex: 2, stepIndex: 0 } : run;
  if (run.stage === 'followup') {
    if (command.type === 'end') return { ...run, stage: 'ending' };
    return command.type === 'follow' ? follow(run, command.caseId, command.action) : run;
  }
  if (run.stage === 'ending') return command.type === 'replay' ? replay(run, command.caseId) : run;
  if (run.stage !== 'case') return run;
  const definition = currentCase(run);
  const step = currentStep(run);
  const { id } = definition;
  const progress = run.cases[id];
  const status = progress.completed[step.id];
  if (command.type === 'advance') return advance(run, definition, step);
  if (command.type === 'explore') return explore(run, definition, step, command.record);
  if (command.type === 'inquire' && !progress.disposition) {
    const record = extraInquiry(run, command.person);
    if (!record || progress.seen.includes(record) || progress.extraSpent >= 2) return run;
    return updateCase(run, id, { ...file(progress, record), extraSpent: progress.extraSpent + 1 });
  }
  if (command.type === 'help' && step.kind === 'assistance' && !status) {
    return updateCase(run, id, { ...file(progress, 'C5'), help: command.open ? 'open' : 'closed' });
  }
  if (status) return run;
  let next = progress;
  switch (command.type) {
    case 'read':
      if (step.kind !== 'read' || !step.cards.includes(command.record)) return run;
      next = file(progress, command.record);
      if (step.cards.every((record) => next.seen.includes(record))) next = finish(next, step.id);
      break;
    case 'observe': {
      if (step.kind !== 'observe') return run;
      const choice = step.choices.find((option) => option.letter === command.letter);
      const costsPoint = choice?.optionalPoint && !progress.seen.includes(choice.material ?? '');
      if (!choice || costsPoint && progress.extraSpent >= 2) return run;
      let action = choice.action;
      if (step.id === 'j-method' && choice.letter === 'S' && !progress.seen.includes('JOfficial')) action = '你整理了已看到的招聘记录，把企业回复标为待核实。';
      if (step.id === 'v-priority' && choice.letter === 'F' && !progress.seen.includes('V3')) action = '你把原有联系渠道列入核验安排，更正由联系人跟进。';
      if (step.id === 'v-scope' && choice.letter === 'A' && !progress.seen.includes('V3')) action = '你单独联系其他收件人核对，同时保留本人确认待办。';
      next = finish(choice.material ? file(progress, choice.material) : progress, step.id);
      if (costsPoint) next = { ...next, extraSpent: next.extraSpent + 1 };
      return { ...updateCase(run, id, next), observations: [...run.observations, { caseId: id, stepId: step.id, axis: step.axis, letter: choice.letter, action }] };
    }
    case 'solve':
      if (step.kind !== 'puzzle' || !matchesPuzzle(step, command.attempt)
        || (step.puzzle.kind !== 'group' && step.puzzle.answer.some((token) => !canUseToken(run, definition, token)))) return run;
      next = finish(progress, step.id);
      break;
    case 'paymentPair':
      if (step.id !== 'c-ids' || !['C1', 'C2'].every((fileId) => progress.seen.includes(fileId)) || !foundPair(command.fields, PAYMENT_FIELDS)) return run;
      next = finish(progress, step.id);
      break;
    case 'verify':
      if (step.kind !== 'verify' || step.id === 'v-owner' || progress.requiredSpent + step.cost > 4) return run;
      next = { ...finish(file(progress, step.record), step.id), requiredSpent: progress.requiredSpent + step.cost };
      break;
    case 'call':
      if (step.kind !== 'verify' || step.id !== 'v-owner' || command.via !== (savedLin(run) ? 'saved' : 'trusted-friend')) return run;
      next = finish(file(progress, step.record), step.id);
      if (next.seen.includes('V1')) next = finish(next, 'v-proof');
      break;
    case 'simulate':
      if (step.kind !== 'simulation' || (id !== 'festival' && id !== 'job')
        || progress.requiredSpent + 2 > 4 || !completedExercise(id, command.attempt)) return run;
      next = { ...finish(progress, step.id), requiredSpent: progress.requiredSpent + 2, exercise: command.attempt.kind };
      break;
    case 'saveContact':
      if (step.kind !== 'contact') return run;
      next = finish(file(progress, 'FContact'), step.id, 'saved');
      break;
    case 'lockOrder':
      if (step.kind !== 'assistance') return run;
      next = { ...file(progress, 'C5'), lockedOrder: true, help: progress.help === 'open' ? 'closed' : progress.help };
      break;
    case 'proceedOrder':
      if (step.kind !== 'assistance' || progress.help === 'open') return run;
      next = finish(file(progress, 'C5'), step.id, progress.lockedOrder ? 'done' : 'pending');
      break;
    case 'skip':
      if (!['puzzle', 'verify', 'simulation', 'contact'].includes(step.kind)) return run;
      next = finish(progress, step.id, 'pending');
      break;
    case 'dispose':
      return step.kind === 'resolve' ? disposeCase(run, definition, command.disposition) : run;
    default:
      return run;
  }
  return updateCase(run, id, next);
}

export function results(run: Campaign) {
  const worlds = CASE_IDS.map((id) => run.cases[id].world);
  const safety = worlds.filter((world) => world.safe).length * 25;
  const fix = worlds.filter((world) => world.fixed).length * 25;
  const order = worlds.filter((world) => world.normal).length * 25;
  const relations = worlds.filter((world) => world.cooperation).length * 25;
  return { safety, fix, order, relations };
}

export function endingFor(run: Campaign) {
  const { safety, fix, order, relations } = results(run);
  if (run.spread.length && safety <= 40) return 'ending_domino';
  if (safety >= 80 && order <= 30) return 'ending_isolation';
  if (safety >= 70 && fix >= 60 && order >= 50) return 'ending_dawn';
  if (run.rule && safety >= 60) return 'ending_rebuild';
  if (relations >= 70 && safety >= 60) return 'ending_consensus';
  return 'ending_unresolved';
}

const STYLE_DIMENSIONS = [
  { axis: 'EI', name: '信息处理', labels: ['先看依据', '先提出假设'] },
  { axis: 'CA', name: '行动策略', labels: ['先控当前范围', '主动关联核验'] },
  { axis: 'PF', name: '价值倾向', labels: ['先保护当事人', '先恢复可信路径'] },
  { axis: 'SR', name: '解决方式', labels: ['先走正式流程', '先组织人物协作'] },
] as const;

export function styleFor(run: Campaign) {
  const dimensions = STYLE_DIMENSIONS.map(({ axis, name, labels }) => {
    const actions = run.observations.filter((item) => item.axis === axis);
    const left = actions.filter((item) => item.letter === axis[0]).length;
    const right = actions.length - left;
    const index = left > right ? 0 : 1;
    const letter = actions.length < 2 || left === right ? '' : axis[index];
    const label = actions.length < 2 ? '依据不足' : left === right ? '混合倾向' : labels[index];
    return { name, axis, actions, letter, label };
  });
  const code = dimensions.map((item) => item.letter).join('');
  const profile = code.length === 4 ? PERSONALITY_BY_CODE[code as PersonalityCode] : undefined;
  return { dimensions, profile };
}

export function caseSummary(run: Campaign, id: CaseId) {
  const { world } = run.cases[id];
  const { result } = CAMPAIGN_CASES[id];
  const complete = {
    festival: '助手与旧表已停用，官方报名可用。',
    job: '招募已撤下，已提交资料有回执，可以走正规渠道投递。',
    camera: '平台已处理争议，沈一可以从原平台结束这笔订单。',
    voice: '冒名消息已处置，林夏的原有联系可用。',
  };
  if (world.fixed && world.normal) return complete[id];
  if (world.fixed) return `${result.repaired}正常事务仍暂停。`;
  return world.safe ? `${result.isolated}${world.normal ? result.normal : ''}` : result.pending;
}
