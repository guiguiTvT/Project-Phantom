import type { PersonalityState } from '@/types/personality';
import type { PersonalityVector, WorldState } from '@/types';

export type VnScene =
  | 'cover'
  | 'prologue'
  | 'investigation'
  | 'npc'
  | 'testimony'
  | 'simulation'
  | 'reversal'
  | 'defense'
  | 'complete';

export type Act = 'redteam' | 'student';

export type Expression = 'neutral' | 'happy' | 'confused' | 'nervous';

export type NpcId = 'linxia' | 'zhouning' | 'chen' | 'xuyan' | 'gu';

export type HypothesisId = 'H1' | 'H2' | 'H3';

export type VnEvidenceId = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8';

export type Verification = 'verified' | 'pending' | 'stale';

export interface VnEvidence {
  id: VnEvidenceId;
  title: string;
  source: string;
  time: string;
  verification: Verification;
  description: string;
  image?: string;
  /** 本局是否有路径可以拿到它 */
  collectible: boolean;
}

export type HotspotIcon = 'phone' | 'laptop' | 'board';

export interface Hotspot {
  id: string;
  evidenceId: VnEvidenceId;
  label: string;
  hint: string;
  icon: HotspotIcon;
  x: number;
  y: number;
}

export interface DialogueLine {
  id: string;
  emotion: Expression;
  text: string;
}

export interface FollowUp {
  cost: number;
  emotion: Expression;
  text: string;
  hint: string;
}

export interface NpcVerify {
  cost: number;
  label: string;
  answer: string;
  emotion: Expression;
  hint: string;
  evidenceId?: VnEvidenceId;
}

export interface NpcProfile {
  id: NpcId;
  name: string;
  role: string;
  short: string;
  bg: string;
  lines: DialogueLine[];
  verify: NpcVerify;
  grantOnComplete?: VnEvidenceId;
  witness?: boolean;
}

export interface TestimonyStatement {
  id: string;
  sceneNo: string;
  emotion: Expression;
  text: string;
  followUp: FollowUp;
  hypothesis?: HypothesisId;
}

export interface WitnessCase {
  npcId: NpcId;
  title: string;
  intro: string;
  statements: TestimonyStatement[];
}

export type PresentationResult = 'contradiction' | 'supports' | 'insufficient' | 'irrelevant';

export interface PresentationEvaluation {
  result: PresentationResult;
  feedback: string;
  emotion: Expression;
  hypothesis?: HypothesisId;
  alreadyFound?: boolean;
}

export interface PresentationRule {
  statementId: string;
  evidenceId: VnEvidenceId;
  result: PresentationResult;
  feedback: string;
  emotion: Expression;
  hypothesis?: HypothesisId;
}

export interface ContradictionRecord {
  hypothesis: HypothesisId;
  witnessId: NpcId;
  statementId: string;
  evidenceId: VnEvidenceId;
}

export interface HypothesisInfo {
  id: HypothesisId;
  title: string;
  short: string;
  detail: string;
  simulation: {
    nodes: string[];
    verified: string[];
    unverified: string[];
  };
}

export interface SimulationResult {
  hypothesisId: HypothesisId;
  verified: boolean;
  confidence: 'high' | 'low';
  apSpent: number;
  nodes: string[];
  summary: string;
  impact: string[];
  world: WorldState;
}

export interface DefenseNotification {
  from: string;
  text: string;
  time?: string;
}

export interface DefenseOption {
  id: string;
  label: string;
  summary: string;
  cost: number;
  effects: WorldState;
  vector: PersonalityVector;
  feedback: string;
  aftermath: string;
  events?: string[];
  flags?: string[];
}

export interface DefenseDecision {
  id: string;
  kicker: string;
  title: string;
  bg: string;
  npcId: NpcId;
  notification: DefenseNotification;
  description: string;
  options: DefenseOption[];
}

export interface DefenseFeedback {
  decisionId: string;
  optionId: string;
}

export interface DefenseChoiceRecord {
  decisionId: string;
  optionId: string;
  effects: WorldState;
}

export interface PersonaEvent {
  id: string;
  node: string;
  action: string;
  choice: string;
  evidenceIds: VnEvidenceId[];
  vector: PersonalityVector;
  rationale: string;
  effects: string[];
  at: string;
}

export interface ReversalFrame {
  id: string;
  kicker: string;
  time: string;
  title: string;
  body: string;
  bg: string;
  notification?: DefenseNotification;
  permission: 'active' | 'lost' | null;
}

export interface PersonaDimReading {
  dim: 'evidence' | 'caution' | 'protection' | 'system';
  letter: string;
  normalized: number;
  count: number;
  insufficient: boolean;
  mixed: boolean;
}

export interface PersonaReading {
  code: string;
  nameCn: string;
  nameEn: string;
  tagline: string;
  description: string;
  advice: string[];
  dims: PersonaDimReading[];
  insufficientDims: string[];
  mixedDims: string[];
  sampleCount: number;
}

export interface VnLogEntry {
  id: string;
  at: string;
  label: string;
  detail: string;
  apDelta: number;
}

export interface VnState {
  scene: VnScene;
  ap: number;
  maxAp: number;
  world: WorldState;
  redteamAccess: boolean;
  collectedEvidenceIds: VnEvidenceId[];
  foundHotspotIds: string[];
  npcDoneIds: NpcId[];
  npcVerifiedIds: NpcId[];
  activeNpcId: NpcId | null;
  npcLineIndex: number;
  npcReply: { emotion: Expression; text: string } | null;
  testimonyEntered: boolean;
  witnessId: NpcId | null;
  testimonyIndex: number;
  askedStatementIds: string[];
  statementReply: string | null;
  presentations: { statementId: string; evidenceId: VnEvidenceId; result: PresentationResult }[];
  contradictions: ContradictionRecord[];
  simulationHypothesis: HypothesisId | null;
  simulationResult: SimulationResult | null;
  reversalIndex: number;
  defensePlan: string[];
  defenseIndex: number;
  defenseChoices: DefenseChoiceRecord[];
  defenseFeedback: DefenseFeedback | null;
  endingId: string | null;
  flags: Record<string, boolean>;
  events: string[];
  personaEvents: PersonaEvent[];
  personality: PersonalityState;
  log: VnLogEntry[];
  turn: number;
}

export interface VnResult {
  state: VnState;
  ok: boolean;
  message: string;
  evaluation?: PresentationEvaluation;
  simulation?: SimulationResult;
  grantedEvidenceId?: VnEvidenceId;
}
