import { ACTION_BY_ID } from '@/data/actions';
import {
  CASE_EVIDENCE_BY_ID,
  CONTACT_HINTS,
  HYPOTHESES,
  isHypothesisReady,
} from '@/data/investigation';
import { NPC_BY_ID } from '@/data/npcs';
import type { ChatMessage, GameState } from '@/types';
import {
  appendLog,
  canSpend,
  spendActionPoints,
} from './GameEngine';
import { accumulatePersonality } from './PersonalityEngine';

export interface InvestigationResult {
  state: GameState;
  ok: boolean;
  message: string;
}

function withInvestigation(
  state: GameState,
  patch: Partial<GameState['investigation']>,
): GameState {
  return {
    ...state,
    investigation: {
      ...state.investigation,
      ...patch,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function viewCaseEvidence(state: GameState, evidenceId: string): InvestigationResult {
  const evidence = CASE_EVIDENCE_BY_ID[evidenceId];
  if (!evidence) {
    return { state, ok: false, message: '没有找到这条材料。' };
  }
  if (state.investigation.completed) {
    return { state, ok: true, message: '调查阶段已经完成，可以继续回顾材料。' };
  }
  if (state.investigation.viewedEvidenceIds.includes(evidenceId)) {
    return { state, ok: true, message: '这条材料已经看过了。' };
  }

  return {
    state: withInvestigation(state, {
      viewedEvidenceIds: [...state.investigation.viewedEvidenceIds, evidenceId],
    }),
    ok: true,
    message: `已阅读 ${evidence.exhibitCode}。`,
  };
}

export function pinCaseEvidence(state: GameState, evidenceId: string): InvestigationResult {
  const evidence = CASE_EVIDENCE_BY_ID[evidenceId];
  if (!evidence) {
    return { state, ok: false, message: '没有找到这条材料。' };
  }
  if (state.investigation.pinnedEvidenceIds.includes(evidenceId)) {
    return { state, ok: false, message: '这条材料已经在情报板上。' };
  }
  if (state.investigation.pinnedEvidenceIds.length >= 3) {
    return { state, ok: false, message: '情报板已经放满三条线索了。' };
  }

  const action = ACTION_BY_ID.collect_evidence;
  let next = withInvestigation(state, {
    pinnedEvidenceIds: [...state.investigation.pinnedEvidenceIds, evidenceId],
  });
  next = {
    ...next,
    personality: accumulatePersonality(next.personality, action.vector),
    turn: next.turn + 1,
  };
  next = appendLog(next, {
    phase: state.phase,
    actionId: 'pin_evidence',
    actionLabel: '放入情报板',
    detail: `将 ${evidence.exhibitCode}「${evidence.title}」放到情报板。来源：${evidence.sourceLabel}。`,
    apDelta: 0,
    tags: ['情报板', ...evidence.tags.slice(0, 2)],
    vector: action.vector,
  });

  return { state: next, ok: true, message: `${evidence.exhibitCode} 已放入情报板。` };
}

export function contactCaseNpc(state: GameState, npcId: string): InvestigationResult {
  const contact = CONTACT_HINTS[npcId];
  const npc = NPC_BY_ID[npcId];
  if (!contact || !npc) {
    return { state, ok: false, message: '现在还不能联系这个人。' };
  }
  if (state.investigation.contactedNpcIds.includes(npcId)) {
    return { state, ok: false, message: '已经联系过了，先看看她给的提示。' };
  }
  if (!canSpend(state, contact.cost)) {
    return { state, ok: false, message: '行动点不足，先整理已有线索。' };
  }

  const now = new Date().toISOString();
  const messages: ChatMessage[] = contact.messages.map((message, index) => ({
    id: `chat-${npcId}-${state.turn + 1}-${index}`,
    role: message.role,
    content: message.content,
    at: now,
  }));
  const action = ACTION_BY_ID.query_npc;
  let next = spendActionPoints(state, contact.cost);
  next = withInvestigation(next, {
    contactedNpcIds: [...state.investigation.contactedNpcIds, npcId],
    hintIds: [...state.investigation.hintIds, contact.hintId],
  });
  const runtime = next.npcStates[npcId];
  next = {
    ...next,
    npcStates: {
      ...next.npcStates,
      [npcId]: {
        npcId,
        mood: runtime?.mood ?? npc.currentMood,
        memory: [...(runtime?.memory ?? npc.memory), contact.hintBody],
        conversationHistory: [...(runtime?.conversationHistory ?? []), ...messages],
        met: true,
        lastContactAt: now,
      },
    },
    personality: accumulatePersonality(next.personality, action.vector),
    turn: next.turn + 1,
  };
  next = appendLog(next, {
    phase: state.phase,
    actionId: 'contact_npc',
    actionLabel: `联系${npc.name}`,
    detail: contact.hintBody,
    apDelta: -contact.cost,
    tags: ['通讯', '线索'],
    vector: action.vector,
  });

  return {
    state: next,
    ok: true,
    message: `${npc.name}给了你一条可用的提示。`,
  };
}

export function submitCaseHypothesis(
  state: GameState,
  hypothesisId: string,
): InvestigationResult {
  const hypothesis = HYPOTHESES.find((item) => item.id === hypothesisId);
  if (!hypothesis) {
    return { state, ok: false, message: '没有找到这条假设。' };
  }
  if (state.investigation.completed) {
    return { state, ok: false, message: '调查阶段已经完成。' };
  }
  if (
    !isHypothesisReady(
      state.investigation.viewedEvidenceIds,
      state.investigation.pinnedEvidenceIds,
      state.investigation.contactedNpcIds,
    )
  ) {
    return {
      state,
      ok: false,
      message: '还差一点：先看 E2、联系周宁，再把至少两条线索放进情报板。',
    };
  }
  if (!hypothesis.correct) {
    return { state, ok: false, message: hypothesis.feedback };
  }

  const now = new Date().toISOString();
  const action = ACTION_BY_ID.submit_report;
  let next = withInvestigation(state, {
    hypothesisId: hypothesis.id,
    completed: true,
    completedAt: now,
  });
  next = {
    ...next,
    personality: accumulatePersonality(next.personality, action.vector),
    turn: next.turn + 1,
    flags: { ...next.flags, investigation_complete: true },
  };
  next = appendLog(next, {
    phase: state.phase,
    actionId: 'submit_hypothesis',
    actionLabel: '形成初步假设',
    detail: `记录假设：${hypothesis.title}。调查阶段完成，等待进入验证阶段。`,
    apDelta: 0,
    tags: ['假设', '调查完成'],
    vector: action.vector,
  });

  return {
    state: next,
    ok: true,
    message: '调查阶段完成。你的假设已记录，等待进入验证阶段。',
  };
}
