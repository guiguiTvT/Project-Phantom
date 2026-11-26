import type { EndingConfig } from './ending';
import type { EventDefinition } from './event';
import type { PersonalityState } from './personality';

export type Screen =
  | 'authorization'
  | 'briefing'
  | 'os'
  /** @deprecated Phase 1 重构前的页面，保留类型以兼容尚未删除的旧组件 */
  | 'boot'
  | 'identity';

/** ACT I 红队 / 反转过渡 / ACT II 防御 / 结算 */
export type GamePhase = 'redteam' | 'reversal' | 'defense' | 'result';

export type OSView = 'feed' | 'intel' | 'graph' | 'simulation' | 'defense';

export type CollegeId = 'computing' | 'media' | 'humanities' | 'science';

export interface College {
  id: CollegeId;
  name: string;
  en: string;
  hint: string;
  glyph: string;
}

export interface PlayerProfile {
  callsign: string;
  avatarId: string;
  college: CollegeId;
  interests: string[];
  clearance: string;
}

export type FeedChannel = 'club' | 'notice' | 'life' | 'study' | 'treehole' | 'system';

export interface ChannelMeta {
  id: FeedChannel;
  label: string;
  en: string;
}

export type AuthorRole = 'student' | 'teacher' | 'staff' | 'system' | 'anonymous';

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: AuthorRole;
  channel: FeedChannel;
  publishedAt: string;
  content: string;
  tags: string[];
  pinned?: boolean;
  evidenceId?: string;
}

export type EvidenceKind = 'screenshot' | 'document' | 'log' | 'chat' | 'photo' | 'record';

export type EvidenceSourceType = 'official' | 'personal' | 'system' | 'anonymous' | 'offline';

export type VerificationStatus = 'cross-checked' | 'pending' | 'stale' | 'disputed';

export type EvidenceAccessLevel = 'public' | 'redteam';

export interface Evidence {
  id: string;
  title: string;
  kind: EvidenceKind;
  sourceLabel: string;
  sourceType: EvidenceSourceType;
  publishedAt: string;
  summary: string;
  detail: string;
  verification: VerificationStatus;
  accessLevel: EvidenceAccessLevel;
  contradictionGroupId?: string;
  relatedPostIds: string[];
  relatedNpcIds: string[];
  tags: string[];
}

export interface CaseEvidence extends Evidence {
  /** 展品编号，例如 E2 / E4 / E7 */
  exhibitCode: string;
  /** 一句话钩子，帮助玩家快速判断为什么要看它 */
  hook: string;
  /** 这条材料能回答的关键问题 */
  keyQuestion: string;
}

export type HypothesisId = 'impersonation' | 'platform-fault' | 'deadline-typo';

export interface InvestigationState {
  viewedEvidenceIds: string[];
  pinnedEvidenceIds: string[];
  contactedNpcIds: string[];
  hintIds: string[];
  hypothesisId: HypothesisId | null;
  completed: boolean;
  completedAt: string | null;
}

export interface ContradictionGroup {
  id: string;
  title: string;
  question: string;
  postIds: string[];
  evidenceIds: string[];
}

export interface NpcRelationship {
  npcId: string;
  label: string;
  trust: number;
}

export type NpcMood = 'steady' | 'busy' | 'worried' | 'guarded' | 'warm';

export interface ChatMessage {
  id: string;
  role: 'npc' | 'player' | 'system';
  content: string;
  at: string;
  intent?: string;
  emotion?: string;
}

export interface Npc {
  id: string;
  name: string;
  codename: string;
  role: string;
  org: string;
  avatarId: string;
  personality: string[];
  bio: string;
  knownFacts: string[];
  memory: string[];
  relationships: NpcRelationship[];
  currentTask: string;
  currentMood: NpcMood;
  conversationHistory: ChatMessage[];
  permissions: string[];
  channels: string[];
  voice: string;
  accent: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: 'strong' | 'normal' | 'faint';
}

export interface WorldState {
  security: number;
  operation: number;
  relations: number;
  repair: number;
}

export interface PersonalityVector {
  /** 正 = 证据型 E，负 = 直觉型 I */
  evidence: number;
  /** 正 = 谨慎型 C，负 = 主动型 A */
  caution: number;
  /** 正 = 保护型 P，负 = 运行型 F */
  protection: number;
  /** 正 = 系统型 S，负 = 关系型 R */
  system: number;
}

export type ActionCategory =
  | 'observe'
  | 'collect'
  | 'inquiry'
  | 'verify'
  | 'simulate'
  | 'report'
  | 'coordinate'
  | 'protect'
  | 'restore';

export type ActionPhase = 'redteam' | 'defense' | 'both';

export interface ActionDefinition {
  id: string;
  label: string;
  en: string;
  description: string;
  phase: ActionPhase;
  cost: number;
  category: ActionCategory;
  intent: string;
  vector: PersonalityVector;
}

export interface GameLogEntry {
  id: string;
  turn: number;
  at: string;
  phase: GamePhase;
  actionId: string;
  actionLabel: string;
  detail: string;
  apDelta: number;
  tags: string[];
  vector?: PersonalityVector;
}

export interface EvidenceLink {
  id: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  note: string;
  createdAt: string;
}

export interface NpcRuntimeState {
  npcId: string;
  mood: NpcMood;
  memory: string[];
  conversationHistory: ChatMessage[];
  met: boolean;
  lastContactAt?: string;
}

export interface WorldSnapshot {
  id: string;
  label: string;
  createdAt: string;
  phase: GamePhase;
  turn: number;
  state: GameState;
}

export interface GameState {
  version: number;
  screen: Screen;
  phase: GamePhase;
  player: PlayerProfile | null;
  actionPoints: number;
  maxActionPoints: number;
  collectedEvidenceIds: string[];
  evidenceLinks: EvidenceLink[];
  npcStates: Record<string, NpcRuntimeState>;
  world: WorldState;
  triggeredEventIds: string[];
  log: GameLogEntry[];
  personality: PersonalityState;
  snapshots: WorldSnapshot[];
  seed: number;
  endingId: string | null;
  investigation: InvestigationState;
  flags: Record<string, boolean>;
  startedAt: string | null;
  updatedAt: string | null;
  turn: number;
}

export interface DemoNotice {
  id: string;
  tone: 'info' | 'warning' | 'danger';
  title: string;
  body: string;
  at: string;
}

export type { EndingConfig, EventDefinition };
