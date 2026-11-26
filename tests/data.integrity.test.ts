import { describe, expect, it } from 'vitest';
import { ACTIONS } from '@/data/actions';
import { ENDINGS } from '@/data/endings';
import { CONTRADICTION_GROUPS, EVIDENCE_BY_ID, EVIDENCE_CARDS, PRIMARY_EVIDENCE_FOR_POST } from '@/data/evidence';
import { EVENTS } from '@/data/events';
import { FEED_POSTS } from '@/data/feed';
import { CHANNELS, COLLEGES, INITIAL_AP_DEFENSE, INITIAL_AP_REDTEAM, INTEREST_TAGS, CALLSIGNS, AVATAR_IDS } from '@/data/gameConfig';
import { NPCS, NPC_BY_ID, RELATION_EDGES } from '@/data/npcs';
import { PERSONALITIES, PERSONALITY_BY_CODE } from '@/data/personalities';

const EXPECTED_CODES = [
  'ECPS', 'ECPR', 'ECFS', 'ECFR',
  'EAPS', 'EAPR', 'EAFS', 'EAFR',
  'ICPS', 'ICPR', 'ICFS', 'ICFR',
  'IAPS', 'IAPR', 'IAFS', 'IAFR',
];

describe('启动配置与预设', () => {
  it('行动点为 12 / 10，且预设内容数量正确', () => {
    expect(INITIAL_AP_REDTEAM).toBe(12);
    expect(INITIAL_AP_DEFENSE).toBe(10);
    expect(CALLSIGNS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(CALLSIGNS).size).toBe(CALLSIGNS.length);
    expect(AVATAR_IDS.length).toBeGreaterThanOrEqual(6);
    expect(INTEREST_TAGS.length).toBeGreaterThanOrEqual(8);
    expect(COLLEGES.length).toBe(4);
  });
});

describe('校园动态', () => {
  it('包含 15–20 条动态且 ID 唯一', () => {
    expect(FEED_POSTS.length).toBeGreaterThanOrEqual(15);
    expect(FEED_POSTS.length).toBeLessThanOrEqual(20);
    expect(new Set(FEED_POSTS.map((post) => post.id)).size).toBe(FEED_POSTS.length);
  });

  it('频道、作者与关联材料合法', () => {
    const channelIds = new Set(CHANNELS.map((channel) => channel.id));
    const npcIds = new Set(NPCS.map((npc) => npc.id));
    for (const post of FEED_POSTS) {
      expect(channelIds.has(post.channel)).toBe(true);
      if (post.authorRole === 'student' || post.authorRole === 'teacher' || post.authorRole === 'staff') {
        expect(npcIds.has(post.authorId)).toBe(true);
      }
      if (post.evidenceId) {
        expect(EVIDENCE_BY_ID[post.evidenceId]).toBeDefined();
        expect(PRIMARY_EVIDENCE_FOR_POST[post.id]).toBe(post.evidenceId);
      }
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });
});

describe('证据与矛盾组', () => {
  it('证据卡数量在 8–12 之间，字段与引用闭合', () => {
    expect(EVIDENCE_CARDS.length).toBeGreaterThanOrEqual(8);
    expect(EVIDENCE_CARDS.length).toBeLessThanOrEqual(12);
    expect(new Set(EVIDENCE_CARDS.map((item) => item.id)).size).toBe(EVIDENCE_CARDS.length);

    const postIds = new Set(FEED_POSTS.map((post) => post.id));
    const npcIds = new Set(NPCS.map((npc) => npc.id));
    const groupIds = new Set(CONTRADICTION_GROUPS.map((group) => group.id));

    for (const evidence of EVIDENCE_CARDS) {
      expect(evidence.relatedPostIds.length).toBeGreaterThan(0);
      for (const postId of evidence.relatedPostIds) {
        expect(postIds.has(postId)).toBe(true);
      }
      for (const npcId of evidence.relatedNpcIds) {
        expect(npcIds.has(npcId)).toBe(true);
      }
      if (evidence.contradictionGroupId) {
        expect(groupIds.has(evidence.contradictionGroupId)).toBe(true);
      }
      expect(['public', 'redteam']).toContain(evidence.accessLevel);
      expect(evidence.summary.length).toBeGreaterThan(10);
    }
  });

  it('至少 3 组相互矛盾的信息，且每组至少两条动态', () => {
    expect(CONTRADICTION_GROUPS.length).toBeGreaterThanOrEqual(3);
    const postIds = new Set(FEED_POSTS.map((post) => post.id));
    for (const group of CONTRADICTION_GROUPS) {
      expect(group.postIds.length).toBeGreaterThanOrEqual(2);
      for (const id of group.postIds) expect(postIds.has(id)).toBe(true);
      for (const id of group.evidenceIds) expect(EVIDENCE_BY_ID[id]).toBeDefined();
    }
  });

  it('包含过期、无关或存在误解的材料', () => {
    const stale = EVIDENCE_CARDS.filter((item) => item.verification === 'stale');
    const disputed = EVIDENCE_CARDS.filter((item) => item.verification === 'disputed');
    expect(stale.length).toBeGreaterThan(0);
    expect(disputed.length).toBeGreaterThan(0);
  });

  it('红队专属材料存在，用于反转后的权限差异', () => {
    const redteam = EVIDENCE_CARDS.filter((item) => item.accessLevel === 'redteam');
    expect(redteam.length).toBeGreaterThan(0);
  });
});

describe('NPC', () => {
  it('五名 NPC 数据完整且 ID 唯一', () => {
    expect(NPCS).toHaveLength(5);
    expect(new Set(NPCS.map((npc) => npc.id)).size).toBe(5);
    for (const npc of NPCS) {
      expect(npc.id).toBeTruthy();
      expect(npc.name).toBeTruthy();
      expect(npc.avatarId).toBeTruthy();
      expect(npc.role).toBeTruthy();
      expect(npc.personality.length).toBeGreaterThan(1);
      expect(npc.knownFacts.length).toBeGreaterThanOrEqual(4);
      expect(Array.isArray(npc.memory)).toBe(true);
      expect(Array.isArray(npc.conversationHistory)).toBe(true);
      expect(npc.relationships.length).toBeGreaterThan(0);
      expect(npc.currentTask).toBeTruthy();
      expect(npc.currentMood).toBeTruthy();
      for (const relation of npc.relationships) {
        expect(NPC_BY_ID[relation.npcId]).toBeDefined();
      }
    }
  });

  it('关系图边引用存在的节点', () => {
    const ids = new Set([...NPCS.map((npc) => npc.id), 'player']);
    expect(RELATION_EDGES.length).toBeGreaterThanOrEqual(8);
    for (const edge of RELATION_EDGES) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
      expect(edge.source).not.toBe(edge.target);
    }
    expect(new Set(RELATION_EDGES.map((edge) => edge.id)).size).toBe(RELATION_EDGES.length);
  });
});

describe('行动定义', () => {
  it('行动成本非负，且红队/防御行动齐备', () => {
    expect(ACTIONS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ACTIONS.map((action) => action.id)).size).toBe(ACTIONS.length);
    for (const action of ACTIONS) {
      expect(action.cost).toBeGreaterThanOrEqual(0);
      expect(action.label).toBeTruthy();
      expect(action.intent).toBeTruthy();
    }
    const costs = Object.fromEntries(ACTIONS.map((action) => [action.id, action.cost]));
    expect(costs.browse_stream).toBe(0);
    expect(costs.collect_evidence).toBe(0);
    expect(costs.query_npc).toBe(1);
    expect(costs.verify_evidence).toBe(1);
    expect(costs.run_simulation).toBe(2);
    expect(ACTIONS.some((action) => action.phase === 'defense')).toBe(true);
  });
});

describe('事件系统配置', () => {
  it('至少 12 个事件，引用关系闭合且一次性标记存在', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(EVENTS.map((event) => event.eventId)).size).toBe(EVENTS.length);
    const eventIds = new Set(EVENTS.map((event) => event.eventId));
    const npcIds = new Set(NPCS.map((npc) => npc.id));
    const evidenceIds = new Set(EVIDENCE_CARDS.map((item) => item.id));
    const groupIds = new Set(CONTRADICTION_GROUPS.map((group) => group.id));

    for (const event of EVENTS) {
      expect(event.phase.length).toBeGreaterThan(0);
      for (const followUp of event.followUpEvents) expect(eventIds.has(followUp)).toBe(true);
      for (const npcId of event.affectedNPCs) expect(npcIds.has(npcId)).toBe(true);
      for (const affected of event.npcEffects) expect(npcIds.has(affected.npcId)).toBe(true);
      for (const evidenceId of event.triggerConditions.requiredEvidenceIds ?? []) {
        expect(evidenceIds.has(evidenceId)).toBe(true);
      }
      for (const groupId of event.triggerConditions.anyEvidenceFromGroup ?? []) {
        expect(groupIds.has(groupId)).toBe(true);
      }
      for (const required of event.triggerConditions.requiredEventIds ?? []) {
        expect(eventIds.has(required)).toBe(true);
      }
      expect(event.delayTurns).toBeGreaterThanOrEqual(0);
    }

    const reversal = EVENTS.find((event) => event.eventId === 'ev_reversal');
    expect(reversal?.onceOnly).toBe(true);
    expect(EVENTS.filter((event) => event.onceOnly).length).toBe(EVENTS.length);
  });
});

describe('Phantom Type 配置', () => {
  it('16 种人格完整、唯一且字母代码合法', () => {
    expect(PERSONALITIES).toHaveLength(16);
    expect(new Set(PERSONALITIES.map((item) => item.code)).size).toBe(16);
    expect(new Set(PERSONALITIES.map((item) => item.code))).toEqual(new Set(EXPECTED_CODES));

    for (const code of EXPECTED_CODES) {
      const personality = PERSONALITY_BY_CODE[code as keyof typeof PERSONALITY_BY_CODE];
      expect(personality).toBeDefined();
      expect(personality.nameCn).toBeTruthy();
      expect(personality.nameEn).toBeTruthy();
      expect(personality.tagline).toBeTruthy();
      expect(personality.description).toBeTruthy();
      expect(personality.style).toBeTruthy();
      expect(personality.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(personality.glyph.seed).toBeGreaterThanOrEqual(0);
      expect(personality.glyph.seed).toBeLessThanOrEqual(15);
      expect(personality.strengths.length).toBeGreaterThanOrEqual(2);
      expect(personality.blindspots.length).toBeGreaterThanOrEqual(1);
      expect(personality.advice.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('同一字母位上的维度与代码一致', () => {
    for (const item of PERSONALITIES) {
      expect(['E', 'I']).toContain(item.code[0]);
      expect(['C', 'A']).toContain(item.code[1]);
      expect(['P', 'F']).toContain(item.code[2]);
      expect(['S', 'R']).toContain(item.code[3]);
    }
  });
});

describe('结局配置', () => {
  it('六种结局、优先级唯一、仅一个兜底结局', () => {
    expect(ENDINGS).toHaveLength(6);
    expect(new Set(ENDINGS.map((ending) => ending.id)).size).toBe(6);
    expect(new Set(ENDINGS.map((ending) => ending.priority)).size).toBe(ENDINGS.length);
    expect(ENDINGS.filter((ending) => ending.fallback)).toHaveLength(1);

    const eventIds = new Set(EVENTS.map((event) => event.eventId));
    for (const ending of ENDINGS) {
      expect(ending.nameCn).toBeTruthy();
      expect(ending.nameEn).toBeTruthy();
      expect(ending.summary).toBeTruthy();
      expect(ending.description).toBeTruthy();
      for (const eventId of ending.conditions.requiredEvents ?? []) {
        expect(eventIds.has(eventId)).toBe(true);
      }
      for (const eventId of ending.conditions.anyEvents ?? []) {
        expect(eventIds.has(eventId)).toBe(true);
      }
      for (const eventId of ending.conditions.forbiddenEvents ?? []) {
        expect(eventIds.has(eventId)).toBe(true);
      }
      for (const value of Object.values(ending.conditions.minWorld ?? {})) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }

    const fallback = ENDINGS.find((ending) => ending.fallback);
    expect(fallback?.id).toBe('ending_unresolved');
  });
});
