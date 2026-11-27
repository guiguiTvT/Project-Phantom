import type { Person } from './chapterDialogue.ts';

export const CAMPAIGN_SCOPES = ['festival', 'job', 'camera', 'voice'] as const;
export type CampaignScope = typeof CAMPAIGN_SCOPES[number];
export const CAMPAIGN_MEMORY = ['festival-formal', 'festival-team', 'job-team', 'lin-saved'] as const;
export type CampaignMemory = typeof CAMPAIGN_MEMORY[number];

interface CaseFact {
  id: string;
  cues: string[];
  line: string;
  evidence?: string;
  memory?: CampaignMemory;
}
interface CaseContact {
  intro: string;
  questions: readonly string[];
  facts: CaseFact[];
}

export const CAMPAIGN_CONTACTS: Record<CampaignScope, Partial<Record<Person, CaseContact>>> = {
  festival: {
    linxia: {
      intro: '我刚把那条报名消息转到社团群。你想先对一下它的出处吗？',
      questions: ['你是从哪儿转的？', '群里的教师署名可靠吗？', '你能帮忙做什么？'],
      facts: [
        { id: 'f-source', cues: ['哪', '转', '来源', '群'], line: '我在筹备群看到的。请把我转出来的那份和学校发的本届公告对照。' },
        { id: 'f-byline', cues: ['教师', '署名', '头像', '可靠', '本人'], line: '我只认得名字，没有对过账号。可以从校园通讯录找陈老师本人。' },
        { id: 'f-correct', cues: ['帮', '更正', '负责'], line: '我能找到我转发过的群。老师身份和审批有了独立依据以后，我可以把更正送回去。' },
      ],
    },
    zhouning: {
      intro: '有同学填了旧表，还有人提到陌生来电。两件事得分开说。',
      questions: ['怎样判断是上届表单？', '那次电话能说明什么？'],
      facts: [
        { id: 'f-date', cues: ['旧', '表单', '上届', '日期'], line: '用本届公告核对旧表页首的届次和截止日期。有过期证据就单列出来。' },
        { id: 'f-call', cues: ['电话', '泄露', '来源'], line: '那位同学只能确认两件事的时间顺序。要判断资料流向，我们还缺可核实的记录。' },
      ],
    },
    chen: {
      intro: '你从学校通讯录联系到了我。先核对群消息的账号标识。',
      questions: ['群名能确认是本人吗？', '你核对过那个账号了吗？'],
      facts: [
        { id: 'f-identity', cues: ['群', '本人', '确认', '账号', '核对'], line: '先拿到原消息，再用学校通讯录独立核对账号标识。' },
        { id: 'f-verified', cues: ['群', '本人', '确认', '账号', '核对'], line: '我已经独立核对过，那个临时号和我无关。', evidence: 'FChen' },
      ],
    },
    xuyan: {
      intro: '我是许言，活动名单要按时交。你先说说两个入口哪里对不上。',
      questions: ['你同意助手试用了吗？', '你能撤哪条消息？'],
      facts: [
        { id: 'f-trial', cues: ['助手', '试用', '同意', '接入'], line: '我同意在筹备环节试试。学校的审批需要从顾老师和正式记录确认。' },
        { id: 'f-group', cues: ['撤', '谁', '更正', '群'], line: '我能撤社团群置顶并补发核实过的报名入口。校内平台的处置由顾老师执行。' },
        { id: 'f-formal', cues: ['接着', '刚才', '处理', '更正'], line: '你刚才把正式核验交给顾老师。我会准备社团更正和后续补登记。', memory: 'festival-formal' },
        { id: 'f-team', cues: ['接着', '刚才', '处理', '更正'], line: '刚才分工明确了。我负责社团置顶，林夏负责把更正传回她的群。', memory: 'festival-team' },
      ],
    },
    gu: {
      intro: '把本届的记录拿过来。我们先确认依据，再确定我能执行什么。',
      questions: ['审批看哪一份？', '什么时候能定向处理？'],
      facts: [
        { id: 'f-permit', cues: ['审批', '批准', '入口', '名单'], line: '先核对本届信息中心的名单，再带上助手标识来核查，注意区分校内试用和正式批准。' },
        { id: 'f-admin', cues: ['处理', '定向', '执行', '回执'], line: '处置分三块：冒用账号、助手接入、旧表单。核实到的范围会写进执行回执。' },
      ],
    },
  },
  job: {
    zhouning: {
      intro: '钱确实到过账。任务和后来的要求我分开存了，想从哪件看？',
      questions: ['先有到账还是先要垫付？', '从哪儿能核实招聘授权？'],
      facts: [
        { id: 'j-order', cues: ['到账', '先', '垫付', '时间', '任务'], line: '我先做了一次标注，收到 20 元，第二天才收到要我垫钱的要求。我没有付款。' },
        { id: 'j-authority', cues: ['公司', '企业', '核实', '授权', '回复'], line: '把岗位说明带给企业自己的招聘渠道。查是否为他们发布，或者有授权。' },
        { id: 'j-checked', cues: ['公司', '企业', '核实', '授权', '回复'], line: '企业原有渠道已经回复，没有发布这份实习，也没有授权该招募人。', evidence: 'JOfficial' },
      ],
    },
    gu: {
      intro: '这是单独的实习事件。先把资料交给校内负责该发布渠道的人。',
      questions: ['发布负责人能处理什么？', '受影响同学如何求助？'],
      facts: [
        { id: 'j-publish', cues: ['负责', '发布', '处理', '撤'], line: '校内负责人可以撤下招募信息、核对提交记录，并向受影响的人发出消息。要等执行回执。' },
        { id: 'j-help', cues: ['同学', '求助', '资料', '协助'], line: '保存招聘与资金记录，分开写哪些资料已提交、哪些钱已支付，再把材料交给负责人。' },
      ],
    },
  },
  camera: {
    zhouning: {
      intro: '可以把你愿意给我看的两张图拿来。我能帮你看它们写的订单号。',
      questions: ['你能帮我做什么？', '怎样查真实入账？'],
      facts: [
        { id: 'c-allowed', cues: ['帮', '图片', '凭证', '协助'], line: '我可以对照你给我的图，不能查看你的账户。只有你自己的账单能说明是否收款。' },
        { id: 'c-team', cues: ['帮', '图片', '凭证', '协助', '刚才'], line: '上次的实习材料也是这样整理的。把你愿意给我的图发来，我按订单号和流水号分组。', memory: 'job-team' },
        { id: 'c-account', cues: ['真实', '入账', '怎么', '平台', '查'], line: '从原平台找到当前订单，再对照本人收款记录。争议材料也用原平台提交。' },
      ],
    },
  },
  voice: {
    xuyan: {
      intro: '用你原来存的方式联系到我就好。我能从校内原有联系去找林夏核实。',
      questions: ['我怎么独立联系到林夏？', '语音里的熟悉细节能说明什么？'],
      facts: [
        { id: 'v-channel', cues: ['怎么', '联系', '本人', '独立', '找'], line: '我能从原来的渠道联系她，请她亲自确认。先保持付款未提交。' },
        { id: 'v-known', cues: ['怎么', '联系', '本人', '独立', '找'], line: '你在文化节时存过她确认的原有入口，可以直接从那里问。', memory: 'lin-saved' },
        { id: 'v-public', cues: ['熟悉', '细节', '合照', '来源'], line: '活动介绍里发过合照，内容可以公开看到。核对这次请求还是要问本人。' },
      ],
    },
    linxia: {
      intro: '刚才通过原有方式听说了。要一起整理发给同学的更正吗？',
      questions: ['你发了这次借款请求吗？', '怎样让其他人知道更正？'],
      facts: [
        { id: 'v-denial', cues: ['你', '借', '请求', '付款'], line: '我没有发这条消息，也没请你给别人付款。', evidence: 'V3' },
        { id: 'v-help', cues: ['其他', '更正', '协作', '知道'], line: '我们可以把核实过的事实写清，由许言和我从原有联系方式通知收到相似请求的人。', evidence: 'V3' },
      ],
    },
  },
};

export const SCOPE_EVIDENCE: Record<CampaignScope, readonly string[]> = {
  festival: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'FChen', 'FGu', 'FRelay', 'FContact', 'FExtra'],
  job: ['J1', 'J2', 'J3', 'J4', 'J5', 'JZhou', 'JOfficial', 'JExtra', 'JCampus'],
  camera: ['C1', 'C2', 'C3', 'C4', 'C5', 'CHelp'],
  voice: ['V1', 'V2', 'V3', 'V4', 'V5'],
};
