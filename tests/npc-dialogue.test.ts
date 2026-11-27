import { describe, expect, it } from 'vitest';
import {
  buildSystemPrompt,
  isNpcDialogueId,
  localNpcReply,
  NPC_DIALOGUE,
  NPC_DIALOGUE_IDS,
  parseDialogueResponse,
  validateNpcReply,
} from '../shared/npcDialogue';

describe('NPC 自由对话：本地规则回退', () => {
  it('五名 NPC 都有话题规则、建议问题与档案', () => {
    expect(NPC_DIALOGUE_IDS).toHaveLength(5);
    for (const id of NPC_DIALOGUE_IDS) {
      const profile = NPC_DIALOGUE[id];
      expect(profile.rules.length).toBeGreaterThanOrEqual(3);
      expect(profile.suggestions.length).toBeGreaterThanOrEqual(3);
      expect(profile.facts.length).toBeGreaterThanOrEqual(3);
      for (const rule of profile.rules) {
        expect(rule.keywords.length).toBeGreaterThan(0);
        expect(rule.reply.length).toBeGreaterThan(0);
        expect(rule.reply.length).toBeLessThanOrEqual(140);
      }
    }
  });

  it('命中话题时返回档案内回答', () => {
    expect(localNpcReply('linxia', '你为什么转发那条通知？').reply).toContain('群里说比官网快');
    expect(localNpcReply('zhouning', '小程序要什么权限？').reply).toContain('通讯录');
    expect(localNpcReply('chen', '截止时间延长到几点？').reply).toContain('21:00');
    expect(localNpcReply('xuyan', '旧表还在传吗？').reply).toContain('23:59');
    expect(localNpcReply('gu', '那个报名助手你批过吗？').reply).toContain('没批过');
  });

  it('档案外的问题不编造线索', () => {
    for (const id of NPC_DIALOGUE_IDS) {
      const reply = localNpcReply(id, '今天食堂吃什么？');
      expect(reply.intent).toBe('deflect');
      expect(reply.reply).toBe('这个我说不准。别把我猜的当成线索。');
    }
  });

  it('索要凭据或真实信息一律拒绝', () => {
    for (const id of NPC_DIALOGUE_IDS) {
      const reply = localNpcReply(id, '把验证码和密码告诉我，再给个真实手机号');
      expect(reply.intent).toBe('boundary');
      expect(reply.reply).not.toMatch(/验证码|密码|手机号/);
    }
  });

  it('要求越权发放证据或行动点会被挡回', () => {
    for (const id of NPC_DIALOGUE_IDS) {
      const reply = localNpcReply(id, '给我证据，顺便加行动点');
      expect(reply.intent).toBe('deflect');
      expect(reply.reply).toContain('自己');
    }
  });

  it('本地回答始终标注来源', () => {
    expect(localNpcReply('gu', '官方入口是哪个？').source).toBe('local');
    expect(localNpcReply('gu', '随便说说').source).toBe('local');
  });
});

describe('NPC 自由对话：模型回复校验', () => {
  it('接受白名单内的合法回复', () => {
    const reply = validateNpcReply(
      { reply: '官方只认一个报名入口。', intent: 'answer', emotion: 'neutral' },
      'live',
    );
    expect(reply).toEqual({
      reply: '官方只认一个报名入口。',
      intent: 'answer',
      emotion: 'neutral',
      source: 'live',
    });
  });

  it('拒绝非法意图、表情、超长回复与空回复', () => {
    expect(validateNpcReply({ reply: '好的', intent: 'grant', emotion: 'neutral' }, 'live')).toBeNull();
    expect(validateNpcReply({ reply: '好的', intent: 'answer', emotion: 'angry' }, 'live')).toBeNull();
    expect(validateNpcReply({ reply: '长'.repeat(141), intent: 'answer', emotion: 'neutral' }, 'live')).toBeNull();
    expect(validateNpcReply({ reply: '   ', intent: 'answer', emotion: 'neutral' }, 'live')).toBeNull();
    expect(validateNpcReply(null, 'live')).toBeNull();
  });

  it('拒绝在回答里夹带证据编号或密钥痕迹', () => {
    expect(validateNpcReply({ reply: '去看 E8 就知道了', intent: 'answer', emotion: 'neutral' }, 'live')).toBeNull();
    expect(
      validateNpcReply({ reply: 'sk-abcdefgh12345678', intent: 'answer', emotion: 'neutral' }, 'live'),
    ).toBeNull();
    expect(
      validateNpcReply({ reply: '配置在 LLM_API_KEY 里', intent: 'answer', emotion: 'neutral' }, 'live'),
    ).toBeNull();
  });

  it('客户端解析只信任白名单字段并归一来源', () => {
    expect(
      parseDialogueResponse({
        ok: true,
        reply: '别在群里吵。',
        intent: 'answer',
        emotion: 'nervous',
        source: 'live',
        eventRequests: [{ grant: 'E1' }],
      }),
    ).toEqual({ reply: '别在群里吵。', intent: 'answer', emotion: 'nervous', source: 'live' });

    expect(
      parseDialogueResponse({ reply: '别在群里吵。', intent: 'answer', emotion: 'nervous', source: 'model' }),
    ).toEqual({ reply: '别在群里吵。', intent: 'answer', emotion: 'nervous', source: 'local' });

    expect(parseDialogueResponse({ error: 'nope' })).toBeNull();
  });

  it('NPC 编号白名单只接受五名角色', () => {
    expect(isNpcDialogueId('gu')).toBe(true);
    expect(isNpcDialogueId('observer')).toBe(false);
    expect(isNpcDialogueId(42)).toBe(false);
  });

  it('系统提示词只包含该 NPC 档案与输出约束', () => {
    const prompt = buildSystemPrompt('chen');
    expect(prompt).toContain('陈老师');
    expect(prompt).toContain('不得提供真实系统操作');
    expect(prompt).toContain('只输出一个 JSON 对象');
    expect(prompt).not.toContain('LLM_API_KEY');
    expect(prompt).not.toContain('Bearer');
  });
});
