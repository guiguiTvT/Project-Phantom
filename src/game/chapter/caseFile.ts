export const EVIDENCE_IDS = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] as const;
export const CONTACT_IDS = ['linxia', 'zhouning', 'chen', 'xuyan', 'gu'] as const;
export const RISK_IDS = ['H1', 'H2', 'H3'] as const;

export type EvidenceId = typeof EVIDENCE_IDS[number];
export type ContactId = typeof CONTACT_IDS[number];
export type RiskId = typeof RISK_IDS[number];
export type Mode = 'full' | 'quick';
export type Phase = 'briefing' | 'investigation' | 'reversal' | 'protection' | 'defense' | 'ending';
export type Round = 1 | 2 | 3 | 4;
export type OptionId = 'A' | 'B' | 'C';
export type EndingId = 'ending_dawn' | 'ending_rebuild' | 'ending_consensus' | 'ending_isolation' | 'ending_domino' | 'ending_unresolved';

interface EvidenceCard {
  title: string;
  source: string;
  time: string;
  summary: string;
  text: string[];
  limit: string;
  related: EvidenceId[];
}

export const EVIDENCE: Record<EvidenceId, EvidenceCard> = {
  E1: {
    title: '本届官方公告', source: '科技文化节 · 官方公告栏', time: '昨天 09:00',
    summary: '本届入口 SIM-FEST-01。志愿者中午分组，文化节今晚开幕。',
    text: ['今晚 21:00，科技文化节在综合楼开幕。参加活动请使用本届官方入口 SIM-FEST-01。', '报名只需姓名、学号和场次。主办方不需要读取通讯录或精确位置。', '志愿者 12:00 按本届名单分组。已经填写过表单的同学，请在官方入口核对自己的记录。'],
    limit: '公告说明了本届有效入口和所需资料。要确定某人是否报上名，还要核对本届名单。',
    related: ['E7', 'E6'],
  },
  E2: {
    title: '社团转发记录', source: '科技节志愿者群 · 林夏转发', time: '昨天 15:30',
    summary: '林夏从活动筹备群转来另一条报名入口 SIM-HELP-02。',
    text: ['林夏「筹备群刚发的，我先转过来。好几个同学都在问今晚去哪儿报名。」', '转发记录 · 活动筹备群 → 科技节志愿者群', '原消息署名为“陈老师 活动协调”，引用的入口是 SIM-HELP-02。'],
    limit: '这张卡只能说明消息从哪里转来，显示名无法证明发言者就是陈老师。',
    related: ['E4', 'E5'],
  },
  E3: {
    title: '报名异常记录', source: '校园演练平台 · 登记日志', time: '今天 08:20',
    summary: '同一虚构参与编号有重复记录，助手保存的字段也多于本届要求。',
    text: ['参与编号 SIM-STUDENT-12 在助手记录中出现两次。在本届官方记录中查无对应条目。', '记录显示助手还要求补充联系偏好及详细住区。这些字段未出现在本届官方公告里。', '日志员备注「重复记录和多出来的字段先分开查。单看这份日志还不知道资料最后到了哪儿。」'],
    limit: '日志记录的是异常及字段差异，无法证明资料已向第三方泄露。',
    related: ['E5', 'E8'],
  },
  E4: {
    title: '教师账号截图', source: '活动筹备群 · 原消息', time: '昨天 15:10',
    summary: '显示名是“陈老师 活动协调”，账号标识为 SIM-TEMP-07。',
    text: ['群内显示名 · 陈老师 活动协调', '账号标识 · SIM-TEMP-07', '原记录显示，该账号在讨论中引用了 SIM-HELP-02。截图中没有学校通讯录的身份确认。'],
    limit: '截图能证明当时显示了什么。发言者是谁，需要从学校通讯录另行核实。',
    related: ['E2'],
  },
  E5: {
    title: '助手权限页面', source: '报名助手 · 站内模拟页面', time: '今天 08:25',
    summary: '助手在报名完成前要求通讯录、精确位置和额外字段。',
    text: ['页面记录 · SIM-HELP-02', '继续报名之前，页面请求读取通讯录和精确位置，并要求填写与场次无关的补充资料。', '页面将“同意后继续”设为默认项。此处呈现的是隔离副本中的页面记录。'],
    limit: '权限请求与实际使用、资料流向是不同事实。这里只能确认页面提出了什么请求。',
    related: ['E1', 'E3', 'E7'],
  },
  E6: {
    title: '旧表单记录', source: '历史活动存档 · 上届报名表', time: '上学期发布 · 今天 08:00 再转发',
    summary: '上届表单仍可打开。页面接收提交，本届名单没有新增记录。',
    text: ['表单页首 · 上届科技文化节报名。页内截止日期已经过去。', '旧页面仍显示“已收到提交”。在今天的比对记录中，这些提交没有写入本届名单。'],
    limit: '可以判断这个旧入口与本届名单无关。本届官方入口是否有效还要由现行公告确认。',
    related: ['E1'],
  },
  E7: {
    title: '活动接入名单', source: '信息中心 · 本届管理公告', time: '昨天 10:00',
    summary: '本届只批准 SIM-FEST-01 接入。顾老师负责接入复核。',
    text: ['本届文化节接入名单只有 SIM-FEST-01。列表中没有登记 SIM-HELP-02。', '新增接入由社团负责人提交申请，平台管理员顾老师审批。管理方可核对受影响的演练记录范围。'],
    limit: '名单能说明审批范围。无法单靠名单判断助手处理过哪些历史资料。',
    related: ['E1', 'E5'],
  },
  E8: {
    title: '同学异常反馈', source: '周宁转来的私信 · 去标识摘要', time: '今天 08:50',
    summary: '有同学报名后收到可疑来电。来电来源和资料流向仍待查。',
    text: ['同学「填完之后接到一个奇怪的电话。我没继续说，也不知道他们从哪儿拿到的号码。」', '周宁「我暂时只记下事情发生的顺序。没有来源，也没有资料流向，先别在群里点名。」'],
    limit: '两件事先后发生无法建立因果关系。这条反馈可作为留待核查的线索。',
    related: ['E3'],
  },
};

export const DIRECT_SOURCES: EvidenceId[] = ['E1', 'E3', 'E5', 'E6', 'E7'];

interface Verification {
  title: string;
  source: string;
  evidence: EvidenceId;
  record: string;
}

export const VERIFICATIONS: Record<ContactId, Verification> = {
  linxia: { title: '核实转发来源', source: '林夏 · 群消息转发记录', evidence: 'E2', record: '「我从筹备群转到志愿者群和两个社团群。原消息就是这张，别把大家的名字公开，我可以回去更正。」' },
  zhouning: { title: '核实报名记录', source: '周宁 · 报名记录比对', evidence: 'E3', record: '「我把两份记录分开了。重复项来自助手，还有一份只留在上届表单。来电是谁打的，我们还不知道。」' },
  chen: { title: '通过通讯录核实账号', source: '校园通讯录 · 教师本人', evidence: 'E4', record: '「SIM-TEMP-07 不是我的账号。我没有发布那条通知。给同学说明时，引用这份通讯录核实记录。」' },
  xuyan: { title: '核实助手接入经过', source: '许言 · 社团接入记录', evidence: 'E2', record: '「我试用过助手，图的是报得快。申请还没核对完，群里已经有人转了。置顶我能撤，也能安排临时补登记。」' },
  gu: { title: '核实审批与影响范围', source: '顾老师 · 平台审批记录', evidence: 'E7', record: '「SIM-HELP-02 没有本届接入许可。演练记录中可定位到助手报名批次，定向通知时可以补发给这个批次。」' },
};

interface RiskCard {
  name: string;
  claim: string;
  slots: string[];
  required: EvidenceId[];
  supplementary?: EvidenceId;
  gaps: string[];
  supported: string;
  limited: string;
  boundary: string;
  remedy: string;
  demonstration: readonly [string, string, string];
  future: readonly [string, string, string];
}

export const RISKS: Record<RiskId, RiskCard> = {
  H1: {
    name: '冒充传播', claim: '有人冒充教师推动报名',
    slots: ['传播记录', '身份依据'], required: ['E2', 'E4'],
    gaps: ['缺少能说明消息如何转发的记录。', '缺少带账号标识的原消息记录。'],
    supported: '转发链引用了冒充陈老师的账号。', limited: '目前只能把转发消息标为待核实。',
    boundary: '转发来源无法证明林夏或其他转发者是故意参与。',
    remedy: '从校园通讯录核实本人，再请管理员限制冒用账号，联系原群发布澄清。',
    demonstration: ['一条消息显示“陈老师 活动协调”。', '转发时，群成员继续引用这个显示名。', '通讯录核验决定能否把发言者和真实教师区分开。'],
    future: ['有同学继续引用最初的教师署名。', '林夏收到追问，却说不清是谁发的。', '更多人可能把同一个显示名当成独立证明。'],
  },
  H2: {
    name: '超范围收集', claim: '报名助手要求了不必要的信息',
    slots: ['本届报名需求', '异常记录', '权限请求', '接入依据（可选）'], required: ['E1', 'E3', 'E5'], supplementary: 'E7',
    gaps: ['缺少本届报名所需资料的官方基准。', '缺少超出报名范围的字段记录。', '缺少能看到助手权限请求的记录。'],
    supported: '助手要求的权限和字段超出本届报名需要。', limited: '已看到部分权限或字段线索，暂不足以完成任务需求对照。',
    boundary: '这些材料无法证明历史信息被出售，也无法确认可疑电话的来源。',
    remedy: '撤回自己已授予的非必要权限，报告助手入口并单独请求核查历史资料。',
    demonstration: ['本届报名只需要姓名、学号和场次。', '助手另行请求通讯录、精确位置和额外资料。', '把两种需求和实际记录并排对照，才能划出超出任务的部分。'],
    future: ['已经授权的同学可能忘记回到设置页。', '不必要的通讯录和位置访问仍可能有效。', '后续还需要进一步核对此前提交过哪些资料。'],
  },
  H3: {
    name: '旧入口混淆', claim: '旧表单提交没有进入本届名单',
    slots: ['本届入口依据', '旧表单记录'], required: ['E1', 'E6'],
    gaps: ['缺少能确定本届有效入口的现行公告。', '缺少旧表单的届次或写入记录。'],
    supported: '旧表单属于上届活动，提交记录不会进入本届报名。', limited: '表单仍能打开，暂缺少新旧两边的记录对照。',
    boundary: '旧入口失效无法说明本届官方入口也失效。',
    remedy: '请负责人撤下过期入口，通知相关同学核对本届名单并安排补登记。',
    demonstration: ['旧表单显示“已收到提交”。', '本届官方名单没有增加条目。', '以本届公告和当前记录确认报名是否有效。'],
    future: ['旧表单继续显示“已收到提交”。', '许言准备分组时发现本届名单没有相应记录。', '误填表单的同学可能错过分组，仍可核对后补登记。'],
  },
};

export const ROUND_IDS = [1, 2, 3, 4] as const;

export interface DecisionOption {
  id: OptionId;
  title: string;
  detail: string;
  cost: string;
}

interface DecisionRound {
  label: string;
  title: string;
  prompt: string;
  actor: ContactId;
  options: DecisionOption[];
}

export const DECISIONS: Record<Round, DecisionRound> = {
  1: {
    label: '渠道', title: '先处理哪些报名入口？', actor: 'gu',
    prompt: '「林夏说群里还有人在点链接。你希望先限制哪些入口？有凭据的就一起交过来。」',
    options: [
      { id: 'A', title: '申请暂时暂停全部报名', detail: '请顾老师暂停报名写入、风险入口跳转和助手新增权限访问。', cost: '正常报名也会暂停，底层问题仍待修复。' },
      { id: 'B', title: '提交证据申请定向处置', detail: '把已确认的风险交给顾老师处理，本届官方入口保持开放。', cost: '至少确认一条风险。其余风险继续待处理。' },
      { id: 'C', title: '先保护自己并继续观察', detail: '停止使用助手，保留目前掌握的记录。', cost: '校园渠道维持原状，其他同学仍可能点开这些入口。' },
    ],
  },
  2: {
    label: '通知', title: '怎样提醒其他同学？', actor: 'linxia',
    prompt: '「我现在要不要在大群说一声？里面也有很多没报名的人，我怕大家一下子都来问。」',
    options: [
      { id: 'A', title: '立即发不点名的全体提醒', detail: '请顾老师发布已确认事实和暂缓操作的建议，林夏转入相关群。', cost: '覆盖较广，活动负责人要集中回应咨询。' },
      { id: 'B', title: '与人物核对后定向通知', detail: '请陈老师和许言核对内容，由活动群管理员确认送达。已核实影响范围时，补发给相关报名记录。', cost: '干扰较小，群外的未知转发仍需跟进。' },
      { id: 'C', title: '等待更多结果再通知', detail: '保留现有材料，等处置回执。', cost: '暂不增加提醒覆盖，入口开放时会留下提醒空窗。' },
    ],
  },
  3: {
    label: '修复', title: '由谁完成后续修复？', actor: 'xuyan',
    prompt: '「我得在 12 点给志愿者分组，今晚 9 点活动开场。要是名单来不及，我现在就留一轮补排。」',
    options: [
      { id: 'A', title: '提交正式事件单', detail: '由顾老师复核三条风险，并落实应用接入、通知核验和旧入口规则。', cost: '13:00 收到回执，错过 12:00 志愿者分组。' },
      { id: 'B', title: '联系人物协作修复', detail: '处理已确认的问题，许言清理旧表单并安排补登记。', cost: '10:20 收到回执，尚未查清的问题仍会保留。' },
      { id: 'C', title: '保存证据，只完成个人保护', detail: '保存调查记录，暂不增加校园修复任务。', cost: '10:00 记录进展，现有待处理项目会带入结算。' },
    ],
  },
  4: {
    label: '恢复', title: '怎样恢复正常报名？', actor: 'gu',
    prompt: '「先看回执里还有哪些问题。三条都已阻断，我才能交付一份能用于分组的本届名单。」',
    options: [
      { id: 'A', title: '按复核结果处理官方报名', detail: '三条风险都被阻断时，恢复或保持官方入口，并核对本届名单。', cost: '核对需用 10 分钟。若仍有风险，维持当前渠道状态。' },
      { id: 'B', title: '继续申请全面暂停', detail: '请顾老师继续或新设临时暂停，留下复核后的恢复任务。', cost: '新访问被隔离，正常报名和名单交付仍会延后。' },
    ],
  },
};

export const ENDINGS: Record<EndingId, { name: string; next: string }> = {
  ending_domino: { name: '多米诺', next: '先通过可靠渠道说明现状，再向管理员提交待处理入口。' },
  ending_isolation: { name: '孤岛', next: '把待处理项目和恢复条件交给顾老师，复核后再确认报名安排。' },
  ending_dawn: { name: '破晓', next: '请联络人跟进后续通知、补登记和历史资料核查。' },
  ending_rebuild: { name: '新秩序', next: '明确日常联络人，让新规则和补登记安排到达各活动群。' },
  ending_consensus: { name: '共识', next: '把接入审核、身份核验和旧入口处理写进下一届活动的正式流程。' },
  ending_unresolved: { name: '未完待续', next: '对照仍待处理的项目，补上核实、通知或修复中的缺口。' },
};
