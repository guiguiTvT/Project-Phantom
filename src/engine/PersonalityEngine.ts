import { NPCS } from '@/data/npcs';
import type { DimId, PersonalityState } from '@/types/personality';
import type { PersonalityVector } from '@/types';

export const PERSONALITY_DIMS: DimId[] = ['evidence', 'caution', 'protection', 'system'];

export function createEmptyPersonality(): PersonalityState {
  return {
    evidence: { score: 0, count: 0 },
    caution: { score: 0, count: 0 },
    protection: { score: 0, count: 0 },
    system: { score: 0, count: 0 },
  };
}

export function accumulatePersonality(
  state: PersonalityState,
  vector: PersonalityVector,
): PersonalityState {
  const next: PersonalityState = {
    evidence: { ...state.evidence },
    caution: { ...state.caution },
    protection: { ...state.protection },
    system: { ...state.system },
  };

  for (const dim of PERSONALITY_DIMS) {
    const weight = vector[dim];
    if (weight !== 0) {
      next[dim].score += weight;
      next[dim].count += 1;
    }
  }

  return next;
}

/** 单维度归一化到 [-1, 1]；样本不足时返回 0，由上层标记「依据不足」。 */
export function normalizeDimension(dim: { score: number; count: number }, minSamples = 3): number {
  if (dim.count < minSamples) return 0;
  return Math.max(-1, Math.min(1, dim.score / (dim.count * 2)));
}

export function createNpcRuntimeStates() {
  return Object.fromEntries(
    NPCS.map((npc) => [
      npc.id,
      {
        npcId: npc.id,
        mood: npc.currentMood,
        memory: [...npc.memory],
        conversationHistory: [],
        met: false,
      },
    ]),
  );
}
