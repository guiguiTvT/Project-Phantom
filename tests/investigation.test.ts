import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '@/engine/GameEngine';
import {
  contactCaseNpc,
  pinCaseEvidence,
  submitCaseHypothesis,
  viewCaseEvidence,
} from '@/engine/InvestigationEngine';
import { INITIAL_AP_REDTEAM } from '@/data/gameConfig';
import { getGuideStepIndex, isHypothesisReady } from '@/data/investigation';
import type { GameState, PlayerProfile } from '@/types';

const profile: PlayerProfile = {
  callsign: '灰雀',
  avatarId: 'sigil-01',
  college: 'computing',
  interests: ['网络安全', '播客'],
  clearance: 'PHANTOM-RT-07',
};

function freshState(seed = 11): GameState {
  return createInitialGameState(profile, seed);
}

function readyState(): GameState {
  let state = freshState();
  state = viewCaseEvidence(state, 'ke-02').state;
  state = contactCaseNpc(state, 'npc_zhouning').state;
  state = pinCaseEvidence(state, 'ke-02').state;
  state = pinCaseEvidence(state, 'ke-07').state;
  return state;
}

describe('材料阅读', () => {
  it('记录已读材料，重复阅读幂等且不改动状态', () => {
    const state = freshState();
    const first = viewCaseEvidence(state, 'ke-02');
    expect(first.ok).toBe(true);
    expect(first.state.investigation.viewedEvidenceIds).toEqual(['ke-02']);

    const second = viewCaseEvidence(first.state, 'ke-02');
    expect(second.ok).toBe(true);
    expect(second.state).toBe(first.state);
  });

  it('未知材料被拒绝', () => {
    const state = freshState();
    const result = viewCaseEvidence(state, 'ke-99');
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
  });
});

describe('情报板', () => {
  it('放入线索不消耗行动点，记录日志并推进回合', () => {
    const state = freshState();
    const result = pinCaseEvidence(state, 'ke-02');
    expect(result.ok).toBe(true);
    expect(result.state.investigation.pinnedEvidenceIds).toEqual(['ke-02']);
    expect(result.state.actionPoints).toBe(INITIAL_AP_REDTEAM);
    expect(result.state.turn).toBe(state.turn + 1);
    expect(result.state.log).toHaveLength(state.log.length + 1);
    expect(result.state.log.at(-1)?.actionId).toBe('pin_evidence');
  });

  it('重复放入同一条线索失败', () => {
    const pinned = pinCaseEvidence(freshState(), 'ke-02').state;
    const duplicate = pinCaseEvidence(pinned, 'ke-02');
    expect(duplicate.ok).toBe(false);
    expect(duplicate.state).toBe(pinned);
  });

  it('三张材料都可放入，未知线索被拒绝', () => {
    let state = freshState();
    for (const id of ['ke-02', 'ke-04', 'ke-07']) {
      const result = pinCaseEvidence(state, id);
      expect(result.ok).toBe(true);
      state = result.state;
    }
    expect(state.investigation.pinnedEvidenceIds).toHaveLength(3);

    const unknown = pinCaseEvidence(state, 'ke-99');
    expect(unknown.ok).toBe(false);
  });
});

describe('联系 NPC', () => {
  it('周宁消耗 1 行动点，写入对话、提示与日志', () => {
    const state = freshState();
    const result = contactCaseNpc(state, 'npc_zhouning');
    expect(result.ok).toBe(true);
    expect(result.state.actionPoints).toBe(INITIAL_AP_REDTEAM - 1);
    expect(result.state.investigation.contactedNpcIds).toEqual(['npc_zhouning']);
    expect(result.state.investigation.hintIds).toContain('hint-source-check');

    const runtime = result.state.npcStates.npc_zhouning;
    expect(runtime.conversationHistory).toHaveLength(3);
    expect(runtime.met).toBe(true);
    expect(result.state.log.at(-1)?.apDelta).toBe(-1);
  });

  it('同一人只能联系一次，重复联系不再扣点', () => {
    const contacted = contactCaseNpc(freshState(), 'npc_zhouning').state;
    const again = contactCaseNpc(contacted, 'npc_zhouning');
    expect(again.ok).toBe(false);
    expect(again.state).toBe(contacted);
    expect(again.state.actionPoints).toBe(INITIAL_AP_REDTEAM - 1);
  });

  it('林夏不消耗行动点，未知 NPC 被拒绝', () => {
    const result = contactCaseNpc(freshState(), 'npc_linxia');
    expect(result.ok).toBe(true);
    expect(result.state.actionPoints).toBe(INITIAL_AP_REDTEAM);
    expect(result.state.npcStates.npc_linxia.conversationHistory).toHaveLength(2);

    const unknown = contactCaseNpc(freshState(), 'npc_nobody');
    expect(unknown.ok).toBe(false);
  });

  it('行动点不足时无法联系周宁', () => {
    const broke: GameState = { ...freshState(), actionPoints: 0 };
    const result = contactCaseNpc(broke, 'npc_zhouning');
    expect(result.ok).toBe(false);
    expect(result.state.actionPoints).toBe(0);
    expect(result.state.investigation.contactedNpcIds).toEqual([]);
  });
});

describe('初步假设', () => {
  it('条件不足时提交被拒绝', () => {
    const result = submitCaseHypothesis(freshState(), 'impersonation');
    expect(result.ok).toBe(false);
    expect(result.state.investigation.completed).toBe(false);
    expect(result.message).toContain('E2');
  });

  it('错误假设给出反馈但不结束调查', () => {
    const ready = readyState();
    const result = submitCaseHypothesis(ready, 'deadline-typo');
    expect(result.ok).toBe(false);
    expect(result.state).toBe(ready);
    expect(result.state.investigation.completed).toBe(false);
    expect(result.message).toContain('陌生短链');
  });

  it('正确假设记录结论、标记完成并写入日志', () => {
    const ready = readyState();
    const result = submitCaseHypothesis(ready, 'impersonation');
    expect(result.ok).toBe(true);
    expect(result.state.investigation.completed).toBe(true);
    expect(result.state.investigation.hypothesisId).toBe('impersonation');
    expect(result.state.investigation.completedAt).toBeTruthy();
    expect(result.state.flags.investigation_complete).toBe(true);
    expect(result.state.log.at(-1)?.actionId).toBe('submit_hypothesis');
    expect(result.state.actionPoints).toBe(ready.actionPoints);
  });

  it('完成后不能再次提交', () => {
    const done = submitCaseHypothesis(readyState(), 'impersonation').state;
    const again = submitCaseHypothesis(done, 'impersonation');
    expect(again.ok).toBe(false);
    expect(again.state).toBe(done);
  });
});

describe('引导步骤', () => {
  it('根据调查进度得出 0–4 的引导序号', () => {
    expect(getGuideStepIndex([], [], [], false)).toBe(0);

    const viewed = ['ke-02'];
    expect(getGuideStepIndex(viewed, [], [], false)).toBe(1);

    const contacted = ['npc_zhouning'];
    expect(getGuideStepIndex(viewed, [], contacted, false)).toBe(2);

    expect(getGuideStepIndex(viewed, ['ke-02', 'ke-07'], contacted, false)).toBe(3);
    expect(getGuideStepIndex(viewed, [], [], true)).toBe(4);
  });

  it('假设就绪需要看过 E2、联系周宁且情报板至少两条', () => {
    expect(isHypothesisReady(['ke-02'], ['ke-02', 'ke-07'], ['npc_zhouning'])).toBe(true);
    expect(isHypothesisReady(['ke-02'], ['ke-02'], ['npc_zhouning'])).toBe(false);
    expect(isHypothesisReady(['ke-02'], ['ke-02', 'ke-07'], [])).toBe(false);
    expect(isHypothesisReady([], ['ke-02', 'ke-07'], ['npc_zhouning'])).toBe(false);
  });
});
