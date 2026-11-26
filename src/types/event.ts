import type { GamePhase, NpcMood, WorldState } from './index';

export interface EventWorldEffects {
  security?: number;
  operation?: number;
  relations?: number;
  repair?: number;
}

export interface EventConditions {
  phases?: GamePhase[];
  minTurn?: number;
  minActionPointsSpent?: number;
  minCollectedEvidence?: number;
  requiredEvidenceIds?: string[];
  anyEvidenceFromGroup?: string[];
  requiredEventIds?: string[];
  requiredFlags?: string[];
  minWorld?: Partial<WorldState>;
  maxWorld?: Partial<WorldState>;
  manualOnly?: boolean;
}

export interface EventNpcEffect {
  npcId: string;
  mood?: NpcMood;
  memory?: string;
}

export interface EventDefinition {
  eventId: string;
  title: string;
  en: string;
  description: string;
  /** 事件在日志 / 通知中的一行摘要 */
  logLine: string;
  phase: GamePhase[];
  triggerConditions: EventConditions;
  affectedNPCs: string[];
  npcEffects: EventNpcEffect[];
  stateEffects: EventWorldEffects;
  setFlags?: string[];
  followUpEvents: string[];
  delayTurns: number;
  onceOnly: boolean;
  visibility: 'redteam' | 'student' | 'all';
  severity: 'info' | 'warning' | 'danger';
}
