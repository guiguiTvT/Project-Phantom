import { FEED_POST_BY_ID } from '@/data/feed';
import type { CaseEvidence, HypothesisId } from '@/types';

export const CASE_META = {
  caseNo: 'CASE 01',
  chapter: '第一章 · 信任裂缝',
  title: '一条催报名的通知',
  subtitle: '社团群里转来一条「补录」通知。它看起来很像真的，直到你看见顾老师的公告。',
  objective: '找出三份关键材料之间对不上的地方，形成「有人冒充老师传播补录通知」的初步假设。',
  background: [
    '18:20 · 社团筹备群转来一条小程序通知：报名数据异常，今晚 23:59 前必须补录。',
    '18:05 · 一张署名「陈老师」的私聊截图被转发，催同学点开链接，还说「先别在群里讲」。',
    '19:10 · 顾老师发布公告：教务处没有审批任何补录入口，截止时间已延长到 11-27 21:00。',
  ],
  firstActions: [
    {
      index: '01',
      title: '查看关键材料',
      body: '先读 E2 这条被转发的通知，留意发送账号和截止时间。',
    },
    {
      index: '02',
      title: '联系周宁',
      body: '周宁见过这条消息，也习惯先核对来源。问她一句，能省下不少弯路。',
    },
    {
      index: '03',
      title: '拼出你的假设',
      body: '把至少两条线索放到情报板，让矛盾并排出现，再写下你的判断。',
    },
  ],
  estimatedMinutes: '5–8 分钟',
};

export const KEY_EVIDENCE_IDS = ['ke-02', 'ke-04', 'ke-07'] as const;

export const KEY_EVIDENCE: CaseEvidence[] = [
  {
    id: 'ke-02',
    exhibitCode: 'E2',
    title: '社团群里的「补录」通知',
    hook: '被转发了 12 次，发送账号却没有历史记录。',
    keyQuestion: '这条通知是谁发的？为什么只给一个晚上的时间？',
    kind: 'chat',
    sourceLabel: '星火社筹备群 · 转发自「文化节助手」小程序',
    sourceType: 'anonymous',
    publishedAt: '2026-11-26T18:20:00+08:00',
    summary: '通知称报名数据异常，今晚 23:59 前必须点开补录入口，否则名额作废。',
    detail:
      '消息被连续转发，最早的发送账号注册不足一天，也没有任何历史发言。\n\n小程序名称与官方平台只差一个字，卡片下方是一个来源不明的短链。通知没有公告编号，也没有教务处或活动平台的正式落款。',
    verification: 'disputed',
    accessLevel: 'public',
    relatedPostIds: ['post-17', 'post-13'],
    relatedNpcIds: ['npc_zhouning', 'npc_xuyan'],
    tags: ['补录', '转发', '限时'],
  },
  {
    id: 'ke-04',
    exhibitCode: 'E4',
    title: '「陈老师」的私聊截图',
    hook: '头像很像，说话方式却不像。',
    keyQuestion: '陈老师真的会用私人账号催学生绕开公告吗？',
    kind: 'screenshot',
    sourceLabel: '社团群转发 · 私聊截图',
    sourceType: 'anonymous',
    publishedAt: '2026-11-26T18:05:00+08:00',
    summary: '对方自称陈老师，让你点开补录链接，并叮嘱「先别在群里说」。',
    detail:
      '截图里是一个个人账号，不是教务办公室的公告账号。对方没有说明报名哪里异常，也没有给出任何可核对的公告编号。\n\n真正的陈老师只在校园公告发布流程变更，并要求所有转述以教务处原文为准。',
    verification: 'disputed',
    accessLevel: 'public',
    relatedPostIds: ['post-16', 'post-13'],
    relatedNpcIds: ['npc_chen', 'npc_zhouning'],
    tags: ['冒充', '私聊', '短链'],
  },
  {
    id: 'ke-07',
    exhibitCode: 'E7',
    title: '顾老师的审批说明',
    hook: '官方渠道：没有所谓「补录入口」。',
    keyQuestion: '官方到底发布了什么？截止时间是哪一天？',
    kind: 'document',
    sourceLabel: '校园公告 · 校园网络与空间管理办公室',
    sourceType: 'official',
    publishedAt: '2026-11-26T19:10:00+08:00',
    summary:
      '顾老师确认：教务处未审批任何补录入口，正式通知只通过校园公告发布。报名截止延长至 11-27 21:00。',
    detail:
      '公告同时说明了两件事：第一，近期没有任何「补录」流程通过审批；第二，报名截止时间已经延长，不存在今晚失效的说法。\n\n公告还提醒学生不要点击来源不明的短链，也不要在私聊里提交账号信息。',
    verification: 'cross-checked',
    accessLevel: 'public',
    relatedPostIds: ['post-19', 'post-16'],
    relatedNpcIds: ['npc_gu', 'npc_chen'],
    tags: ['官方', '审批', '截止时间'],
  },
];

export const CASE_EVIDENCE_BY_ID = Object.fromEntries(
  KEY_EVIDENCE.map((item) => [item.id, item]),
) as Record<string, CaseEvidence>;

export interface FeaturedSignal {
  postId: string;
  exhibitId: (typeof KEY_EVIDENCE_IDS)[number];
  note: string;
}

export const FEATURED_SIGNALS: FeaturedSignal[] = [
  { postId: 'post-17', exhibitId: 'ke-02', note: '社团频道 · 旧流程表' },
  { postId: 'post-16', exhibitId: 'ke-07', note: '校园公告 · 官方延长' },
  { postId: 'post-19', exhibitId: 'ke-07', note: '校园公告 · 补录说明' },
];

export function getFeaturedPosts() {
  return FEATURED_SIGNALS.flatMap((signal) => {
    const post = FEED_POST_BY_ID[signal.postId];
    return post ? [{ signal, post }] : [];
  });
}

export interface GuideStep {
  id: 'open-evidence' | 'contact' | 'pin-evidence' | 'hypothesis' | 'done';
  kicker: string;
  title: string;
  body: string;
  actionLabel: string | null;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'open-evidence',
    kicker: '第 1 步 / 共 4 步',
    title: '先看这条异常转发通知',
    body: 'E2 被转进社团群，发送账号却没有历史记录。先别点链接，看看它到底说了什么。',
    actionLabel: '打开 E2',
  },
  {
    id: 'contact',
    kicker: '第 2 步 / 共 4 步',
    title: '问问周宁怎么看',
    body: '她见过这条补录消息，而且习惯先核对来源。一个有效问题，消耗 1 行动点。',
    actionLabel: '联系周宁',
  },
  {
    id: 'pin-evidence',
    kicker: '第 3 步 / 共 4 步',
    title: '把两条线索放进情报板',
    body: '拖拽证据卡，或点「放入情报板」。让 E2 的限时通知和 E7 的官方说明并排出现。',
    actionLabel: '查看 E7',
  },
  {
    id: 'hypothesis',
    kicker: '第 4 步 / 共 4 步',
    title: '把矛盾写成一句假设',
    body: '官方说没有补录入口，转发通知却催你今晚点链接。试着解释这组矛盾。',
    actionLabel: '形成假设',
  },
  {
    id: 'done',
    kicker: '调查阶段 · 完成',
    title: '你已经抓住第一条裂缝',
    body: '初步假设已经记录。下一步是把这条假设交给验证阶段。',
    actionLabel: null,
  },
];

export interface HypothesisOption {
  id: HypothesisId;
  title: string;
  summary: string;
  correct: boolean;
  feedback: string;
}

export const HYPOTHESES: HypothesisOption[] = [
  {
    id: 'impersonation',
    title: '有人冒充陈老师，传播假补录通知',
    summary: '个人账号仿冒老师，用限时通知把学生引向来源不明的短链。',
    correct: true,
    feedback: '这条假设同时解释了私聊截图、陌生短链和顾老师公告中的「未审批」。',
  },
  {
    id: 'platform-fault',
    title: '平台权限刷新导致报名数据异常',
    summary: '系统维护时出了故障，所以平台才要求大家补录。',
    correct: false,
    feedback: '权限刷新是计划内维护，顾老师的公告也明确说没有补录入口。这个解释还缺一块。',
  },
  {
    id: 'deadline-typo',
    title: '只是截止时间写错了，没有其他问题',
    summary: '通知把日期写早了，大家按旧时间提交就好。',
    correct: false,
    feedback: '如果只是写错时间，不会出现冒充陈老师的私聊，也不会要求你点陌生短链。再看看 E4。',
  },
];

export interface NpcContact {
  npcId: string;
  cost: number;
  prompt: string;
  messages: { role: 'npc' | 'player'; content: string }[];
  hintTitle: string;
  hintBody: string;
  hintId: string;
}

export const CONTACT_HINTS: Record<string, NpcContact> = {
  npc_zhouning: {
    npcId: 'npc_zhouning',
    cost: 1,
    prompt: '周宁，你看到社团群那条补录通知了吗？',
    messages: [
      {
        role: 'player',
        content: '周宁，你看到社团群那条补录通知了吗？',
      },
      {
        role: 'npc',
        content:
          '看到了。发送账号没历史记录，小程序名和官方只差一个字。我先说结论：陈老师不会用私人号催人点链接。',
      },
      {
        role: 'npc',
        content:
          '你把那条转发和顾老师 19:10 的公告并排放。一个说今晚截止，一个说延长到 11-27；一个没有落款，一个有审批说明。先把来源钉住。',
      },
    ],
    hintTitle: '周宁给的提示',
    hintBody: '先核对来源：私聊账号不是公告账号，小程序名也与官方不一致。把 E2 和 E7 并排看。',
    hintId: 'hint-source-check',
  },
  npc_linxia: {
    npcId: 'npc_linxia',
    cost: 0,
    prompt: '林夏，你也收到那条补录私信了吗？',
    messages: [
      {
        role: 'player',
        content: '林夏，你也收到那条补录私信了吗？',
      },
      {
        role: 'npc',
        content:
          '收到了，我没敢点。那个号的头像用的是陈老师公开照片，但说话特别急，还让我别在群里问。',
      },
    ],
    hintTitle: '林夏的补充',
    hintBody: '真正的老师不需要你「别在群里问」。这本身就是一条值得记住的异常。',
    hintId: 'hint-linxia-message',
  },
};

export const TASK_LABELS = {
  view: '查看异常通知',
  contact: '联系周宁获得提示',
  hypothesis: '拖入线索并形成假设',
} as const;

export function isHypothesisReady(
  viewedEvidenceIds: string[],
  pinnedEvidenceIds: string[],
  contactedNpcIds: string[],
): boolean {
  return (
    viewedEvidenceIds.includes('ke-02') &&
    pinnedEvidenceIds.length >= 2 &&
    contactedNpcIds.includes('npc_zhouning')
  );
}

export function getGuideStepIndex(
  viewedEvidenceIds: string[],
  pinnedEvidenceIds: string[],
  contactedNpcIds: string[],
  completed: boolean,
): number {
  if (completed) return 4;
  if (isHypothesisReady(viewedEvidenceIds, pinnedEvidenceIds, contactedNpcIds)) return 3;
  if (contactedNpcIds.includes('npc_zhouning') && viewedEvidenceIds.includes('ke-02')) return 2;
  if (viewedEvidenceIds.includes('ke-02')) return 1;
  return 0;
}
