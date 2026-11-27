import type { EndingConfig } from '@/types';

/**
 * 结局判定顺序 = priority 从高到低；同级按 order。
 * fallback 结局不参与条件匹配，只在其他结局均不满足时使用。
 */
export const ENDINGS: EndingConfig[] = [
  {
    id: 'ending_domino',
    order: 5,
    nameCn: '多米诺',
    nameEn: 'Domino',
    code: '05 / DOMINO',
    themeColor: '#E76B78',
    priority: 100,
    summary: '风险未被及时控制，连锁事件沿着未被处理的裂缝扩散。',
    description:
      '你看见了一些东西，也做对了一些事，但关键节点之间的时间被耗尽。报名异常、误解与权限积压彼此推动，活动仍在继续，代价却被推到了下一轮。',
    criteria: '出现未解决积压事件，或安全态势跌破警戒线。',
    keySignals: ['存在未解决的积压问题', '安全态势处于低位', '关键风险在窗口期内未被处理'],
    conditions: {
      anyEvents: ['ev_cascade'],
    },
  },
  {
    id: 'ending_dawn',
    order: 1,
    nameCn: '破晓',
    nameEn: 'Dawn',
    code: '01 / DAWN',
    themeColor: '#52D6D0',
    priority: 90,
    summary: '主要风险得到修复，校园活动恢复，信任有了新的支点。',
    description:
      '你没有把「安全」当成关闭一切的借口。异常入口被收回，核验流程补上了缺口，活动在可解释的规则下继续。至少在这一处，信任被重新建立。',
    criteria: '安全、运行与修复均达到高位，风险控制与秩序恢复事件均已发生。',
    keySignals: ['风险得到初步控制', '校园秩序逐渐恢复', '证据链足以支撑关键判断'],
    conditions: {
      minWorld: { security: 72, operation: 58, relations: 62, repair: 55 },
      anyEvents: ['ev_risk_contained'],
      forbiddenEvents: ['ev_unresolved_backlog'],
      minCollectedEvidence: 5,
      minVerifiedHypotheses: 1,
      minContradictions: 2,
    },
  },
  {
    id: 'ending_isolation',
    order: 4,
    nameCn: '孤岛',
    nameEn: 'Isolation',
    code: '04 / ISOLATION',
    themeColor: '#8A9CB5',
    priority: 80,
    summary: '风险受到控制，但过度限制影响了正常校园生活。',
    description:
      '你成功关上了大部分门，也把一些本该继续的通道一起关掉了。安全态势稳定，运行状态却长期低迷；同学们遵守规则，却不再愿意主动沟通。',
    criteria: '安全态势较高，但校园运行状态明显低于正常水平。',
    keySignals: ['安全指标稳定', '运行与关系受到持续限制', '保护措施的成本高于收益'],
    conditions: {
      minWorld: { security: 60 },
      maxWorld: { operation: 52 },
      requiredEvents: ['ev_reversal'],
    },
  },
  {
    id: 'ending_consensus',
    order: 2,
    nameCn: '共识',
    nameEn: 'Consensus',
    code: '02 / CONSENSUS',
    themeColor: '#7ED7B0',
    priority: 70,
    summary: '通过协调与沟通，形成了一套可靠的协作核验机制。',
    description:
      '真正改变局面的不是某一次漂亮的判断，而是信息开始在人与人之间正确地流动。志愿者、学生与管理员形成了可重复的核对方式，风险被集体识别。',
    criteria: '校园关系显著恢复，多方协调事件发生，且未出现未解决积压。',
    keySignals: ['NPC 之间形成协作', '关系状态处于高位', '误解被持续纠正'],
    conditions: {
      minWorld: { security: 55, operation: 55, relations: 68 },
      requiredEvents: ['ev_npc_coordination'],
      forbiddenEvents: ['ev_unresolved_backlog'],
      minCollectedEvidence: 5,
    },
  },
  {
    id: 'ending_rebuild',
    order: 3,
    nameCn: '新秩序',
    nameEn: 'Rebuild',
    code: '03 / REBUILD',
    themeColor: '#7FA8E8',
    priority: 60,
    summary: '通过规则与制度调整，实现了一次系统性修复。',
    description:
      '你把问题写进了流程：通知必须带来源与更新时间，转述必须注明转述。单个事件结束了，但新的规则会继续保护后来的人。',
    criteria: '新的核验规则生效，修复程度与安全态势达到较高水平。',
    keySignals: ['新的核验规则生效', '系统性修复推进', '流程被写进可复用的规范'],
    conditions: {
      minWorld: { security: 55, repair: 58 },
      requiredFlags: ['new_policy'],
      forbiddenEvents: ['ev_unresolved_backlog'],
      minVerifiedHypotheses: 1,
    },
  },
  {
    id: 'ending_unresolved',
    order: 6,
    nameCn: '未完待续',
    nameEn: 'Unresolved',
    code: '06 / UNRESOLVED',
    themeColor: '#E8B46A',
    priority: 0,
    fallback: true,
    summary: '部分问题得到解决，但仍存在未确认的隐患。',
    description:
      '活动恢复了，讨论也暂时平息。你知道有些说法还没有被完全核实，有些门只是被关上而不是被修好。故事在这里停下，但问题没有。',
    criteria: '未满足其他结局条件时的兜底结局。',
    keySignals: ['部分风险已处理', '仍有未确认的信息', '系统尚未完全恢复'],
    conditions: {},
  },
];

export const ENDING_BY_ID = Object.fromEntries(
  ENDINGS.map((ending) => [ending.id, ending]),
) as Record<string, EndingConfig>;

export const ENDING_PRIORITY = [...ENDINGS].sort((a, b) => b.priority - a.priority || a.order - b.order);
