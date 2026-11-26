import { describe, expect, it } from 'vitest';
import {
  appendLog,
  canSpend,
  clampWorld,
  collectEvidence,
  createBlankState,
  createInitialGameState,
  spendActionPoints,
} from '@/engine/GameEngine';
import {
  accumulatePersonality,
  createEmptyPersonality,
  normalizeDimension,
} from '@/engine/PersonalityEngine';
import { INITIAL_AP_REDTEAM, INITIAL_WORLD } from '@/data/gameConfig';
import type { PlayerProfile } from '@/types';
import { mulberry32 } from '@/utils/random';

const profile: PlayerProfile = {
  callsign: '灰雀',
  avatarId: 'sigil-01',
  college: 'computing',
  interests: ['网络安全', '播客'],
  clearance: 'PHANTOM-RT-07',
};

function stripVolatile<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (key, inner) => {
      if (key === 'at' || key === 'startedAt' || key === 'updatedAt') return undefined;
      return inner;
    }),
  ) as T;
}

describe('GameEngine 初始化', () => {
  it('创建红队初始状态：12 AP、5 名 NPC、世界状态与种子', () => {
    const state = createInitialGameState(profile, 20261126);
    expect(state.screen).toBe('os');
    expect(state.phase).toBe('redteam');
    expect(state.actionPoints).toBe(INITIAL_AP_REDTEAM);
    expect(state.maxActionPoints).toBe(INITIAL_AP_REDTEAM);
    expect(state.player?.callsign).toBe('灰雀');
    expect(Object.keys(state.npcStates)).toHaveLength(5);
    expect(state.world).toEqual(INITIAL_WORLD);
    expect(state.seed).toBe(20261126);
    expect(state.log).toHaveLength(1);
    expect(state.collectedEvidenceIds).toEqual([]);
  });

  it('同一初始种子得到一致的非时间性状态', () => {
    const a = createInitialGameState(profile, 42);
    const b = createInitialGameState(profile, 42);
    expect(stripVolatile(a)).toEqual(stripVolatile(b));
  });

  it('空白状态没有操作员', () => {
    const blank = createBlankState();
    expect(blank.player).toBeNull();
    expect(blank.log).toEqual([]);
  });
});

describe('行动点守卫', () => {
  it('扣除后不会为负，且无法在不足时继续扣除', () => {
    let state = createInitialGameState(profile, 1);
    state = spendActionPoints(state, 5);
    expect(state.actionPoints).toBe(7);
    expect(canSpend(state, 8)).toBe(false);
    expect(canSpend(state, 7)).toBe(true);
    state = spendActionPoints(state, 20);
    expect(state.actionPoints).toBe(0);
    expect(canSpend(state, 1)).toBe(false);
  });

  it('零成本行动不改变行动点', () => {
    const state = createInitialGameState(profile, 1);
    expect(spendActionPoints(state, 0)).toBe(state);
  });
});

describe('证据归档', () => {
  it('归档不消耗行动点，写入日志与人格向量，且幂等', () => {
    const state = createInitialGameState(profile, 7);
    const result = collectEvidence(state, 'ev-01');
    expect(result.ok).toBe(true);
    expect(result.state.actionPoints).toBe(INITIAL_AP_REDTEAM);
    expect(result.state.collectedEvidenceIds).toEqual(['ev-01']);
    expect(result.state.log).toHaveLength(2);
    expect(result.state.personality.evidence.count).toBe(1);

    const duplicate = collectEvidence(result.state, 'ev-01');
    expect(duplicate.ok).toBe(false);
    expect(duplicate.state).toBe(result.state);
    expect(duplicate.state.collectedEvidenceIds).toHaveLength(1);
  });

  it('未知材料被拒绝', () => {
    const state = createInitialGameState(profile, 3);
    const result = collectEvidence(state, 'ev-does-not-exist');
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
  });

  it('防御阶段无法归档红队专属材料', () => {
    const state = { ...createInitialGameState(profile, 5), phase: 'defense' as const };
    const result = collectEvidence(state, 'ev-05');
    expect(result.ok).toBe(false);
    expect(result.state.collectedEvidenceIds).toEqual([]);
  });
});

describe('人格累计', () => {
  it('只统计权重非零的维度', () => {
    let personality = createEmptyPersonality();
    personality = accumulatePersonality(personality, {
      evidence: 1,
      caution: 0,
      protection: 0,
      system: -0.5,
    });
    expect(personality.evidence.count).toBe(1);
    expect(personality.evidence.score).toBe(1);
    expect(personality.caution.count).toBe(0);
    expect(personality.system.count).toBe(1);
    expect(personality.system.score).toBe(-0.5);
  });

  it('样本不足时归一化返回 0，足够时夹紧到 [-1, 1]', () => {
    expect(normalizeDimension({ score: 4, count: 2 })).toBe(0);
    expect(normalizeDimension({ score: 2, count: 3 })).toBeCloseTo(1 / 3);
    expect(normalizeDimension({ score: 100, count: 4 })).toBe(1);
    expect(normalizeDimension({ score: -100, count: 4 })).toBe(-1);
  });
});

describe('日志与世界状态', () => {
  it('日志按顺序追加并记录回合', () => {
    let state = createInitialGameState(profile, 9);
    state = appendLog(state, {
      phase: 'redteam',
      actionId: 'test',
      actionLabel: '测试',
      detail: '测试日志',
      apDelta: 0,
      tags: ['test'],
    });
    expect(state.log).toHaveLength(2);
    const ids = new Set(state.log.map((entry) => entry.id));
    expect(ids.size).toBe(2);
    expect(state.log[1].actionLabel).toBe('测试');
  });

  it('世界状态夹紧在 0–100', () => {
    expect(clampWorld({ security: -10, operation: 120, relations: 50, repair: 0 })).toEqual({
      security: 0,
      operation: 100,
      relations: 50,
      repair: 0,
    });
  });

  it('相同种子的 PRNG 序列一致', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });
});
