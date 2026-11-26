import { ACTION_BY_ID } from '@/data/actions';
import { EVIDENCE_BY_ID } from '@/data/evidence';
import {
  INITIAL_AP_REDTEAM,
  INITIAL_WORLD,
  SAVE_VERSION,
} from '@/data/gameConfig';
import { NPCS } from '@/data/npcs';
import type {
  GameLogEntry,
  GameState,
  InvestigationState,
  PlayerProfile,
  WorldState,
} from '@/types';
import {
  accumulatePersonality,
  createEmptyPersonality,
  createNpcRuntimeStates,
} from './PersonalityEngine';

export interface ActionResult {
  state: GameState;
  ok: boolean;
  message: string;
}

export function createEmptyInvestigation(): InvestigationState {
  return {
    viewedEvidenceIds: [],
    pinnedEvidenceIds: [],
    contactedNpcIds: [],
    hintIds: [],
    hypothesisId: null,
    completed: false,
    completedAt: null,
  };
}

export function createBlankState(): GameState {
  return {
    version: SAVE_VERSION,
    screen: 'authorization',
    phase: 'redteam',
    player: null,
    actionPoints: INITIAL_AP_REDTEAM,
    maxActionPoints: INITIAL_AP_REDTEAM,
    collectedEvidenceIds: [],
    evidenceLinks: [],
    npcStates: {},
    world: { ...INITIAL_WORLD },
    triggeredEventIds: [],
    log: [],
    personality: createEmptyPersonality(),
    snapshots: [],
    seed: 0,
    endingId: null,
    investigation: createEmptyInvestigation(),
    flags: {},
    startedAt: null,
    updatedAt: null,
    turn: 0,
  };
}

export function createInitialGameState(profile: PlayerProfile, seed: number): GameState {
  const now = new Date().toISOString();
  const base: GameState = {
    ...createBlankState(),
    screen: 'os',
    phase: 'redteam',
    player: profile,
    npcStates: createNpcRuntimeStates(),
    world: { ...INITIAL_WORLD },
    seed,
    startedAt: now,
    updatedAt: now,
    turn: 0,
  };

  const entry: GameLogEntry = {
    id: 'log-1',
    turn: 0,
    at: now,
    phase: 'redteam',
    actionId: 'system_auth',
    actionLabel: '授权接入',
    detail: `虚拟身份「${profile.callsign}」已获得隔离环境调查权限。红队行动点 ${INITIAL_AP_REDTEAM}。`,
    apDelta: 0,
    tags: ['系统', '授权'],
  };

  return { ...base, log: [entry] };
}

function nextLogId(state: GameState): string {
  return `log-${state.log.length + 1}`;
}

export function appendLog(
  state: GameState,
  entry: Omit<GameLogEntry, 'id' | 'turn' | 'at'> & { at?: string },
): GameState {
  const now = state.updatedAt ?? new Date().toISOString();
  const logEntry: GameLogEntry = {
    ...entry,
    id: nextLogId(state),
    turn: state.turn,
    at: entry.at ?? now,
  };
  return {
    ...state,
    log: [...state.log, logEntry],
    updatedAt: new Date().toISOString(),
  };
}

export function canSpend(state: GameState, cost: number): boolean {
  return cost <= 0 || state.actionPoints >= cost;
}

/** 行动点只能通过该守卫扣减，任何路径都不会出现负数。 */
export function spendActionPoints(state: GameState, cost: number): GameState {
  if (cost <= 0) return state;
  return {
    ...state,
    actionPoints: Math.max(0, state.actionPoints - cost),
    updatedAt: new Date().toISOString(),
  };
}

export function collectEvidence(state: GameState, evidenceId: string): ActionResult {
  const evidence = EVIDENCE_BY_ID[evidenceId];
  if (!evidence) {
    return { state, ok: false, message: '未找到该材料。' };
  }
  if (state.phase === 'defense' && evidence.accessLevel === 'redteam') {
    return { state, ok: false, message: '当前学生权限无法访问该材料。' };
  }
  if (state.collectedEvidenceIds.includes(evidenceId)) {
    return { state, ok: false, message: '这条材料已经在证据库中。' };
  }
  if (!canSpend(state, 0)) {
    return { state, ok: false, message: '行动点不足。' };
  }

  const action = ACTION_BY_ID.collect_evidence;
  let next: GameState = {
    ...state,
    collectedEvidenceIds: [...state.collectedEvidenceIds, evidenceId],
    personality: accumulatePersonality(state.personality, action.vector),
    turn: state.turn + 1,
  };

  next = appendLog(next, {
    phase: state.phase,
    actionId: action.id,
    actionLabel: action.label,
    detail: `归档「${evidence.title}」。来源：${evidence.sourceLabel}。归档不代表核验完成。`,
    apDelta: 0,
    tags: ['证据', ...evidence.tags.slice(0, 2)],
    vector: action.vector,
  });

  return { state: next, ok: true, message: '已归档到情报板。' };
}

export function clampWorld(world: WorldState): WorldState {
  return {
    security: Math.max(0, Math.min(100, world.security)),
    operation: Math.max(0, Math.min(100, world.operation)),
    relations: Math.max(0, Math.min(100, world.relations)),
    repair: Math.max(0, Math.min(100, world.repair)),
  };
}

export function createNpcStateFromData(npcId: string) {
  const npc = NPCS.find((item) => item.id === npcId);
  if (!npc) return null;
  return {
    npcId: npc.id,
    mood: npc.currentMood,
    memory: [...npc.memory],
    conversationHistory: [],
    met: false,
  };
}
