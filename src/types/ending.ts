import type { WorldState } from './index';

export interface EndingConditions {
  minWorld?: Partial<WorldState>;
  maxWorld?: Partial<WorldState>;
  requiredEvents?: string[];
  anyEvents?: string[];
  forbiddenEvents?: string[];
  minCollectedEvidence?: number;
  requiredFlags?: string[];
  maxRepairEvents?: number;
  minVerifiedHypotheses?: number;
  minContradictions?: number;
}

export interface EndingConfig {
  id: string;
  order: number;
  nameCn: string;
  nameEn: string;
  code: string;
  themeColor: string;
  /** 数值越大越先判定；用于消解多个条件同时满足的歧义 */
  priority: number;
  summary: string;
  description: string;
  criteria: string;
  keySignals: string[];
  conditions: EndingConditions;
  fallback?: boolean;
}
