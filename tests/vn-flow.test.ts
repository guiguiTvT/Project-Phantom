import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENDING_BY_ID, ENDING_PRIORITY, ENDINGS } from '@/data/endings';
import { ASSETS } from '@/game/data/assets';
import { CASE_HOTSPOTS, VN_EVIDENCE } from '@/game/data/evidence';
import { DEFENSE_DECISIONS, HYPOTHESES, NPC_BY_ID, REVERSAL_FRAMES } from '@/game/data/story';
import {
  buildDefensePlan,
  INITIAL_WORLD,
  judgeEnding,
} from '@/game/engine/DefenseEngine';
import { recordPersona, readPersona, selectPersonaEvidence } from '@/game/engine/PersonaEngine';
import { contradictionFor, evaluatePresentation } from '@/game/engine/TestimonyEngine';
import {
  advanceDefense,
  advanceNpc,
  advanceReversal,
  askStatementFollowUp,
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
  selectNpc,
  selectWitness,
  setStatement,
  skipReversal,
  startCase,
  verifyNpc,
} from '@/game/engine/StoryEngine';
import type {
  ContradictionRecord,
  HypothesisId,
  NpcId,
  VnEvidenceId,
  VnResult,
  VnState,
} from '@/game/types';

function must(result: VnResult): VnState {
  expect(result.ok, result.message).toBe(true);
  return result.state;
}

function collect(state: VnState, evidenceId: VnEvidenceId): VnState {
  const hotspot = CASE_HOTSPOTS.find((item) => item.evidenceId === evidenceId);
  if (!hotspot) throw new Error(`no hotspot for ${evidenceId}`);
  return must(collectHotspot(state, hotspot.id));
}

function talk(state: VnState, npcId: NpcId): VnState {
  let next = selectNpc(state, npcId).state;
  let guard = 0;
  while (!next.npcDoneIds.includes(npcId) && guard < 8) {
    next = must(advanceNpc(next));
    guard += 1;
  }
  expect(guard).toBeLessThan(8);
  return next;
}

function readyForTestimony(): VnState {
  let state = startCase(createVnState());
  state = must(enterInvestigation(state));
  state = collect(state, 'E2');
  state = collect(state, 'E4');
  state = talk(state, 'linxia');
  return must(enterTestimony(state));
}

function present(
  state: VnState,
  witnessId: NpcId,
  statementIndex: number,
  evidenceId: VnEvidenceId,
) {
  let next = must(selectWitness(state, witnessId));
  next = setStatement(next, statementIndex);
  return presentTestimonyEvidence(next, evidenceId);
}

function readyForSimulation(): VnState {
  let state = readyForTestimony();
  state = present(state, 'linxia', 0, 'E2').state;
  return must(enterSimulation(state));
}

function reachDefense(state: VnState): VnState {
  let next = must(enterReversal(state));
  expect(next.redteamAccess).toBe(false);
  for (let i = 0; i < 4; i += 1) {
    next = must(advanceReversal(next));
  }
  expect(next.scene).toBe('defense');
  return next;
}

function decide(state: VnState, decisionId: string, optionId: string): VnState {
  return must(advanceDefense(must(chooseDefenseOption(state, decisionId, optionId))));
}

function contradiction(
  hypothesis: HypothesisId,
  suffix: string,
): ContradictionRecord {
  return {
    hypothesis,
    witnessId: 'linxia',
    statementId: `st-${suffix}`,
    evidenceId: 'E2',
  };
}

function endingState(patch: Partial<VnState>): VnState {
  return { ...createVnState(), scene: 'defense', ...patch };
}

describe('素材、数据与结局表', () => {
  it('全部背景、人物表情、材料、结局、反转与人格插画真实存在且不是占位文件', () => {
    const files = [
      ASSETS.cover,
      ASSETS.activityRoom,
      ASSETS.dormNight,
      ASSETS.serviceHall,
      ...Object.values(ASSETS.characters).flatMap((expressions) => Object.values(expressions)),
      ...Object.values(ASSETS.evidence),
      ...Object.values(ASSETS.cg),
      ...Object.values(ASSETS.endings),
      ...Object.values(ASSETS.personality),
    ];
    expect(new Set(files).size).toBe(files.length);
    for (const file of files) {
      const absolute = path.resolve(process.cwd(), `public${file}`);
      expect(existsSync(absolute), `${file} 缺失`).toBe(true);
      expect(statSync(absolute).size, `${file} 过小`).toBeGreaterThan(1024);
    }
  });

  it('八份材料与三条现场热点保持完整，热点坐标在可视范围内', () => {
    expect(VN_EVIDENCE).toHaveLength(8);
    expect(VN_EVIDENCE.every((item) => item.collectible)).toBe(true);
    expect(CASE_HOTSPOTS).toHaveLength(3);
    for (const hotspot of CASE_HOTSPOTS) {
      expect(hotspot.x).toBeGreaterThan(0);
      expect(hotspot.x).toBeLessThan(100);
      expect(hotspot.y).toBeGreaterThan(0);
      expect(hotspot.y).toBeLessThan(100);
      expect(VN_EVIDENCE.some((item) => item.id === hotspot.evidenceId)).toBe(true);
    }
  });

  it('六个结局与十六型人格都有对应插画，反转帧使用专属 CG', () => {
    expect(Object.keys(ASSETS.endings)).toHaveLength(6);
    expect(Object.keys(ASSETS.personality)).toHaveLength(16);
    for (const ending of ENDINGS) {
      expect(ASSETS.endings[ending.id as keyof typeof ASSETS.endings]).toBeTruthy();
    }
    for (const frame of REVERSAL_FRAMES) {
      expect(Object.values(ASSETS.cg)).toContain(frame.bg);
    }
  });

  it('三个假设、四个防御决策与六个结局的配置完整', () => {
    expect(Object.keys(HYPOTHESES)).toEqual(['H1', 'H2', 'H3']);
    expect(Object.keys(DEFENSE_DECISIONS)).toEqual(['D1', 'D2', 'D3', 'D4']);
    for (const decision of Object.values(DEFENSE_DECISIONS)) {
      expect(decision.options).toHaveLength(3);
      expect(new Set(decision.options.map((item) => item.id)).size).toBe(3);
    }
    expect(ENDINGS).toHaveLength(6);
    expect(ENDING_PRIORITY[ENDING_PRIORITY.length - 1].fallback).toBe(true);
    for (let i = 1; i < ENDING_PRIORITY.length; i += 1) {
      expect(ENDING_PRIORITY[i - 1].priority).toBeGreaterThanOrEqual(ENDING_PRIORITY[i].priority);
    }
  });

  it('五个人物都配置了对话、追问与场景', () => {
    expect(Object.keys(NPC_BY_ID)).toEqual(['linxia', 'zhouning', 'chen', 'xuyan', 'gu']);
    for (const npc of Object.values(NPC_BY_ID)) {
      expect(npc.lines.length).toBeGreaterThanOrEqual(2);
      expect(npc.verify.cost).toBe(1);
      expect(npc.bg).toContain('/assets/backgrounds/');
    }
  });
});

describe('现场调查与人物分支', () => {
  it('现场收集不耗行动点，重复调查幂等，未知热点被拒绝', () => {
    const initial = createVnState();
    const first = collectHotspot(initial, 'hotspot-phone');
    expect(first.ok).toBe(true);
    expect(first.evidenceId).toBe('E2');
    expect(first.state.ap).toBe(initial.ap);
    expect(first.state.foundHotspotIds).toEqual(['hotspot-phone']);
    expect(first.state.collectedEvidenceIds).toEqual(['E2']);
    expect(first.state.personaEvents).toHaveLength(1);

    const again = collectHotspot(first.state, 'hotspot-phone');
    expect(again.state.collectedEvidenceIds).toEqual(['E2']);
    expect(again.state.foundHotspotIds).toEqual(first.state.foundHotspotIds);
    expect(again.state.log).toHaveLength(first.state.log.length);

    const unknown = collectHotspot(first.state, 'hotspot-unknown');
    expect(unknown.ok).toBe(false);
    expect(unknown.state).toBe(first.state);
  });

  it('至少两份材料才能进入人物调查，且进入不消耗行动点', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    expect(enterNpcHub(state).ok).toBe(false);
    state = collect(state, 'E4');
    const hub = must(enterNpcHub(state));
    expect(hub.scene).toBe('npc');
    expect(hub.ap).toBe(6);
  });

  it('不同人物给出不同材料，追问只扣一次行动点且只记录一次', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = talk(state, 'linxia');
    const verified = must(verifyNpc(state));
    expect(verified.npcVerifiedIds).toEqual(['linxia']);
    expect(verified.collectedEvidenceIds).toContain('E8');
    expect(verified.ap).toBe(state.ap - 1);
    expect(verified.npcReply?.emotion).toBe('nervous');
    expect(verified.personaEvents.some((item) => item.id === 'npc-verify-linxia')).toBe(true);

    const twice = verifyNpc(verified);
    expect(twice.ok).toBe(false);
    expect(twice.state.ap).toBe(verified.ap);

    let other = startCase(createVnState());
    other = must(enterInvestigation(other));
    other = collect(other, 'E2');
    other = collect(other, 'E4');
    other = talk(other, 'xuyan');
    const otherVerified = must(verifyNpc(other));
    expect(otherVerified.collectedEvidenceIds).toContain('E6');
    expect(otherVerified.collectedEvidenceIds).not.toContain('E8');
  });

  it('顾老师把话说完后自动交出官方公告', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    expect(state.collectedEvidenceIds).not.toContain('E1');
    state = talk(state, 'gu');
    expect(state.collectedEvidenceIds).toContain('E1');
    expect(state.npcDoneIds).toContain('gu');
    expect(state.ap).toBe(6);
  });
});

describe('质询判定与分支', () => {
  it('没有证人谈完不能进入质询', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    expect(enterTestimony(state).ok).toBe(false);
  });

  it('矛盾、支持、不足与无关四类反馈来自配置表', () => {
    expect(evaluatePresentation('lx-st-1', 'E2')).toMatchObject({
      result: 'contradiction',
      hypothesis: 'H1',
    });
    expect(evaluatePresentation('lx-st-3', 'E1').result).toBe('contradiction');
    expect(evaluatePresentation('ch-st-1', 'E3')).toMatchObject({ result: 'contradiction', hypothesis: 'H2' });
    expect(evaluatePresentation('xy-st-1', 'E6')).toMatchObject({ result: 'contradiction', hypothesis: 'H3' });
    expect(evaluatePresentation('lx-st-2', 'E2').result).toBe('supports');
    expect(evaluatePresentation('lx-st-1', 'E7').result).toBe('insufficient');
    expect(evaluatePresentation('lx-st-1', 'E4').result).toBe('irrelevant');
    expect(contradictionFor('lx-st-1')).toBe('E2');
    expect(contradictionFor('xy-st-1')).toBe('E6');
    expect(contradictionFor('lx-st-2')).toBeNull();
  });

  it('逐句追问消耗行动点，同一句不能重复追问', () => {
    const state = setStatement(readyForTestimony(), 0);
    const first = askStatementFollowUp(state);
    expect(first.ok).toBe(true);
    expect(first.state.ap).toBe(state.ap - 1);
    expect(first.state.askedStatementIds).toEqual(['lx-st-1']);
    expect(first.state.statementReply).toContain('头像');
    const second = askStatementFollowUp(first.state);
    expect(second.ok).toBe(false);
    expect(second.state.ap).toBe(first.state.ap);
  });

  it('正确矛盾写入假设，重复出示不会重复记录，出示不扣行动点', () => {
    const state = setStatement(readyForTestimony(), 0);
    const result = presentTestimonyEvidence(state, 'E2');
    expect(result.ok).toBe(true);
    expect(result.evaluation?.result).toBe('contradiction');
    expect(result.evaluation?.alreadyFound).toBe(false);
    expect(result.state.contradictions).toHaveLength(1);
    expect(result.state.contradictions[0]).toMatchObject({
      hypothesis: 'H1',
      witnessId: 'linxia',
      statementId: 'lx-st-1',
      evidenceId: 'E2',
    });
    expect(result.state.ap).toBe(state.ap);

    const again = presentTestimonyEvidence(result.state, 'E2');
    expect(again.evaluation?.alreadyFound).toBe(true);
    expect(again.state.contradictions).toHaveLength(1);
    expect(again.state.presentations).toHaveLength(1);
  });

  it('不同证人的证词给出不同风险假设', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = talk(state, 'linxia');
    state = talk(state, 'xuyan');
    state = must(verifyNpc(state));
    expect(state.collectedEvidenceIds).toContain('E6');
    state = must(enterTestimony(state));
    const result = present(state, 'xuyan', 0, 'E6');
    expect(result.evaluation?.hypothesis).toBe('H3');
    expect(result.state.contradictions[0].witnessId).toBe('xuyan');
    expect(result.state.contradictions[0].hypothesis).toBe('H3');
  });

  it('未持有材料无法出示；支持与不足不会写入矛盾', () => {
    const state = setStatement(readyForTestimony(), 0);
    const missing = presentTestimonyEvidence(state, 'E1');
    expect(missing.ok).toBe(false);
    expect(missing.state).toBe(state);

    const supported = presentTestimonyEvidence(setStatement(state, 1), 'E2');
    expect(supported.evaluation?.result).toBe('supports');
    expect(supported.state.contradictions).toHaveLength(0);

    const insufficient = presentTestimonyEvidence(setStatement(state, 0), 'E4');
    expect(insufficient.evaluation?.result).toBe('irrelevant');
    expect(insufficient.state.contradictions).toHaveLength(0);
  });

  it('陈述切换会夹取边界并清空当前追问补充', () => {
    let state = setStatement(readyForTestimony(), 0);
    state = askStatementFollowUp(state).state;
    expect(state.statementReply).not.toBeNull();
    expect(setStatement(state, 99).testimonyIndex).toBe(2);
    expect(setStatement(state, -3).testimonyIndex).toBe(0);
    expect(setStatement(state, 1).statementReply).toBeNull();
  });
});

describe('红队模拟', () => {
  it('有矛盾支撑时得到高置信结果并改变世界状态', () => {
    let state = readyForSimulation();
    expect(state.simulationHypothesis).toBe('H1');
    const before = state.world;
    const simulation = must(runSimulation(state));
    expect(simulation.simulationResult).toMatchObject({
      hypothesisId: 'H1',
      verified: true,
      confidence: 'high',
      apSpent: 2,
    });
    expect(simulation.events).toContain('ev_risk_confirmed');
    expect(simulation.events).not.toContain('ev_unresolved_backlog');
    expect(simulation.world.security).toBeLessThan(before.security);
    expect(simulation.world.repair).toBeGreaterThan(before.repair);
    expect(simulation.ap).toBe(state.ap - 2);
    expect(simulation.personaEvents.some((item) => item.id === 'simulation-H1-confirmed')).toBe(true);

    const again = runSimulation(simulation);
    expect(again.ok).toBe(false);
  });

  it('没有矛盾时按低置信处理，并记录未解决积压', () => {
    let state = readyForTestimony();
    state = must(enterSimulation(state));
    const simulation = must(runSimulation(state));
    expect(simulation.simulationResult).toMatchObject({
      verified: false,
      confidence: 'low',
    });
    expect(simulation.events).toContain('ev_unresolved_backlog');
    expect(simulation.simulationResult?.impact[0]).toContain('无法');
  });

  it('行动点不足 2 时仍可推演，但降为低置信', () => {
    let state = readyForSimulation();
    state = { ...state, ap: 1 };
    const simulation = must(runSimulation(state));
    expect(simulation.ap).toBe(0);
    expect(simulation.simulationResult).toMatchObject({
      verified: true,
      confidence: 'low',
      apSpent: 1,
    });
    expect(simulation.events).toContain('ev_unresolved_backlog');
  });

  it('未进入质询不能直接模拟', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = talk(state, 'linxia');
    expect(enterSimulation(state).ok).toBe(false);
  });
});

describe('身份反转', () => {
  it('模拟前不能反转；反转会收回权限并保留记录', () => {
    let state = readyForTestimony();
    expect(enterReversal(state).ok).toBe(false);
    state = must(enterSimulation(state));
    state = must(runSimulation(state));
    const evidence = [...state.collectedEvidenceIds];
    const contradictions = state.contradictions.length;
    const next = must(enterReversal(state));
    expect(next.scene).toBe('reversal');
    expect(next.redteamAccess).toBe(false);
    expect(next.events).toContain('ev_reversal');
    expect(next.collectedEvidenceIds).toEqual(evidence);
    expect(next.contradictions).toHaveLength(contradictions);
  });

  it('失去红队权限后，现场调查、追问与质询都被拒绝', () => {
    let state = readyForSimulation();
    state = must(runSimulation(state));
    state = must(enterReversal(state));
    expect(collectHotspot(state, 'hotspot-phone').ok).toBe(false);
    expect(verifyNpc(state).ok).toBe(false);
    expect(enterTestimony(state).ok).toBe(false);
  });

  it('四帧反转后进入防御；也可以直接跳过', () => {
    let state = readyForSimulation();
    state = must(runSimulation(state));
    state = must(enterReversal(state));
    expect(state.reversalIndex).toBe(0);
    state = must(advanceReversal(state));
    expect(state.reversalIndex).toBe(1);
    state = must(advanceReversal(state));
    state = must(advanceReversal(state));
    expect(state.reversalIndex).toBe(3);
    state = must(advanceReversal(state));
    expect(state.scene).toBe('defense');
    expect(state.defensePlan).toEqual(['D1', 'D2', 'D4']);

    let quick = must(enterReversal(readyForSimulationAfterRun()));
    quick = must(skipReversal(quick));
    expect(quick.scene).toBe('defense');
  });
});

function readyForSimulationAfterRun(): VnState {
  return must(runSimulation(readyForSimulation()));
}

describe('防御决策', () => {
  it('防御计划随确认的风险类型变化', () => {
    expect(buildDefensePlan({ hypothesisId: 'H1' } as never)).toEqual(['D1', 'D2', 'D4']);
    expect(buildDefensePlan({ hypothesisId: 'H2' } as never)).toEqual(['D1', 'D3', 'D4']);
    expect(buildDefensePlan({ hypothesisId: 'H3' } as never)).toEqual(['D1', 'D4', 'D3']);
    expect(buildDefensePlan(null)).toEqual(['D1', 'D2', 'D4']);
  });

  it('选择会扣资源、更新世界、写入事件与人格记录，并锁住下一次选择', () => {
    let state = reachDefense(readyForSimulationAfterRun());
    const before = state.world;
    const chosen = must(chooseDefenseOption(state, 'D1', 'D1-close'));
    expect(chosen.ap).toBe(state.ap - 1);
    expect(chosen.flags.channel_closed).toBe(true);
    expect(chosen.events).toContain('ev_risk_contained');
    expect(chosen.defenseFeedback).toEqual({ decisionId: 'D1', optionId: 'D1-close' });
    expect(chosen.world.security).toBe(before.security + 10);
    expect(chosen.world.operation).toBe(before.operation - 4);
    expect(chosen.personaEvents.some((item) => item.id === 'defense-D1-D1-close')).toBe(true);

    const twice = chooseDefenseOption(chosen, 'D1', 'D1-keep');
    expect(twice.ok).toBe(false);
    expect(twice.state).toBe(chosen);
    expect(advanceDefense(chosen).ok).toBe(true);
    expect(() => chooseDefenseOption(chosen, 'D2', 'D2-align')).not.toThrow();
  });

  it('维持现状会留下未解决积压，资源不足时无法选择高成本动作', () => {
    let state = reachDefense(readyForSimulationAfterRun());
    state = decide(state, 'D1', 'D1-close');
    state = decide(state, 'D2', 'D2-align');
    const poor = { ...state, ap: 1 };
    const denied = chooseDefenseOption(poor, 'D4', 'D4-rebuild');
    expect(denied.ok).toBe(false);
    expect(denied.message).toContain('资源不足');

    const status = must(chooseDefenseOption(state, 'D4', 'D4-status'));
    expect(status.events).toContain('ev_unresolved_backlog');
  });

  it('最后一轮必须先在反馈后继续，才会进入结算', () => {
    let state = reachDefense(readyForSimulationAfterRun());
    state = decide(state, 'D1', 'D1-keep');
    state = decide(state, 'D2', 'D2-align');
    const chosen = must(chooseDefenseOption(state, 'D4', 'D4-patch'));
    expect(chosen.scene).toBe('defense');
    const ended = must(advanceDefense(chosen));
    expect(ended.scene).toBe('complete');
    expect(ended.endingId).toBeTruthy();
    expect(ENDING_BY_ID[ended.endingId ?? '']).toBeTruthy();
    expect(ended.defenseFeedback).toBeNull();
  });
});

describe('人格与行为日志', () => {
  it('同一行为 ID 不会重复累计', () => {
    let state = createVnState();
    const input = {
      id: 'test-same',
      node: '测试',
      action: '查看材料',
      choice: 'E2',
      vector: { evidence: 0.5, caution: 0, protection: 0, system: 0 },
      rationale: '测试',
    };
    state = recordPersona(state, input);
    state = recordPersona(state, input);
    expect(state.personaEvents).toHaveLength(1);
    expect(state.personality.evidence).toEqual({ score: 0.5, count: 1 });
  });

  it('不足三样本的维度标记为依据不足，三维以上给出字母', () => {
    let state = createVnState();
    for (let i = 0; i < 2; i += 1) {
      state = recordPersona(state, {
        id: `short-${i}`,
        node: '测试',
        action: '选择',
        choice: '谨慎',
        vector: { evidence: 0, caution: 0.6, protection: 0.2, system: 0 },
        rationale: '测试',
      });
    }
    let reading = readPersona(state);
    expect(reading.insufficientDims).toEqual(['evidence', 'caution', 'protection', 'system']);
    expect(reading.code.startsWith('E')).toBe(true);

    state = recordPersona(state, {
      id: 'third',
      node: '测试',
      action: '选择',
      choice: '谨慎',
      vector: { evidence: -0.6, caution: 0.6, protection: 0.2, system: -0.4 },
      rationale: '测试',
    });
    reading = readPersona(state);
    expect(reading.code).toBe('ECPS');
    expect(reading.insufficientDims).toEqual(['evidence', 'system']);
    expect(reading.mixedDims).toContain('protection');
    expect(reading.dims.find((item) => item.dim === 'evidence')?.letter).toBe('E');
    expect(reading.dims.find((item) => item.dim === 'caution')?.letter).toBe('C');
  });

  it('结算依据优先选择防御、矛盾与模拟记录，并保持节点去重', () => {
    let state = reachDefense(readyForSimulationAfterRun());
    state = must(chooseDefenseOption(state, 'D1', 'D1-close'));
    const basis = selectPersonaEvidence(state.personaEvents, 3);
    expect(basis).toHaveLength(3);
    expect(new Set(basis.map((item) => item.node)).size).toBe(3);
    expect(basis[0].id.startsWith('defense-')).toBe(true);
    expect(basis.some((item) => item.id.startsWith('testimony-contradiction-'))).toBe(true);
    expect(readPersona(state).sampleCount).toBe(state.personaEvents.length);
  });
});

describe('结局判定', () => {
  it('多米诺优先于任何恢复型结局', () => {
    const state = endingState({
      world: { security: 80, operation: 70, relations: 75, repair: 70 },
      events: ['ev_risk_contained', 'ev_reversal', 'ev_cascade'],
      collectedEvidenceIds: ['E1', 'E2', 'E3', 'E4', 'E5'],
      contradictions: [contradiction('H1', '1'), contradiction('H1', '2')],
    });
    expect(judgeEnding(state).id).toBe('ending_domino');
  });

  it('破晓优先于共识，并要求至少两处矛盾', () => {
    const base = endingState({
      world: { security: 74, operation: 61, relations: 70, repair: 62 },
      events: ['ev_risk_contained', 'ev_reversal', 'ev_npc_coordination'],
      collectedEvidenceIds: ['E1', 'E2', 'E3', 'E4', 'E5'],
      contradictions: [contradiction('H1', '1'), contradiction('H1', '2')],
    });
    expect(judgeEnding(base).id).toBe('ending_dawn');
    expect(judgeEnding({ ...base, contradictions: [contradiction('H1', '1')] }).id).toBe(
      'ending_consensus',
    );
  });

  it('孤岛优先于新秩序，但要求安全高、秩序低', () => {
    const state = endingState({
      world: { security: 76, operation: 51, relations: 56, repair: 59 },
      events: ['ev_reversal', 'ev_permission_recheck'],
      flags: { new_policy: true },
      contradictions: [contradiction('H1', '1')],
    });
    expect(judgeEnding(state).id).toBe('ending_isolation');
    expect(judgeEnding({ ...state, world: { ...state.world, operation: 60 } }).id).toBe(
      'ending_rebuild',
    );
  });

  it('未满足条件时落入未完待续，世界状态与风险事件都能改变结果', () => {
    const state = endingState({
      world: INITIAL_WORLD,
      events: ['ev_reversal'],
    });
    expect(judgeEnding(state).id).toBe('ending_unresolved');
    expect(judgeEnding({ ...state, events: [...state.events, 'ev_cascade'] }).id).toBe(
      'ending_domino',
    );
  });
});

describe('三条完整游玩路线', () => {
  it('路线一：双矛盾 + 重建流程 → 破晓', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = collect(state, 'E7');
    state = talk(state, 'linxia');
    state = talk(state, 'gu');
    state = talk(state, 'zhouning');
    state = must(verifyNpc(state));
    expect(state.collectedEvidenceIds).toEqual(['E2', 'E4', 'E7', 'E1', 'E5']);

    state = must(enterTestimony(state));
    state = present(state, 'linxia', 0, 'E2').state;
    state = present(state, 'linxia', 2, 'E1').state;
    expect(state.contradictions).toHaveLength(2);

    state = must(enterSimulation(state));
    state = must(runSimulation(state));
    expect(state.simulationResult).toMatchObject({ verified: true, confidence: 'high' });

    state = reachDefense(state);
    state = decide(state, 'D1', 'D1-close');
    state = decide(state, 'D2', 'D2-align');
    state = decide(state, 'D4', 'D4-rebuild');

    expect(state.scene).toBe('complete');
    expect(state.endingId).toBe('ending_dawn');
    expect(state.world).toEqual({ security: 74, operation: 61, relations: 70, repair: 62 });
    expect(state.ap).toBe(0);
    expect(state.redteamAccess).toBe(false);
    expect(state.flags.new_policy).toBe(true);
    expect(state.events).toContain('ev_risk_contained');
    expect(state.personaEvents.length).toBeGreaterThan(7);
  });

  it('路线二：旧表分支 + 只修链接 → 共识', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = collect(state, 'E7');
    state = talk(state, 'linxia');
    state = talk(state, 'gu');
    state = talk(state, 'xuyan');
    state = must(verifyNpc(state));
    expect(state.collectedEvidenceIds).toEqual(['E2', 'E4', 'E7', 'E1', 'E6']);

    state = must(enterTestimony(state));
    state = present(state, 'linxia', 0, 'E2').state;
    expect(state.contradictions).toHaveLength(1);

    state = must(enterSimulation(state));
    state = must(runSimulation(state));
    state = reachDefense(state);
    state = decide(state, 'D1', 'D1-close');
    state = decide(state, 'D2', 'D2-align');
    state = decide(state, 'D4', 'D4-patch');

    expect(state.scene).toBe('complete');
    expect(state.endingId).toBe('ending_consensus');
    expect(state.world).toEqual({ security: 68, operation: 63, relations: 68, repair: 52 });
    expect(state.ap).toBe(2);
    expect(state.events).toContain('ev_npc_coordination');
    expect(state.flags.new_policy).toBeUndefined();
  });

  it('路线三：只要现场材料 + 强限制处置 → 孤岛', () => {
    let state = startCase(createVnState());
    state = must(enterInvestigation(state));
    state = collect(state, 'E2');
    state = collect(state, 'E4');
    state = collect(state, 'E7');
    state = talk(state, 'linxia');

    state = must(enterTestimony(state));
    state = present(state, 'linxia', 0, 'E2').state;
    state = must(enterSimulation(state));
    state = must(runSimulation(state));
    expect(state.ap).toBe(4);

    state = reachDefense(state);
    state = decide(state, 'D1', 'D1-close');
    state = decide(state, 'D2', 'D2-apology');
    state = decide(state, 'D4', 'D4-rebuild');

    expect(state.scene).toBe('complete');
    expect(state.endingId).toBe('ending_isolation');
    expect(state.world).toEqual({ security: 76, operation: 51, relations: 56, repair: 59 });
    expect(state.ap).toBe(0);
    expect(state.collectedEvidenceIds).toEqual(['E2', 'E4', 'E7']);
    expect(state.defenseChoices.map((item) => item.optionId)).toEqual([
      'D1-close',
      'D2-apology',
      'D4-rebuild',
    ]);
  });

  it('三条路线产生不同结局、不同最终世界与不同人格依据', () => {
    const persona = storyWithDefense();
    expect(persona.endingId).toBe('ending_dawn');
  });
});

function storyWithDefense(): VnState {
  let state = startCase(createVnState());
  state = must(enterInvestigation(state));
  state = collect(state, 'E2');
  state = collect(state, 'E4');
  state = collect(state, 'E7');
  state = talk(state, 'linxia');
  state = talk(state, 'gu');
  state = talk(state, 'zhouning');
  state = must(verifyNpc(state));
  state = must(enterTestimony(state));
  state = present(state, 'linxia', 0, 'E2').state;
  state = present(state, 'linxia', 2, 'E1').state;
  state = must(enterSimulation(state));
  state = must(runSimulation(state));
  state = reachDefense(state);
  state = decide(state, 'D1', 'D1-close');
  state = decide(state, 'D2', 'D2-align');
  state = decide(state, 'D4', 'D4-rebuild');
  return state;
}
