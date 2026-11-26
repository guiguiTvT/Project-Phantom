import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CLEARANCE_LABEL, SAVE_KEY, SAVE_VERSION } from '@/data/gameConfig';
import {
  collectEvidence as collectEvidenceRule,
  createBlankState,
  createEmptyInvestigation,
  createInitialGameState,
} from '@/engine/GameEngine';
import {
  contactCaseNpc,
  pinCaseEvidence,
  submitCaseHypothesis,
  viewCaseEvidence,
} from '@/engine/InvestigationEngine';
import { clearSave } from '@/services/saveService';
import type { GameState, PlayerProfile } from '@/types';
import { createSeed } from '@/utils/random';

const DEFAULT_PROFILE: PlayerProfile = {
  callsign: '折光',
  avatarId: 'sigil-05',
  college: 'computing',
  interests: ['网络安全', '咖啡'],
  clearance: CLEARANCE_LABEL,
};

interface StoryResult {
  ok: boolean;
  message: string;
}

interface GameStore extends GameState {
  beginBriefing: () => void;
  backToAuthorization: () => void;
  beginInvestigation: () => void;
  resumeInvestigation: () => void;
  restartCase: () => void;
  viewCaseEvidence: (evidenceId: string) => StoryResult;
  pinCaseEvidence: (evidenceId: string) => StoryResult;
  contactCaseNpc: (npcId: string) => StoryResult;
  submitCaseHypothesis: (hypothesisId: string) => StoryResult;

  /** 兼容旧页面与后续阶段 */
  startGame: (profile: PlayerProfile) => void;
  continueGame: () => void;
  backToBoot: () => void;
  goToIdentity: () => void;
  collectEvidence: (evidenceId: string) => { ok: boolean; message: string };
  resetGame: () => void;
}

function freshCase(screen: GameState['screen']): GameState {
  return {
    ...createInitialGameState(DEFAULT_PROFILE, createSeed()),
    screen,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createBlankState(),

      beginBriefing: () => {
        set({ screen: 'briefing' });
      },

      backToAuthorization: () => {
        set({ screen: 'authorization' });
      },

      beginInvestigation: () => {
        const current = get();
        if (!current.player || !current.startedAt) {
          set(freshCase('os'));
          return;
        }
        set({ screen: 'os' });
      },

      resumeInvestigation: () => {
        if (!get().player) {
          set({ screen: 'authorization' });
          return;
        }
        set({ screen: 'os' });
      },

      restartCase: () => {
        set(freshCase('briefing'));
      },

      viewCaseEvidence: (evidenceId) => {
        const result = viewCaseEvidence(get(), evidenceId);
        if (result.ok) set(result.state);
        return { ok: result.ok, message: result.message };
      },

      pinCaseEvidence: (evidenceId) => {
        const result = pinCaseEvidence(get(), evidenceId);
        if (result.ok) set(result.state);
        return { ok: result.ok, message: result.message };
      },

      contactCaseNpc: (npcId) => {
        const result = contactCaseNpc(get(), npcId);
        if (result.ok) set(result.state);
        return { ok: result.ok, message: result.message };
      },

      submitCaseHypothesis: (hypothesisId) => {
        const result = submitCaseHypothesis(get(), hypothesisId);
        if (result.ok) set(result.state);
        return { ok: result.ok, message: result.message };
      },

      startGame: (profile) => {
        const next = createInitialGameState(profile, createSeed());
        set({ ...next, screen: 'os' });
      },

      continueGame: () => {
        if (!get().player) {
          set({ screen: 'authorization' });
          return;
        }
        set({ screen: 'os' });
      },

      backToBoot: () => {
        set({ screen: 'authorization' });
      },

      goToIdentity: () => {
        set({ screen: 'identity' });
      },

      collectEvidence: (evidenceId) => {
        const current: GameState = { ...get() };
        const result = collectEvidenceRule(current, evidenceId);
        if (result.ok) {
          set(result.state);
        }
        return { ok: result.ok, message: result.message };
      },

      resetGame: () => {
        clearSave();
        set({ ...createBlankState(), screen: 'authorization' });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { screen: _screen, ...rest } = state;
        return rest;
      },
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<GameStore>;
        return {
          ...current,
          ...saved,
          investigation: {
            ...createEmptyInvestigation(),
            ...(saved.investigation ?? {}),
          },
          npcStates: saved.npcStates ?? {},
          flags: saved.flags ?? {},
          log: saved.log ?? [],
        };
      },
      migrate: (persisted) => persisted as GameStore,
    },
  ),
);

export function selectHasPlayer(state: GameStore): boolean {
  return Boolean(state.player);
}
