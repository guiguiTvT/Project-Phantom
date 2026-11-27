import { createEmptyPersonality } from '@/engine/PersonalityEngine';
import type { WorldState } from '@/types';
import {
  CASE_HOTSPOTS,
  HOTSPOT_BY_ID,
  VN_EVIDENCE_BY_ID,
} from '../data/evidence';
import {
  DEFENSE_DECISIONS,
  HYPOTHESES,
  NPC_BY_ID,
  NPC_LIST,
  REVERSAL_FRAMES,
  WITNESS_BY_NPC,
} from '../data/story';
import {
  applyWorldDelta,
  buildDefensePlan,
  getDefenseDecision,
  getDefenseOption,
  INITIAL_WORLD,
  judgeEnding,
  verifiedHypotheses,
  withCascadeEvent,
} from './DefenseEngine';
import { recordPersona } from './PersonaEngine';
import {
  evaluatePresentation,
  getWitnessCase,
  statementsFor,
} from './TestimonyEngine';
import type {
  DefenseDecision,
  HypothesisId,
  NpcId,
  NpcProfile,
  PresentationEvaluation,
  VnEvidenceId,
  VnLogEntry,
  VnResult,
  VnState,
  WitnessCase,
} from '../types';

export const VN_MAX_AP = 6;

const WORLD_LABEL: Record<keyof WorldState, string> = {
  security: '安全',
  operation: '秩序',
  relations: '关系',
  repair: '修复',
};

function now(): string {
  return new Date().toISOString();
}

function log(state: VnState, label: string, detail: string, apDelta = 0): VnState {
  const entry: VnLogEntry = {
    id: `vn-log-${state.log.length + 1}`,
    at: now(),
    label,
    detail,
    apDelta,
  };
  return { ...state, turn: state.turn + 1, log: [...state.log, entry] };
}

function addEvent(state: VnState, events: string[]): VnState {
  const next = state.events.filter((event) => !events.includes(event));
  return { ...state, events: [...next, ...events] };
}

function grantEvidence(
  state: VnState,
  evidenceId: VnEvidenceId,
): { state: VnState; granted?: VnEvidenceId } {
  if (state.collectedEvidenceIds.includes(evidenceId)) return { state };
  return {
    state: {
      ...state,
      collectedEvidenceIds: [...state.collectedEvidenceIds, evidenceId],
    },
    granted: evidenceId,
  };
}

function redteamGuard(state: VnState): VnResult | null {
  if (state.redteamAccess) return null;
  return { state, ok: false, message: '红队权限已收回，只能使用已归档的材料。' };
}

export function createVnState(): VnState {
  return {
    scene: 'cover',
    ap: VN_MAX_AP,
    maxAp: VN_MAX_AP,
    world: { ...INITIAL_WORLD },
    redteamAccess: true,
    collectedEvidenceIds: [],
    foundHotspotIds: [],
    npcDoneIds: [],
    npcVerifiedIds: [],
    activeNpcId: null,
    npcLineIndex: 0,
    npcReply: null,
    testimonyEntered: false,
    witnessId: null,
    testimonyIndex: 0,
    askedStatementIds: [],
    statementReply: null,
    presentations: [],
    contradictions: [],
    simulationHypothesis: null,
    simulationResult: null,
    reversalIndex: 0,
    defensePlan: [],
    defenseIndex: 0,
    defenseChoices: [],
    defenseFeedback: null,
    endingId: null,
    flags: {},
    events: [],
    personaEvents: [],
    personality: createEmptyPersonality(),
    log: [],
    turn: 0,
  };
}

export function startCase(_state: VnState): VnState {
  const fresh = createVnState();
  return log(
    { ...fresh, scene: 'prologue' },
    '档案启封',
    '获授权的虚构红队测试开始。目标：在文化节前找出异常报名的裂缝。',
  );
}

export function enterInvestigation(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  return {
    state: log({ ...state, scene: 'investigation' }, '进入现场', '文化节活动室。先看看桌上和公告板留下的东西。'),
    ok: true,
    message: '',
  };
}

export function collectHotspot(
  state: VnState,
  hotspotId: string,
): VnResult & { evidenceId?: VnEvidenceId } {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const hotspot = HOTSPOT_BY_ID[hotspotId];
  if (!hotspot) return { state, ok: false, message: '这里没有可调查的东西。' };
  if (state.collectedEvidenceIds.includes(hotspot.evidenceId)) {
    return { state, ok: true, message: '这条材料已经在证据包里。', evidenceId: hotspot.evidenceId };
  }

  const evidence = VN_EVIDENCE_BY_ID[hotspot.evidenceId];
  let next: VnState = {
    ...state,
    collectedEvidenceIds: [...state.collectedEvidenceIds, hotspot.evidenceId],
    foundHotspotIds: state.foundHotspotIds.includes(hotspot.id)
      ? state.foundHotspotIds
      : [...state.foundHotspotIds, hotspot.id],
  };
  next = recordPersona(next, {
    id: `hotspot-${hotspot.id}`,
    node: '现场调查 · 文化节活动室',
    action: '调查现场',
    choice: hotspot.label,
    vector: { evidence: 0.4, caution: 0.2, protection: 0, system: 0 },
    rationale: '主动查看现场物品，把可核对的材料收进证据包。',
    effects: [`材料 ${evidence.id} 已归档`],
    evidenceIds: next.collectedEvidenceIds,
  });
  next = log(next, '找到材料', `收下「${evidence.title}」：${evidence.source}，${evidence.time}。`);
  return {
    state: next,
    ok: true,
    message: `已收进证据包 · ${evidence.id} ${evidence.title}`,
    evidenceId: hotspot.evidenceId,
  };
}

export function enterNpcHub(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  if (state.collectedEvidenceIds.length < 2) {
    return { state, ok: false, message: '再多看一处现场，手里至少要有两条材料。' };
  }
  return {
    state: log(
      { ...state, scene: 'npc', activeNpcId: null, npcReply: null },
      '人物调查',
      '五个人都在附近。先听谁开口，由你决定。',
    ),
    ok: true,
    message: '',
  };
}

export function selectNpc(state: VnState, npcId: NpcId): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const npc = NPC_BY_ID[npcId];
  if (!npc) return { state, ok: false, message: '这里没有这个人。' };
  const done = state.npcDoneIds.includes(npcId);
  return {
    state: {
      ...state,
      scene: 'npc',
      activeNpcId: npcId,
      npcLineIndex: done ? npc.lines.length - 1 : 0,
      npcReply: null,
    },
    ok: true,
    message: '',
  };
}

export function advanceNpc(state: VnState): VnResult & { grantedEvidenceId?: VnEvidenceId } {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const npc = state.activeNpcId ? NPC_BY_ID[state.activeNpcId] : null;
  if (!npc) return { state, ok: false, message: '先说清楚要和谁谈。' };
  if (state.npcReply) return { state: { ...state, npcReply: null }, ok: true, message: '' };
  if (state.npcLineIndex >= npc.lines.length - 1) {
    return { state, ok: true, message: '' };
  }

  let next: VnState = { ...state, npcLineIndex: state.npcLineIndex + 1 };
  if (next.npcLineIndex === npc.lines.length - 1) {
    next = {
      ...next,
      npcDoneIds: state.npcDoneIds.includes(npc.id)
        ? state.npcDoneIds
        : [...state.npcDoneIds, npc.id],
    };
    if (npc.grantOnComplete) {
      const granted = grantEvidence(next, npc.grantOnComplete);
      next = granted.state;
      if (granted.granted) {
        next = log(next, '获得材料', `${npc.name}交出了「${VN_EVIDENCE_BY_ID[granted.granted].title}」。`);
      }
      return { state: next, ok: true, message: '', grantedEvidenceId: granted.granted };
    }
  }
  return { state: next, ok: true, message: '' };
}

export function verifyNpc(state: VnState): VnResult & { evidenceId?: VnEvidenceId } {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const npc = state.activeNpcId ? NPC_BY_ID[state.activeNpcId] : null;
  if (!npc) return { state, ok: false, message: '先说清楚要和谁谈。' };
  if (!state.npcDoneIds.includes(npc.id)) {
    return { state, ok: false, message: '先把这段话听完。' };
  }
  if (state.npcVerifiedIds.includes(npc.id)) {
    return { state, ok: false, message: '这件事已经问清楚了。' };
  }
  if (state.ap < npc.verify.cost) {
    return { state, ok: false, message: '行动点不足，仍可继续其他调查。' };
  }

  let next: VnState = {
    ...state,
    ap: state.ap - npc.verify.cost,
    npcVerifiedIds: [...state.npcVerifiedIds, npc.id],
    npcReply: { emotion: npc.verify.emotion, text: npc.verify.answer },
  };
  let granted: VnEvidenceId | undefined;
  if (npc.verify.evidenceId) {
    const result = grantEvidence(next, npc.verify.evidenceId);
    next = result.state;
    granted = result.granted;
  }
  next = recordPersona(next, {
    id: `npc-verify-${npc.id}`,
    node: `人物调查 · ${npc.name}`,
    action: '追问关键记录',
    choice: npc.verify.label,
    vector: { evidence: 0.4, caution: 0.3, protection: 0.1, system: 0 },
    rationale: '用一次追问换取可归档的记录，而不是只接受口头说法。',
    effects: granted ? [`获得材料 ${granted}`] : ['确认了一段关键说法'],
    evidenceIds: next.collectedEvidenceIds,
  });
  next = log(next, '追问材料', npc.verify.hint, -npc.verify.cost);
  return {
    state: next,
    ok: true,
    message: granted ? `获得材料 · ${granted}（-${npc.verify.cost} 行动点）` : `追问完成（-${npc.verify.cost} 行动点）`,
    evidenceId: granted,
  };
}

export function backToNpcHub(state: VnState): VnState {
  return { ...state, scene: 'npc', activeNpcId: null, npcReply: null, statementReply: null };
}

export function backToInvestigation(state: VnState): VnState {
  return { ...state, scene: 'investigation', activeNpcId: null, npcReply: null };
}

export function witnessReady(state: VnState): NpcId[] {
  return state.npcDoneIds.filter((id) => Boolean(NPC_BY_ID[id]?.witness));
}

export function enterTestimony(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const ready = witnessReady(state);
  if (ready.length === 0) {
    return { state, ok: false, message: '先听至少一位证人把话说完。' };
  }
  const witnessId = state.witnessId && ready.includes(state.witnessId) ? state.witnessId : ready[0];
  return {
    state: log(
      {
        ...state,
        scene: 'testimony',
        testimonyEntered: true,
        witnessId,
        testimonyIndex: 0,
        statementReply: null,
      },
      '开始质询',
      `逐句核对${NPC_BY_ID[witnessId].name}的陈述，把能推翻它的材料找出来。`,
    ),
    ok: true,
    message: '',
  };
}

export function selectWitness(state: VnState, npcId: NpcId): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  if (!state.npcDoneIds.includes(npcId) || !WITNESS_BY_NPC[npcId]) {
    return { state, ok: false, message: '这个人还没有可核对的证词。' };
  }
  return {
    state: { ...state, witnessId: npcId, testimonyIndex: 0, statementReply: null },
    ok: true,
    message: '',
  };
}

export function setStatement(state: VnState, index: number): VnState {
  const total = statementsFor(state.witnessId).length;
  if (total === 0) return state;
  const clamped = Math.max(0, Math.min(total - 1, index));
  return { ...state, testimonyIndex: clamped, statementReply: null };
}

export function askStatementFollowUp(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  const statements = statementsFor(state.witnessId);
  const statement = statements[state.testimonyIndex];
  if (!statement) return { state, ok: false, message: '没有当前陈述。' };
  if (state.askedStatementIds.includes(statement.id)) {
    return { state, ok: false, message: '这条陈述已经追问过了。' };
  }
  if (state.ap < statement.followUp.cost) {
    return { state, ok: false, message: '行动点不足，仍可继续核对或离开。' };
  }
  const npc = NPC_BY_ID[state.witnessId ?? 'linxia'];
  let next: VnState = {
    ...state,
    ap: state.ap - statement.followUp.cost,
    askedStatementIds: [...state.askedStatementIds, statement.id],
    statementReply: statement.followUp.text,
  };
  next = recordPersona(next, {
    id: `testimony-followup-${statement.id}`,
    node: `质询 · ${npc.name}`,
    action: '追问陈述',
    choice: statement.followUp.hint,
    vector: { evidence: 0.3, caution: 0.5, protection: 0, system: 0 },
    rationale: '没有停在表面说法，用追问补了一小段上下文。',
    effects: ['补全了一段证词细节'],
    evidenceIds: next.collectedEvidenceIds,
  });
  next = log(next, '追问陈述', statement.followUp.hint, -statement.followUp.cost);
  return { state: next, ok: true, message: `追问一次（-${statement.followUp.cost} 行动点）` };
}

export function presentTestimonyEvidence(
  state: VnState,
  evidenceId: VnEvidenceId,
): VnResult & { evaluation?: PresentationEvaluation } {
  const guard = redteamGuard(state);
  if (guard) return guard;
  if (!state.collectedEvidenceIds.includes(evidenceId)) {
    return { state, ok: false, message: '证据包里没有这份材料。' };
  }
  const statements = statementsFor(state.witnessId);
  const statement = statements[state.testimonyIndex];
  if (!statement) return { state, ok: false, message: '没有当前陈述。' };

  const evaluation = evaluatePresentation(statement.id, evidenceId);
  const npc = NPC_BY_ID[state.witnessId ?? 'linxia'];
  const duplicatePair = state.presentations.some(
    (item) => item.statementId === statement.id && item.evidenceId === evidenceId,
  );
  let next: VnState = {
    ...state,
    presentations: duplicatePair
      ? state.presentations
      : [...state.presentations, { statementId: statement.id, evidenceId, result: evaluation.result }],
  };

  if (evaluation.result === 'contradiction' && evaluation.hypothesis) {
    const already = state.contradictions.some(
      (item) => item.statementId === statement.id && item.evidenceId === evidenceId,
    );
    if (!already) {
      next = {
        ...next,
        contradictions: [
          ...state.contradictions,
          {
            hypothesis: evaluation.hypothesis,
            witnessId: npc.id,
            statementId: statement.id,
            evidenceId,
          },
        ],
      };
      const evidence = VN_EVIDENCE_BY_ID[evidenceId];
      next = recordPersona(next, {
        id: `testimony-contradiction-${statement.id}-${evidenceId}`,
        node: `质询 · ${npc.name}`,
        action: '出示矛盾证据',
        choice: `用「${evidence.title}」核对证词 ${statement.sceneNo}`,
        vector: {
          evidence: 0.7,
          caution: 0.3,
          protection: evaluation.hypothesis === 'H2' ? 0.4 : 0.1,
          system: 0.4,
        },
        rationale: '把材料与具体说法直接对齐，确认了一处可复现的矛盾。',
        effects: [`确认风险假设 ${evaluation.hypothesis}`],
        evidenceIds: next.collectedEvidenceIds,
      });
      next = log(
        next,
        '发现矛盾',
        `用「${evidence.title}」推翻了${npc.name}的陈述 ${statement.sceneNo}，确认 ${evaluation.hypothesis}。`,
      );
    }
    return {
      state: next,
      ok: true,
      message: already ? '这条矛盾已经记录。' : `发现矛盾 · ${evaluation.hypothesis}`,
      evaluation: { ...evaluation, alreadyFound: already },
    };
  }

  const delta =
    evaluation.result === 'supports'
      ? { evidence: 0.1, caution: 0, protection: 0, system: 0 }
      : { evidence: 0, caution: 0, protection: 0, system: 0 };
  if (delta.evidence !== 0) {
    next = recordPersona(next, {
      id: `testimony-support-${statement.id}-${evidenceId}`,
      node: `质询 · ${npc.name}`,
      action: '出示支持材料',
      choice: `核对证词 ${statement.sceneNo}`,
      vector: delta,
      rationale: '主动寻找能支持说法的材料，而不是只找矛盾。',
      effects: ['确认了一段一致的信息'],
      evidenceIds: next.collectedEvidenceIds,
    });
  }

  return { state: next, ok: true, message: '', evaluation };
}

export function enterSimulation(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  if (!state.testimonyEntered) {
    return { state, ok: false, message: '先在质询里核对至少一段证词。' };
  }
  const verified = verifiedHypotheses(state.contradictions);
  const hypothesis = verified[0] ?? state.simulationHypothesis ?? 'H1';
  return {
    state: log(
      {
        ...state,
        scene: 'simulation',
        simulationHypothesis: hypothesis,
        simulationResult: null,
      },
      '进入红队模拟',
      '在隔离沙盒里验证风险假设，不连接任何真实校园服务。',
    ),
    ok: true,
    message: '',
  };
}

export function selectHypothesis(state: VnState, hypothesisId: HypothesisId): VnState {
  if (state.simulationResult) return state;
  return { ...state, simulationHypothesis: hypothesisId };
}

export function runSimulation(state: VnState): VnResult {
  const guard = redteamGuard(state);
  if (guard) return guard;
  if (state.simulationResult) {
    return { state, ok: false, message: '本次推演已经完成。' };
  }
  const hypothesisId = state.simulationHypothesis ?? 'H1';
  const info = HYPOTHESES[hypothesisId];
  const verified = verifiedHypotheses(state.contradictions).includes(hypothesisId);
  const apSpent = Math.min(2, state.ap);
  const lowResource = state.ap < 2;
  const confidence: 'high' | 'low' = verified && !lowResource ? 'high' : 'low';
  const delta: WorldState = verified
    ? { security: -5, operation: -3, relations: -2, repair: 6 }
    : { security: -9, operation: -7, relations: -5, repair: 0 };

  let next: VnState = {
    ...state,
    ap: state.ap - apSpent,
    world: applyWorldDelta(state.world, delta),
    events: verified
      ? Array.from(
          new Set([
            ...state.events,
            'ev_risk_confirmed',
            ...(lowResource ? ['ev_unresolved_backlog'] : []),
          ]),
        )
      : Array.from(new Set([...state.events, 'ev_unresolved_backlog'])),
    simulationResult: {
      hypothesisId,
      verified,
      confidence,
      apSpent,
      nodes: info.simulation.nodes,
      summary: verified ? '矛盾链吻合，风险可确认。' : '缺少矛盾，按未确认处理。',
      impact: verified ? info.simulation.verified : info.simulation.unverified,
      world: applyWorldDelta(state.world, delta),
    },
  };

  next = recordPersona(next, {
    id: `simulation-${hypothesisId}-${verified ? 'confirmed' : 'unconfirmed'}`,
    node: '红队模拟 · 隔离沙盒',
    action: '运行风险推演',
    choice: `${info.title}（${verified ? '已确认' : '未确认'}）`,
    vector: verified
      ? { evidence: 0.4, caution: 0.6, protection: 0.4, system: 0.6 }
      : { evidence: -0.4, caution: -0.5, protection: -0.4, system: -0.3 },
    rationale: verified
      ? '在已有矛盾的基础上做受控推演，接受可复核的结论。'
      : '在证据不足时仍推进推演，用行动换取一个待补的答案。',
    effects: [
      `推演消耗 ${apSpent} 行动点`,
      ...(Object.keys(delta) as (keyof WorldState)[])
        .filter((key) => delta[key] !== 0)
        .map((key) => `${WORLD_LABEL[key]} ${delta[key] > 0 ? '+' : ''}${delta[key]} → ${next.world[key]}`),
      verified ? '风险状态：已确认' : '风险状态：未确认',
    ],
    evidenceIds: next.collectedEvidenceIds,
  });

  if (lowResource) {
    next = log(
      next,
      '资源不足',
      '行动点不足 2 点，本次推演降为低置信，但仍允许带着未确认风险继续。',
      -apSpent,
    );
  } else {
    next = log(
      next,
      '红队模拟',
      verified ? `${info.title}完成高置信推演。` : `${info.title}缺少矛盾支撑，按低置信推演。`,
      -apSpent,
    );
  }

  return { state: next, ok: true, message: '', simulation: next.simulationResult ?? undefined };
}

export function enterReversal(state: VnState): VnResult {
  if (!state.simulationResult) {
    return { state, ok: false, message: '先完成一次红队模拟。' };
  }
  if (state.scene === 'reversal' || state.scene === 'defense' || state.scene === 'complete') {
    return { state, ok: true, message: '' };
  }
  const next = log(
    addEvent(
      {
        ...state,
        scene: 'reversal',
        reversalIndex: 0,
        redteamAccess: false,
      },
      ['ev_reversal'],
    ),
    '身份反转',
    '模拟结束，红队权限被收回。没有后台，也没有特权，只剩已归档的材料。',
  );
  return { state: next, ok: true, message: '' };
}

function enterDefense(state: VnState): VnState {
  const plan = buildDefensePlan(state.simulationResult);
  return log(
    {
      ...state,
      scene: 'defense',
      redteamAccess: false,
      defensePlan: plan,
      defenseIndex: 0,
      defenseChoices: [],
      defenseFeedback: null,
    },
    '进入防御阶段',
    '72 小时倒计时开始。你只能以普通学生身份做有限次处置。',
  );
}

export function advanceReversal(state: VnState): VnResult {
  if (state.scene !== 'reversal') return { state, ok: false, message: '当前不在反转阶段。' };
  if (state.reversalIndex < REVERSAL_FRAMES.length - 1) {
    return { state: { ...state, reversalIndex: state.reversalIndex + 1 }, ok: true, message: '' };
  }
  return { state: enterDefense(state), ok: true, message: '' };
}

export function skipReversal(state: VnState): VnResult {
  if (state.scene !== 'reversal') return { state, ok: false, message: '当前不在反转阶段。' };
  return { state: enterDefense(state), ok: true, message: '' };
}

export function currentDefense(state: VnState): DefenseDecision | null {
  const id = state.defensePlan[state.defenseIndex];
  return id ? getDefenseDecision(id) : null;
}

export function chooseDefenseOption(
  state: VnState,
  decisionId: string,
  optionId: string,
): VnResult {
  if (state.scene !== 'defense') return { state, ok: false, message: '当前不在防御阶段。' };
  if (state.defenseFeedback) return { state, ok: false, message: '先看完这个选择的结果。' };
  const decision = currentDefense(state);
  if (!decision || decision.id !== decisionId) {
    return { state, ok: false, message: '这个决策不在当前轮次。' };
  }
  const option = getDefenseOption(decision, optionId);
  if (!option) return { state, ok: false, message: '没有这个选项。' };
  if (state.ap < option.cost) {
    return { state, ok: false, message: '剩余资源不足，换一个成本更低的动作。' };
  }

  const npc = NPC_BY_ID[decision.npcId];
  let next: VnState = {
    ...state,
    ap: state.ap - option.cost,
    world: applyWorldDelta(state.world, option.effects),
    defenseChoices: [
      ...state.defenseChoices,
      { decisionId: decision.id, optionId: option.id, effects: option.effects },
    ],
    defenseFeedback: { decisionId: decision.id, optionId: option.id },
    events: option.events
      ? Array.from(new Set([...state.events, ...option.events]))
      : state.events,
    flags: option.flags
      ? { ...state.flags, ...Object.fromEntries(option.flags.map((flag) => [flag, true])) }
      : state.flags,
  };

  next = recordPersona(next, {
    id: `defense-${decision.id}-${option.id}`,
    node: `防御 · ${decision.title}`,
    action: '作出一项处置',
    choice: option.label,
    vector: option.vector,
    rationale: option.summary,
    effects: [
      ...(Object.keys(option.effects) as (keyof WorldState)[])
        .filter((key) => option.effects[key] !== 0)
        .map(
          (key) =>
            `${WORLD_LABEL[key]} ${option.effects[key] > 0 ? '+' : ''}${option.effects[key]} → ${next.world[key]}`,
        ),
      `消耗 ${option.cost} 应急资源`,
    ],
    evidenceIds: next.collectedEvidenceIds,
  });

  next = log(
    next,
    `${decision.title} · ${option.label}`,
    `${npc.name}：${option.aftermath}`,
    -option.cost,
  );

  return { state: next, ok: true, message: '' };
}

export function advanceDefense(state: VnState): VnResult {
  if (state.scene !== 'defense') return { state, ok: false, message: '当前不在防御阶段。' };
  if (!state.defenseFeedback) return { state, ok: false, message: '先作出一个处置。' };

  if (state.defenseIndex < state.defensePlan.length - 1) {
    return {
      state: { ...state, defenseIndex: state.defenseIndex + 1, defenseFeedback: null },
      ok: true,
      message: '',
    };
  }

  const withCascade = withCascadeEvent(state);
  const ending = judgeEnding(withCascade);
  const next = log(
    {
      ...withCascade,
      scene: 'complete',
      endingId: ending.id,
      defenseFeedback: null,
    },
    '临时结算',
    `本局结局：${ending.nameCn}。人格与结局分别依据真实行为记录计算。`,
  );
  return { state: next, ok: true, message: '' };
}

export function hasAllHotspots(state: VnState): boolean {
  return CASE_HOTSPOTS.every((item) => state.foundHotspotIds.includes(item.id));
}

export function getActiveNpc(state: VnState): NpcProfile | null {
  return state.activeNpcId ? NPC_BY_ID[state.activeNpcId] : null;
}

export function getActiveWitness(state: VnState): WitnessCase | null {
  return getWitnessCase(state.witnessId);
}

export function canEnterTestimony(state: VnState): boolean {
  return witnessReady(state).length > 0;
}

export function nextContradictionHint(state: VnState): string {
  return state.contradictions.length > 0
    ? `已确认 ${verifiedHypotheses(state.contradictions).length} 类风险，可进入模拟。`
    : '尚未确认矛盾，也可以低置信进入模拟。';
}

export const HYPOTHESIS_ORDER: HypothesisId[] = ['H1', 'H2', 'H3'];

export const NPC_PROFILES = NPC_LIST;

export const DEFENSE_DATA = DEFENSE_DECISIONS;

