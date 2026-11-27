import { ENDING_PRIORITY, ENDINGS } from '@/data/endings';
import type { EndingConditions, EndingConfig } from '@/types';
import { DEFENSE_DECISIONS, DEFENSE_PLAN_BY_HYPOTHESIS } from '../data/story';
import type {
  DefenseDecision,
  DefenseOption,
  HypothesisId,
  SimulationResult,
  VnState,
} from '../types';
import type { WorldState } from '@/types';

export const INITIAL_WORLD: WorldState = {
  security: 58,
  operation: 64,
  relations: 61,
  repair: 34,
};

export function clampWorld(world: WorldState): WorldState {
  const clamp = (value: number) => Math.max(0, Math.min(100, value));
  return {
    security: clamp(world.security),
    operation: clamp(world.operation),
    relations: clamp(world.relations),
    repair: clamp(world.repair),
  };
}

export function applyWorldDelta(world: WorldState, delta: WorldState): WorldState {
  return clampWorld({
    security: world.security + delta.security,
    operation: world.operation + delta.operation,
    relations: world.relations + delta.relations,
    repair: world.repair + delta.repair,
  });
}

const WORLD_LABELS: { key: keyof WorldState; label: string }[] = [
  { key: 'security', label: '安全' },
  { key: 'operation', label: '秩序' },
  { key: 'relations', label: '关系' },
  { key: 'repair', label: '修复' },
];

export function describeDelta(delta: WorldState): { label: string; direction: 'up' | 'down' | 'flat' }[] {
  return WORLD_LABELS.map(({ key, label }) => {
    const direction: 'up' | 'down' | 'flat' =
      delta[key] > 0 ? 'up' : delta[key] < 0 ? 'down' : 'flat';
    return { label, direction };
  }).filter((item) => item.direction !== 'flat');
}

export function worldReading(world: WorldState): Record<keyof WorldState, string> {
  const band = (value: number, cuts: [number, number, number], labels: [string, string, string, string]) => {
    if (value >= cuts[0]) return labels[0];
    if (value >= cuts[1]) return labels[1];
    if (value >= cuts[2]) return labels[2];
    return labels[3];
  };
  return {
    security: band(world.security, [70, 55, 40], ['稳固', '可控', '紧张', '失守']),
    operation: band(world.operation, [70, 55, 45], ['顺畅', '维持', '受限', '停摆']),
    relations: band(world.relations, [70, 55, 45], ['紧密', '平稳', '疏离', '紧张']),
    repair: band(world.repair, [65, 50, 35], ['成形', '推进', '有限', '停滞']),
  };
}

export function buildDefensePlan(simulation: SimulationResult | null): string[] {
  if (!simulation) return ['D1', 'D2', 'D4'];
  return [...DEFENSE_PLAN_BY_HYPOTHESIS[simulation.hypothesisId]];
}

export function getDefenseDecision(id: string): DefenseDecision | null {
  return DEFENSE_DECISIONS[id] ?? null;
}

export function getDefenseOption(decision: DefenseDecision, optionId: string): DefenseOption | null {
  return decision.options.find((item) => item.id === optionId) ?? null;
}

export function verifiedHypotheses(contradictions: { hypothesis: HypothesisId }[]): HypothesisId[] {
  return Array.from(new Set(contradictions.map((item) => item.hypothesis)));
}

function passesWorld(world: WorldState, conditions: Partial<WorldState> | undefined, mode: 'min' | 'max'): boolean {
  if (!conditions) return true;
  return (Object.keys(conditions) as (keyof WorldState)[]).every((key) => {
    const target = conditions[key];
    if (target === undefined) return true;
    return mode === 'min' ? world[key] >= target : world[key] <= target;
  });
}

function conditionMatches(config: EndingConditions, state: VnState): boolean {
  if (!passesWorld(state.world, config.minWorld, 'min')) return false;
  if (!passesWorld(state.world, config.maxWorld, 'max')) return false;
  if (config.requiredEvents?.some((event) => !state.events.includes(event))) return false;
  if (config.anyEvents && !config.anyEvents.some((event) => state.events.includes(event))) return false;
  if (config.forbiddenEvents?.some((event) => state.events.includes(event))) return false;
  if (config.minCollectedEvidence && state.collectedEvidenceIds.length < config.minCollectedEvidence) return false;
  if (config.requiredFlags?.some((flag) => !state.flags[flag])) return false;
  const verified = verifiedHypotheses(state.contradictions).length;
  if (config.minVerifiedHypotheses && verified < config.minVerifiedHypotheses) return false;
  if (config.minContradictions && state.contradictions.length < config.minContradictions) return false;
  return true;
}

export function withCascadeEvent(state: VnState): VnState {
  if (state.events.includes('ev_cascade')) return state;
  const backlog = state.events.includes('ev_unresolved_backlog');
  const cascade = state.world.security < 45 || (backlog && state.world.repair < 45);
  if (!cascade) return state;
  return { ...state, events: [...state.events, 'ev_cascade'] };
}

export function judgeEnding(state: VnState): EndingConfig {
  for (const ending of ENDING_PRIORITY) {
    if (ending.fallback) continue;
    if (conditionMatches(ending.conditions, state)) return ending;
  }
  return ENDINGS.find((item) => item.fallback) ?? ENDINGS[ENDINGS.length - 1];
}
