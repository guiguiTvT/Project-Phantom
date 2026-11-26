import { SAVE_KEY } from '@/data/gameConfig';
import type { GameState, GamePhase } from '@/types';

export interface SaveMeta {
  updatedAt: string | null;
  startedAt: string | null;
  callsign: string;
  phase: GamePhase;
  turn: number;
  evidenceCount: number;
  version: number;
  viewedCount: number;
  pinnedCount: number;
  contacted: boolean;
  completed: boolean;
  progress: number;
}

interface PersistPayload {
  state?: Partial<GameState>;
  version?: number;
}

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readSaveMeta(): SaveMeta | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistPayload;
    const state = parsed.state;
    if (!state?.player) return null;
    const investigation = state.investigation;
    const viewedCount = investigation?.viewedEvidenceIds?.length ?? 0;
    const pinnedCount = investigation?.pinnedEvidenceIds?.length ?? 0;
    const contacted = Boolean(investigation?.contactedNpcIds?.includes('npc_zhouning'));
    const completed = Boolean(investigation?.completed);
    const progress =
      (investigation?.viewedEvidenceIds?.includes('ke-02') ? 1 : 0) +
      (contacted ? 1 : 0) +
      (completed ? 1 : 0);
    return {
      updatedAt: state.updatedAt ?? null,
      startedAt: state.startedAt ?? null,
      callsign: state.player.callsign,
      phase: state.phase ?? 'redteam',
      turn: state.turn ?? 0,
      evidenceCount: state.collectedEvidenceIds?.length ?? 0,
      version: parsed.version ?? 0,
      viewedCount,
      pinnedCount,
      contacted,
      completed,
      progress,
    };
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return readSaveMeta() !== null;
}

export function clearSave(): void {
  safeStorage()?.removeItem(SAVE_KEY);
}
