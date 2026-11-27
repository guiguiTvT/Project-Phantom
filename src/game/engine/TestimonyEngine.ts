import {
  FALLBACK_PRESENTATION,
  PRESENTATION_RULES,
  STATEMENTS,
  STATEMENT_BY_ID,
  WITNESS_CASES,
  WITNESS_BY_NPC,
} from '../data/story';
import type {
  NpcId,
  PresentationEvaluation,
  TestimonyStatement,
  VnEvidenceId,
  WitnessCase,
} from '../types';

export function getStatement(statementId: string): TestimonyStatement | null {
  return STATEMENT_BY_ID[statementId] ?? null;
}

export function getWitnessCase(npcId: NpcId | null): WitnessCase | null {
  if (!npcId) return null;
  return WITNESS_BY_NPC[npcId] ?? null;
}

export function statementsFor(npcId: NpcId | null): TestimonyStatement[] {
  return getWitnessCase(npcId)?.statements ?? [];
}

export function witnessIds(): NpcId[] {
  return WITNESS_CASES.map((item) => item.npcId);
}

export function statementById(statementId: string): TestimonyStatement | null {
  return STATEMENTS.find((item) => item.id === statementId) ?? null;
}

/**
 * 确定性的证据-陈述判定：只有数据表里配置的组合才会产生支持或矛盾，
 * 其余组合一律返回中性反馈，不能靠反复尝试刷出结果。
 */
export function evaluatePresentation(
  statementId: string,
  evidenceId: VnEvidenceId,
): PresentationEvaluation {
  const rule = PRESENTATION_RULES.find(
    (item) => item.statementId === statementId && item.evidenceId === evidenceId,
  );
  if (rule) {
    return {
      result: rule.result,
      feedback: rule.feedback,
      emotion: rule.emotion,
      hypothesis: rule.hypothesis,
    };
  }
  return { ...FALLBACK_PRESENTATION };
}

export function contradictionFor(statementId: string): VnEvidenceId | null {
  const rule = PRESENTATION_RULES.find(
    (item) => item.statementId === statementId && item.result === 'contradiction',
  );
  return rule?.evidenceId ?? null;
}

export function contradictionHypothesis(
  statementId: string,
  evidenceId: VnEvidenceId,
): TestimonyStatement['hypothesis'] | undefined {
  return (
    PRESENTATION_RULES.find(
      (item) =>
        item.statementId === statementId &&
        item.evidenceId === evidenceId &&
        item.result === 'contradiction',
    )?.hypothesis ?? undefined
  );
}
