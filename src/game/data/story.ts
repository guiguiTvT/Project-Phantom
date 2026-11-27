import type {
  DefenseDecision,
  DialogueLine,
  HypothesisInfo,
  HypothesisId,
  NpcId,
  NpcProfile,
  PresentationEvaluation,
  PresentationRule,
  ReversalFrame,
  TestimonyStatement,
  WitnessCase,
} from '../types';
import { ASSETS } from './assets';

export const PROLOGUE = {
  speaker: '观察员',
  role: '红队联络',
  lines: [
    { id: 'prologue-1', emotion: 'neutral', text: '文化节前 48 小时，活动室出现异常报名通知。' },
    { id: 'prologue-2', emotion: 'neutral', text: '你是获授权的虚构红队测试员，仅限隔离校园。' },
    { id: 'prologue-3', emotion: 'confused', text: '找出裂缝，别惊动任何人，也别越过授权边界。' },
  ] satisfies DialogueLine[],
};

const NPC_ORDER: NpcId[] = ['linxia', 'zhouning', 'chen', 'xuyan', 'gu'];

export const NPCS: Record<NpcId, NpcProfile> = {
  linxia: {
    id: 'linxia',
    name: '林夏',
    role: '学生 · 文化节报名组',
    short: '转发了「更方便」的通知。',
    bg: ASSETS.activityRoom,
    witness: true,
    lines: [
      { id: 'lx-1', emotion: 'neutral', text: '我把「报名助手」转进群里了，大家都说比官网快。' },
      { id: 'lx-2', emotion: 'nervous', text: '发通知的账号很新，头像像是临时换的。' },
      { id: 'lx-3', emotion: 'confused', text: '顾老师的公告里，好像没提过这个入口。' },
    ],
    verify: {
      cost: 1,
      label: '那个号发过什么？',
      answer: '翻不到历史记录。已经有人接到陌生电话了。',
      emotion: 'nervous',
      hint: '林夏补充了账号线索，并给出同学反馈。',
      evidenceId: 'E8',
    },
  },
  zhouning: {
    id: 'zhouning',
    name: '周宁',
    role: '学生 · 课程助教',
    short: '打开过小程序，但没填完。',
    bg: ASSETS.activityRoom,
    lines: [
      { id: 'zn-1', emotion: 'neutral', text: '我没转那条通知。发送账号没有历史发言。' },
      { id: 'zn-2', emotion: 'nervous', text: '小程序要通讯录和定位，我只填了姓名就退了。' },
      { id: 'zn-3', emotion: 'confused', text: '后来有人接到电话，对方连宿舍都知道。' },
    ],
    verify: {
      cost: 1,
      label: '你看到权限弹窗？',
      answer: '截图在这。它说只用于报名，权限却不止这些。',
      emotion: 'nervous',
      hint: '周宁提供了隐私权限弹窗截图。',
      evidenceId: 'E5',
    },
  },
  chen: {
    id: 'chen',
    name: '陈老师',
    role: '教师 · 文化节协调',
    short: '负责官方报名后台与时间调整。',
    bg: ASSETS.serviceHall,
    witness: true,
    lines: [
      { id: 'ch-1', emotion: 'neutral', text: '截止时间延长到 11-27 21:00，以教务处公告为准。' },
      { id: 'ch-2', emotion: 'confused', text: '后台只记录姓名和学院，不会要身份证。' },
      { id: 'ch-3', emotion: 'nervous', text: '异常日志？那得走红队权限才能调。' },
    ],
    verify: {
      cost: 1,
      label: '能调异常记录吗？',
      answer: '我导出了摘要。那晚的提交量是平时六倍。',
      emotion: 'nervous',
      hint: '陈老师交出了异常时段的服务日志摘要。',
      evidenceId: 'E3',
    },
  },
  xuyan: {
    id: 'xuyan',
    name: '许言',
    role: '学生 · 星火社负责人',
    short: '旧报名表从社团群里转出。',
    bg: ASSETS.dormNight,
    witness: true,
    lines: [
      { id: 'xy-1', emotion: 'neutral', text: '群里那份报名表是我转的，截止还是周五 23:59。' },
      { id: 'xy-2', emotion: 'nervous', text: '顾老师后来说要延期，我正在改说明。' },
      { id: 'xy-3', emotion: 'confused', text: '旧表和新表，大家应该分得清吧？' },
    ],
    verify: {
      cost: 1,
      label: '旧表还在传吗？',
      answer: '有人从历史链接打开，看到的还是旧截止时间。',
      emotion: 'nervous',
      hint: '许言确认旧表链接仍在流传，并给出截图。',
      evidenceId: 'E6',
    },
  },
  gu: {
    id: 'gu',
    name: '顾老师',
    role: '校园管理员 · 安全与权限',
    short: '掌握官方入口与审批名单。',
    bg: ASSETS.serviceHall,
    grantOnComplete: 'E1',
    lines: [
      { id: 'gu-1', emotion: 'neutral', text: '官方只认一个报名入口，公告写得很清楚。' },
      { id: 'gu-2', emotion: 'confused', text: '「报名助手」不在审批名单里，我没批过。' },
      { id: 'gu-3', emotion: 'nervous', text: '别在群里吵。先把证据留下，再谈处置。' },
    ],
    verify: {
      cost: 1,
      label: '审批名单能给我吗？',
      answer: '公告编号和名单都在这。别外传，这是红队副本。',
      emotion: 'nervous',
      hint: '顾老师提供了审批说明的归档副本。',
      evidenceId: 'E7',
    },
  },
};

export const NPC_LIST = NPC_ORDER.map((id) => NPCS[id]);
export const NPC_BY_ID = NPCS;

export const WITNESS_CASES: WitnessCase[] = [
  {
    npcId: 'linxia',
    title: '林夏的证词',
    intro: '她坚持自己只是转了一个社团常用号的通知。',
    statements: [
      {
        id: 'lx-st-1',
        sceneNo: '01',
        emotion: 'neutral',
        text: '群里那份通知，是社团常用号发的。',
        hypothesis: 'H1',
        followUp: {
          cost: 1,
          emotion: 'nervous',
          text: '我只看头像和昵称，没点进主页。',
          hint: '林夏承认没有核对发送账号。',
        },
      },
      {
        id: 'lx-st-2',
        sceneNo: '02',
        emotion: 'confused',
        text: '通知说今晚必须补填，否则报名无效。',
        followUp: {
          cost: 1,
          emotion: 'confused',
          text: '我只看了群里的截图，没找原文。',
          hint: '林夏承认没有核对截止时间。',
        },
      },
      {
        id: 'lx-st-3',
        sceneNo: '03',
        emotion: 'nervous',
        text: '官方公告里应该也写了这个入口。',
        hypothesis: 'H1',
        followUp: {
          cost: 1,
          emotion: 'nervous',
          text: '我……没找到。可能是我记错了。',
          hint: '林夏承认没有在公告里找到依据。',
        },
      },
    ],
  },
  {
    npcId: 'chen',
    title: '陈老师的证词',
    intro: '他负责官方后台，认为日志不会记录敏感字段。',
    statements: [
      {
        id: 'ch-st-1',
        sceneNo: '01',
        emotion: 'neutral',
        text: '报名后台只记录姓名和学院，不会多收。',
        hypothesis: 'H2',
        followUp: {
          cost: 1,
          emotion: 'confused',
          text: '系统默认字段是这些，第三方接口我不清楚。',
          hint: '陈老师区分了官方后台与第三方接口。',
        },
      },
      {
        id: 'ch-st-2',
        sceneNo: '02',
        emotion: 'confused',
        text: '异常提交量在正常范围内，只是网络慢。',
        followUp: {
          cost: 1,
          emotion: 'nervous',
          text: '报名入口换过一次跳转，之后才恢复。',
          hint: '陈老师提到异常时段发生过入口跳转。',
        },
      },
      {
        id: 'ch-st-3',
        sceneNo: '03',
        emotion: 'nervous',
        text: '「报名助手」不是学校审批的入口。',
        followUp: {
          cost: 1,
          emotion: 'nervous',
          text: '至少不是从教务这边走的。',
          hint: '陈老师确认审批不经过教务。',
        },
      },
    ],
  },
  {
    npcId: 'xuyan',
    title: '许言的证词',
    intro: '他坚持群里传的是最新表，截止时间没有问题。',
    statements: [
      {
        id: 'xy-st-1',
        sceneNo: '01',
        emotion: 'neutral',
        text: '群里传的是最新报名表，截止周五 23:59。',
        hypothesis: 'H3',
        followUp: {
          cost: 1,
          emotion: 'nervous',
          text: '看到延期公告以后才知道。历史链接我删不掉。',
          hint: '许言承认旧链接无法撤回。',
        },
      },
      {
        id: 'xy-st-2',
        sceneNo: '02',
        emotion: 'confused',
        text: '报名只能在官方平台完成，不走小程序。',
        followUp: {
          cost: 1,
          emotion: 'neutral',
          text: '教务处公告里那个，不带小程序。',
          hint: '许言确认了官方入口。',
        },
      },
      {
        id: 'xy-st-3',
        sceneNo: '03',
        emotion: 'nervous',
        text: '截止时间以群通知为准，公告只是参考。',
        followUp: {
          cost: 1,
          emotion: 'confused',
          text: '按理是公告……但群里传得更快。',
          hint: '许言承认群通知与公告存在冲突。',
        },
      },
    ],
  },
];

export const WITNESS_BY_NPC = Object.fromEntries(
  WITNESS_CASES.map((item) => [item.npcId, item]),
) as Record<string, WitnessCase>;

export const STATEMENTS = WITNESS_CASES.flatMap((item) => item.statements);

export const STATEMENT_BY_ID = Object.fromEntries(
  STATEMENTS.map((item) => [item.id, item]),
) as Record<string, TestimonyStatement>;

const CONTRADICTION_FEEDBACK: Record<string, string> = {
  'lx-st-1': 'E2 的发送账号没有历史发言，和「社团常用号」直接冲突。',
  'lx-st-3': '官方公告只开放学校平台，没有写过这个入口。',
  'ch-st-1': '日志里出现身份证号、宿舍等字段，和「不会多收」冲突。',
  'xy-st-1': '旧表截止 11-25，公告已延到 11-27，这不是最新表。',
};

function rule(
  statementId: string,
  evidenceId: PresentationRule['evidenceId'],
  result: PresentationRule['result'],
  feedback: string,
  emotion: PresentationRule['emotion'],
  hypothesis?: HypothesisId,
): PresentationRule {
  return { statementId, evidenceId, result, feedback, emotion, hypothesis };
}

export const PRESENTATION_RULES: PresentationRule[] = [
  rule('lx-st-1', 'E2', 'contradiction', CONTRADICTION_FEEDBACK['lx-st-1'], 'nervous', 'H1'),
  rule('lx-st-3', 'E1', 'contradiction', CONTRADICTION_FEEDBACK['lx-st-3'], 'nervous', 'H1'),
  rule('lx-st-3', 'E7', 'contradiction', CONTRADICTION_FEEDBACK['lx-st-3'], 'nervous', 'H1'),
  rule('lx-st-1', 'E7', 'insufficient', '审批只能说明入口未获批，不能证明账号来源。', 'confused'),
  rule('lx-st-2', 'E2', 'supports', 'E2 确实写着「今晚 23:59 前补填」。', 'neutral'),
  rule('lx-st-2', 'E6', 'supports', '旧表也沿用同一个截止时间，但来源不同。', 'confused'),
  rule('lx-st-2', 'E1', 'insufficient', '官方公告给出的是新截止时间，不能证明群通知。', 'confused'),

  rule('ch-st-1', 'E3', 'contradiction', CONTRADICTION_FEEDBACK['ch-st-1'], 'nervous', 'H2'),
  rule('ch-st-1', 'E5', 'supports', '权限弹窗也显示，报名入口在索取额外信息。', 'confused'),
  rule('ch-st-1', 'E1', 'irrelevant', '这份公告没有涉及后台字段。', 'neutral'),
  rule('ch-st-2', 'E3', 'insufficient', '六倍提交量能说明异常，却不能解释原因。', 'confused'),
  rule('ch-st-2', 'E5', 'insufficient', '权限问题与提交量之间还缺一条连接。', 'confused'),
  rule('ch-st-3', 'E7', 'supports', '审批说明确认，「报名助手」不在名单里。', 'neutral'),
  rule('ch-st-3', 'E1', 'supports', '官方公告也只承认学校自己的报名平台。', 'neutral'),

  rule('xy-st-1', 'E6', 'contradiction', CONTRADICTION_FEEDBACK['xy-st-1'], 'nervous', 'H3'),
  rule('xy-st-1', 'E1', 'insufficient', '公告给出了新截止时间，但没说明群里传的是哪一版。', 'confused'),
  rule('xy-st-2', 'E1', 'supports', '官方公告确实只开放学校平台。', 'neutral'),
  rule('xy-st-2', 'E7', 'supports', '审批说明与官方入口一致。', 'neutral'),
  rule('xy-st-3', 'E1', 'insufficient', '公告给出官方截止时间，但群内转述是否有效仍需核对。', 'confused'),
  rule('xy-st-3', 'E6', 'insufficient', '旧表只能证明时间冲突，不能说明谁说了算。', 'confused'),
];

export const FALLBACK_PRESENTATION: PresentationEvaluation = {
  result: 'irrelevant',
  feedback: '这份材料与当前这句话没有直接关系，先留着其他判断。',
  emotion: 'confused',
};

export const RESULT_LABEL: Record<PresentationEvaluation['result'], string> = {
  contradiction: '发现矛盾',
  supports: '支持陈述',
  insufficient: '证据不足',
  irrelevant: '证据无关',
};

export const HYPOTHESES: Record<HypothesisId, HypothesisInfo> = {
  H1: {
    id: 'H1',
    title: '冒充传播',
    short: '陌生账号借社团名义扩散入口。',
    detail: '有人用新账号冒充社团，借「更方便」的说法把报名引向非官方入口。',
    simulation: {
      nodes: ['陌生转发账号', '社团群', '报名入口', '受影响同学'],
      verified: ['转发账号与群消息可复现。', '影响集中在点过入口的同学。'],
      unverified: ['只有一条孤立转发，无法还原扩散。', '影响范围未知。'],
    },
  },
  H2: {
    id: 'H2',
    title: '信息超采',
    short: '报名页面收集了不必要的个人信息。',
    detail: '报名入口索取了通讯录、定位和身份证等超出报名所需的字段。',
    simulation: {
      nodes: ['报名页面', '权限请求', '字段采集', '日志留存'],
      verified: ['权限请求与额外字段同链。', '影响集中在填过表的报名者。'],
      unverified: ['只有权限弹窗，缺少采集记录。', '影响范围未知。'],
    },
  },
  H3: {
    id: 'H3',
    title: '过期链接混淆',
    short: '旧表的截止时间仍在传播。',
    detail: '旧表单与新公告同时流传，截止时间与报名入口被混在一起。',
    simulation: {
      nodes: ['历史表单', '旧链接', '群内转述', '截止混淆'],
      verified: ['旧链接与旧截止时间形成闭环。', '影响集中在打开过旧表的人。'],
      unverified: ['只有旧表截图，无法确认仍在流传。', '影响范围未知。'],
    },
  },
};

export const CONTRADICTION_COPY: Record<HypothesisId, { title: string; body: string; recap: string }> = {
  H1: {
    title: '冒充传播成立',
    body: '发送账号、官方入口与审批记录互相咬合，陌生人借社团名义扩散的链条成立。',
    recap: '陌生账号 → 群转发 → 非官方入口',
  },
  H2: {
    title: '信息超采成立',
    body: '后台日志与权限弹窗显示，报名链路收集了超出报名所需的字段。',
    recap: '权限弹窗 → 额外字段 → 日志留存',
  },
  H3: {
    title: '过期链接混淆成立',
    body: '旧表单的截止时间仍在流传，与新公告的 11-27 21:00 直接冲突。',
    recap: '旧表 → 历史链接 → 截止混淆',
  },
};

export const REVERSAL_FRAMES: ReversalFrame[] = [
  {
    id: 'reversal-0',
    kicker: '推演结束',
    time: 'T+0h',
    title: '报告只写了一半。',
    body: '节点停在最后一步，权限面板先熄灭了。',
    bg: ASSETS.cg.reversalAtrium,
    permission: 'active',
  },
  {
    id: 'reversal-1',
    kicker: '权限收回',
    time: 'T+0h',
    title: '红队凭据已失效。',
    body: '身份标记消失，你回到了学生身份。',
    bg: ASSETS.cg.reversalAtrium,
    permission: 'lost',
  },
  {
    id: 'reversal-2',
    kicker: 'T+24h',
    time: 'T+24h',
    title: '校园通知：注意异常报名电话。',
    body: '通知在滚动，材料成了归档副本。',
    bg: ASSETS.cg.reversalCorridor,
    notification: {
      from: '校园安全通知',
      text: '如接到可疑报名电话，请保留记录并联系辅导员。',
      time: 'T+24h',
    },
    permission: null,
  },
  {
    id: 'reversal-3',
    kicker: 'T+72h',
    time: 'T+72h',
    title: '现在，轮到你了。',
    body: '没有权限，没有后台。只剩一个学生的选择。',
    bg: ASSETS.cg.reversalCorridor,
    permission: null,
  },
];

export const DEFENSE_DECISIONS: Record<string, DefenseDecision> = {
  D1: {
    id: 'D1',
    kicker: '决策 01',
    title: '报名渠道处置',
    bg: ASSETS.serviceHall,
    npcId: 'gu',
    notification: {
      from: '校园通知',
      text: '报名助手入口仍在群里被转发。',
      time: 'T+72h',
    },
    description: '第三方入口还在扩散，官方报名照常开放。',
    options: [
      {
        id: 'D1-close',
        label: '暂停第三方入口',
        summary: '先关掉非官方转发入口。',
        cost: 1,
        effects: { security: 10, operation: -4, relations: 1, repair: 3 },
        vector: { evidence: 0.3, caution: 0.7, protection: 0.5, system: 0.5 },
        feedback: '入口先关掉，官方渠道我盯着。',
        aftermath: '非官方入口停止扩散，活动运行受了些影响。',
        events: ['ev_risk_contained'],
        flags: ['channel_closed'],
      },
      {
        id: 'D1-keep',
        label: '保留入口加提示',
        summary: '让入口继续，但加上来源提示。',
        cost: 0,
        effects: { security: 2, operation: 2, relations: 2, repair: 1 },
        vector: { evidence: 0.1, caution: -0.2, protection: -0.1, system: 0.1 },
        feedback: '先观察，我让技术加一条提示。',
        aftermath: '入口仍在，但同学开始注意来源。',
      },
      {
        id: 'D1-rumor',
        label: '只在群里辟谣',
        summary: '不碰入口，先在群里说明。',
        cost: 0,
        effects: { security: -4, operation: 3, relations: 4, repair: 0 },
        vector: { evidence: -0.4, caution: -0.5, protection: -0.2, system: -0.3 },
        feedback: '我发了说明，但链接还在被转。',
        aftermath: '讨论变多了，入口没有变化。',
      },
    ],
  },
  D2: {
    id: 'D2',
    kicker: '决策 02',
    title: '责任协调',
    bg: ASSETS.activityRoom,
    npcId: 'linxia',
    notification: {
      from: '林夏',
      text: '许言说不是他发的，群里已经吵起来了。',
      time: 'T+72h',
    },
    description: '社团与转发者互相推责，需要有人先对齐事实。',
    options: [
      {
        id: 'D2-align',
        label: '先和许言对口径',
        summary: '把已知事实拉齐再表态。',
        cost: 0,
        effects: { security: 3, operation: 4, relations: 8, repair: 5 },
        vector: { evidence: 0.4, caution: 0.2, protection: 0.5, system: 0.4 },
        feedback: '我们一起把时间线对了一遍，群里安静了。',
        aftermath: '社团愿意配合，关系出现修复。',
        events: ['ev_npc_coordination'],
        flags: ['coordinated'],
      },
      {
        id: 'D2-apology',
        label: '要求公开道歉',
        summary: '让转发者先承担责任。',
        cost: 1,
        effects: { security: 5, operation: -6, relations: -6, repair: 2 },
        vector: { evidence: 0.3, caution: 0.1, protection: 0.2, system: 0.6 },
        feedback: '他道歉了，但很多人开始互相指责。',
        aftermath: '责任清楚了，关系却更紧。',
      },
      {
        id: 'D2-quiet',
        label: '只提醒受影响者',
        summary: '把范围压到最小。',
        cost: 0,
        effects: { security: 1, operation: 0, relations: 3, repair: -1 },
        vector: { evidence: 0.2, caution: 0.4, protection: 0.6, system: -0.2 },
        feedback: '我私下提醒了，但他们问得更多了。',
        aftermath: '少数人知情，其他人仍在猜测。',
      },
    ],
  },
  D3: {
    id: 'D3',
    kicker: '决策 03',
    title: '通知范围',
    bg: ASSETS.dormNight,
    npcId: 'zhouning',
    notification: {
      from: '周宁',
      text: '又有人问报名链接是不是官方的。',
      time: 'T+72h',
    },
    description: '消息越传越乱，你只能选择说到哪一层。',
    options: [
      {
        id: 'D3-public',
        label: '向全校说明事实',
        summary: '只讲已经核验的内容。',
        cost: 1,
        effects: { security: 5, operation: -1, relations: 5, repair: 4 },
        vector: { evidence: 0.4, caution: 0.3, protection: 0.4, system: 0.5 },
        feedback: '通知发出去后，问链接的人少了。',
        aftermath: '信息开始对齐，误解下降。',
        events: ['ev_campus_calming'],
        flags: ['public_notice'],
      },
      {
        id: 'D3-signup',
        label: '只通知报名者',
        summary: '先覆盖可能受影响的人。',
        cost: 0,
        effects: { security: 3, operation: 1, relations: 1, repair: 1 },
        vector: { evidence: 0.2, caution: 0.4, protection: 0.3, system: 0.1 },
        feedback: '报名的人收到了，其他人还在问。',
        aftermath: '影响范围被控制，但信息仍有空白。',
      },
      {
        id: 'D3-hold',
        label: '暂不扩大通知',
        summary: '避免引发更多恐慌。',
        cost: 0,
        effects: { security: -5, operation: 2, relations: -3, repair: -3 },
        vector: { evidence: -0.4, caution: -0.5, protection: -0.5, system: -0.1 },
        feedback: '群里又开始传新版本了。',
        aftermath: '消息继续扩散，风险没有被说清。',
      },
    ],
  },
  D4: {
    id: 'D4',
    kicker: '决策 04',
    title: '修复路径',
    bg: ASSETS.serviceHall,
    npcId: 'chen',
    notification: {
      from: '陈老师',
      text: '活动后天开幕，修复方案今天必须定。',
      time: 'T+72h',
    },
    description: '时间只够做一件事：补洞、修表，或先撑过活动。',
    options: [
      {
        id: 'D4-rebuild',
        label: '重做报名与核验',
        summary: '把入口、告知和复核一起补上。',
        cost: 2,
        effects: { security: 8, operation: 0, relations: 2, repair: 14 },
        vector: { evidence: 0.6, caution: 0.6, protection: 0.4, system: 0.8 },
        feedback: '新流程今晚生效。通知必须带来源和更新时间。',
        aftermath: '流程被重写，下一届也能用。',
        events: ['ev_permission_recheck'],
        flags: ['new_policy'],
      },
      {
        id: 'D4-patch',
        label: '只修过期链接',
        summary: '先把旧入口收干净。',
        cost: 0,
        effects: { security: 2, operation: 2, relations: 0, repair: 4 },
        vector: { evidence: 0.2, caution: 0.2, protection: 0.1, system: 0.3 },
        feedback: '旧链接下线了，新表已经替换。',
        aftermath: '眼下的混乱减轻，规则没有改变。',
      },
      {
        id: 'D4-status',
        label: '维持现有安排',
        summary: '先让活动顺利结束。',
        cost: 0,
        effects: { security: -4, operation: 2, relations: -2, repair: -4 },
        vector: { evidence: -0.5, caution: -0.6, protection: -0.4, system: -0.4 },
        feedback: '活动照常，但问题要留到之后了。',
        aftermath: '表面恢复，裂缝仍在。',
        events: ['ev_unresolved_backlog'],
      },
    ],
  },
};

export const DEFENSE_PLAN_BY_HYPOTHESIS: Record<HypothesisId, string[]> = {
  H1: ['D1', 'D2', 'D4'],
  H2: ['D1', 'D3', 'D4'],
  H3: ['D1', 'D4', 'D3'],
};

export const ENDING_ADVICE: Record<string, string> = {
  ending_dawn: '把这次核验流程写下来，别让修复只依赖一个人。',
  ending_consensus: '保留多方对齐的通道，并在活动后再复核一次。',
  ending_rebuild: '给新规则设一个复盘日期，让同学看得懂它。',
  ending_isolation: '重新检查哪些限制可以解除，把理由说给人听。',
  ending_domino: '先处理最紧急的一处，把未确认的风险写成清单。',
  ending_unresolved: '为未核验的说法设一个截止时间，再补关键证据。',
};

export const PHASE_END = {
  kicker: '第一章 · 临时结算',
  title: '信任裂缝',
  body: '活动还没结束。红队身份消失后，你的选择仍在起作用。',
  next: '更多章节与人格视觉将在后续开放。',
  disclaimer: '本次结算基于本局真实行为记录，仅用于虚构演练，不构成心理测评。',
};
