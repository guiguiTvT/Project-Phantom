import { PERSONALITIES, PERSONALITY_BY_CODE } from '@/data/personalities';
import { accumulatePersonality, normalizeDimension } from '@/engine/PersonalityEngine';
import type { PersonalityCode } from '@/types/personality';
import type {
  PersonaEvent,
  PersonaReading,
  VnEvidenceId,
  VnState,
} from '../types';
import type { PersonalityVector } from '@/types';

const DIMS = [
  { dim: 'evidence', positive: 'E', negative: 'I' },
  { dim: 'caution', positive: 'C', negative: 'A' },
  { dim: 'protection', positive: 'P', negative: 'F' },
  { dim: 'system', positive: 'S', negative: 'R' },
] as const;

interface PersonaInput {
  id: string;
  node: string;
  action: string;
  choice: string;
  vector: PersonalityVector;
  rationale: string;
  effects?: string[];
  evidenceIds?: VnEvidenceId[];
}

function now(): string {
  return new Date().toISOString();
}

export function recordPersona(state: VnState, input: PersonaInput): VnState {
  if (state.personaEvents.some((item) => item.id === input.id)) return state;
  const event: PersonaEvent = {
    id: input.id,
    node: input.node,
    action: input.action,
    choice: input.choice,
    evidenceIds: [...(input.evidenceIds ?? state.collectedEvidenceIds)],
    vector: input.vector,
    rationale: input.rationale,
    effects: input.effects ?? [],
    at: now(),
  };
  return {
    ...state,
    personaEvents: [...state.personaEvents, event],
    personality: accumulatePersonality(state.personality, input.vector),
  };
}

export function readPersona(state: VnState): PersonaReading {
  const dims = DIMS.map(({ dim, positive, negative }) => {
    const accumulator = state.personality[dim];
    const normalized = normalizeDimension(accumulator);
    const insufficient = accumulator.count < 3;
    const mixed = !insufficient && Math.abs(normalized) < 0.15;
    const letter = normalized >= 0 ? positive : negative;
    return { dim, letter, normalized, count: accumulator.count, insufficient, mixed };
  });

  const code = dims.map((item) => item.letter).join('') as PersonalityCode;
  const config = PERSONALITY_BY_CODE[code] ?? PERSONALITIES[0];
  return {
    code,
    nameCn: config.nameCn,
    nameEn: config.nameEn,
    tagline: config.tagline,
    description: config.description,
    advice: config.advice,
    dims,
    insufficientDims: dims.filter((item) => item.insufficient).map((item) => item.dim),
    mixedDims: dims.filter((item) => item.mixed).map((item) => item.dim),
    sampleCount: state.personaEvents.length,
  };
}

function evidenceScore(event: PersonaEvent): number {
  if (event.id.startsWith('defense-')) return 3;
  if (event.id.startsWith('testimony-contradiction-')) return 3;
  if (event.id.startsWith('simulation-')) return 2;
  if (event.id.startsWith('npc-verify-')) return 1;
  return 0;
}

function evidenceCategory(event: PersonaEvent): string {
  if (event.id.startsWith('defense-')) return 'defense';
  if (event.id.startsWith('testimony-contradiction-')) return 'contradiction';
  if (event.id.startsWith('testimony-')) return 'testimony';
  if (event.id.startsWith('simulation-')) return 'simulation';
  if (event.id.startsWith('npc-verify-')) return 'npc';
  if (event.id.startsWith('hotspot-')) return 'hotspot';
  return 'other';
}

export function selectPersonaEvidence(events: PersonaEvent[], limit = 3): PersonaEvent[] {
  const ranked = events
    .map((event, index) => ({ event, index, score: evidenceScore(event) }))
    .sort((a, b) => b.score - a.score || b.index - a.index);
  const picked: PersonaEvent[] = [];
  const nodes = new Set<string>();
  const categories = new Set<string>();
  for (const item of ranked) {
    if (picked.length >= limit) break;
    const category = evidenceCategory(item.event);
    if (nodes.has(item.event.node) || categories.has(category)) continue;
    nodes.add(item.event.node);
    categories.add(category);
    picked.push(item.event);
  }
  for (const item of ranked) {
    if (picked.length >= limit) break;
    if (!picked.includes(item.event)) picked.push(item.event);
  }
  return picked;
}

export function formatPersonaDims(reading: PersonaReading): string {
  return reading.dims
    .map((item) => `${item.letter}${item.insufficient ? '?' : ''}`)
    .join(' · ');
}
