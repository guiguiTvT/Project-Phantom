import type { StoryLine } from '../chapter/NovelScene';

export const CASE_IDS = ['festival', 'job', 'camera', 'voice'] as const;
export type CaseId = typeof CASE_IDS[number];
export type Axis = 'EI' | 'CA' | 'PF' | 'SR';
export type Letter = 'E' | 'I' | 'C' | 'A' | 'P' | 'F' | 'S' | 'R';
export type Disposition = 'resolve' | 'pause-repaired' | 'isolate' | 'pending';
export type FollowAction = 'repair' | 'coordinate' | 'restore' | 'rule' | 'wait';
export type Stage = 'opening' | 'case' | 'switch' | 'followup' | 'ending';

export interface Material {
  title: string;
  source: string;
  lines: readonly string[];
  audio?: string;
}

interface StepBase {
  id: string;
  goal: string;
  line: StoryLine;
  button: string;
}

export interface Token { id: string; label: string; detail?: string }
export type Puzzle = {
  kind: 'link' | 'order'; tokens: readonly Token[]; answer: readonly string[];
} | {
  kind: 'group'; tokens: readonly Token[]; groups: readonly Token[]; answer: Readonly<Record<string, string>>;
};

export interface ObservationChoice {
  letter: Letter;
  label: string;
  action: string;
  material?: string;
  optionalPoint?: boolean;
}

export type Step = StepBase & ({ kind: 'scene' }
  | { kind: 'read'; cards: readonly string[] }
  | { kind: 'observe'; axis: Axis; choices: readonly [ObservationChoice, ObservationChoice] }
  | { kind: 'puzzle'; puzzle: Puzzle; instruction: string; clue: string; conclusion: string }
  | { kind: 'verify'; record: string; cost: 0 | 1; confirmation: string }
  | { kind: 'simulation'; scenes: readonly StoryLine[] }
  | { kind: 'assistance' }
  | { kind: 'contact' }
  | { kind: 'resolve' });

export type PuzzleStep = Extract<Step, { kind: 'puzzle' }>;
export type Attempt = readonly string[] | Readonly<Record<string, string>>;

export interface CaseDefinition {
  id: CaseId;
  number: 1 | 2 | 3 | 4;
  title: string;
  place: string;
  time: string;
  background: string;
  files: Readonly<Record<string, Material>>;
  steps: readonly Step[];
  handler: string;
  ruleOwner: string;
  result: {
    repaired: string;
    isolated: string;
    pending: string;
    normal: string;
    cooperation: string;
    rule: string;
    lesson: string;
  };
}
