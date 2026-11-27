import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  advanceDefense,
  advanceNpc,
  advanceReversal,
  askStatementFollowUp,
  backToInvestigation,
  backToNpcHub,
  chooseDefenseOption,
  collectHotspot,
  createVnState,
  enterInvestigation,
  enterNpcHub,
  enterReversal,
  enterSimulation,
  enterTestimony,
  presentTestimonyEvidence,
  runSimulation,
  selectHypothesis,
  selectNpc,
  selectWitness,
  setStatement,
  skipReversal,
  startCase,
  verifyNpc,
} from '../engine/StoryEngine';
import type {
  HypothesisId,
  NpcId,
  PresentationEvaluation,
  VnEvidenceId,
  VnResult,
  VnState,
} from '../types';

interface VnStore extends VnState {
  startCase: () => void;
  resetVn: () => void;
  enterInvestigation: () => VnResult;
  collectHotspot: (hotspotId: string) => VnResult & { evidenceId?: VnEvidenceId };
  enterNpcHub: () => VnResult;
  selectNpc: (npcId: NpcId) => VnResult;
  advanceNpc: () => VnResult & { grantedEvidenceId?: VnEvidenceId };
  verifyNpc: () => VnResult & { evidenceId?: VnEvidenceId };
  backToNpcHub: () => void;
  backToInvestigation: () => void;
  enterTestimony: () => VnResult;
  selectWitness: (npcId: NpcId) => VnResult;
  setStatement: (index: number) => void;
  askStatementFollowUp: () => VnResult;
  presentEvidence: (evidenceId: VnEvidenceId) => VnResult & { evaluation?: PresentationEvaluation };
  enterSimulation: () => VnResult;
  selectHypothesis: (hypothesisId: HypothesisId) => void;
  runSimulation: () => VnResult;
  enterReversal: () => VnResult;
  advanceReversal: () => VnResult;
  skipReversal: () => VnResult;
  chooseDefenseOption: (decisionId: string, optionId: string) => VnResult;
  advanceDefense: () => VnResult;
}

export const useVnStore = create<VnStore>()(
  persist(
    (set, get) => ({
      ...createVnState(),

      startCase: () => set(startCase(get())),
      resetVn: () => set(createVnState()),

      enterInvestigation: () => {
        const result = enterInvestigation(get());
        if (result.ok) set(result.state);
        return result;
      },
      collectHotspot: (hotspotId) => {
        const result = collectHotspot(get(), hotspotId);
        if (result.ok) set(result.state);
        return result;
      },
      enterNpcHub: () => {
        const result = enterNpcHub(get());
        if (result.ok) set(result.state);
        return result;
      },
      selectNpc: (npcId) => {
        const result = selectNpc(get(), npcId);
        if (result.ok) set(result.state);
        return result;
      },
      advanceNpc: () => {
        const result = advanceNpc(get());
        if (result.ok) set(result.state);
        return result;
      },
      verifyNpc: () => {
        const result = verifyNpc(get());
        if (result.ok) set(result.state);
        return result;
      },
      backToNpcHub: () => set(backToNpcHub(get())),
      backToInvestigation: () => set(backToInvestigation(get())),
      enterTestimony: () => {
        const result = enterTestimony(get());
        if (result.ok) set(result.state);
        return result;
      },
      selectWitness: (npcId) => {
        const result = selectWitness(get(), npcId);
        if (result.ok) set(result.state);
        return result;
      },
      setStatement: (index) => set(setStatement(get(), index)),
      askStatementFollowUp: () => {
        const result = askStatementFollowUp(get());
        if (result.ok) set(result.state);
        return result;
      },
      presentEvidence: (evidenceId) => {
        const result = presentTestimonyEvidence(get(), evidenceId);
        if (result.ok) set(result.state);
        return result;
      },
      enterSimulation: () => {
        const result = enterSimulation(get());
        if (result.ok) set(result.state);
        return result;
      },
      selectHypothesis: (hypothesisId) => set(selectHypothesis(get(), hypothesisId)),
      runSimulation: () => {
        const result = runSimulation(get());
        if (result.ok) set(result.state);
        return result;
      },
      enterReversal: () => {
        const result = enterReversal(get());
        if (result.ok) set(result.state);
        return result;
      },
      advanceReversal: () => {
        const result = advanceReversal(get());
        if (result.ok) set(result.state);
        return result;
      },
      skipReversal: () => {
        const result = skipReversal(get());
        if (result.ok) set(result.state);
        return result;
      },
      chooseDefenseOption: (decisionId, optionId) => {
        const result = chooseDefenseOption(get(), decisionId, optionId);
        if (result.ok) set(result.state);
        return result;
      },
      advanceDefense: () => {
        const result = advanceDefense(get());
        if (result.ok) set(result.state);
        return result;
      },
    }),
    {
      name: 'phantom.vn.run.v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: () => createVnState(),
    },
  ),
);
