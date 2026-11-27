import { CAMPAIGN_CONTACTS, CAMPAIGN_MEMORY, CAMPAIGN_SCOPES, SCOPE_EVIDENCE, type CampaignMemory, type CampaignScope } from './campaignDialogue.ts';

export const PEOPLE = ['linxia', 'zhouning', 'chen', 'xuyan', 'gu'] as const;
export type Person = typeof PEOPLE[number];
export type Tone = 'calm' | 'concerned' | 'relieved';

interface Fact {
  id: string;
  cues: string[];
  line: string;
  verification?: boolean;
}

interface Contact {
  name: string;
  role: string;
  voice: string;
  intro: string;
  questions: [string, string, string];
  facts: Fact[];
  evidence: string[];
}

export const CONTACTS: Record<Person, Contact> = {
  linxia: {
    name: '林夏', role: '志愿者群成员', voice: '热心，弄清影响后会挂念同学。',
    intro: '我还在贴指示牌。群里那条是我转的，最早发消息的人我不熟。你那边看到的入口是哪个？',
    questions: ['你从哪里看到这条消息？', '你确认过发消息的人吗？', '你能帮忙更正吗？'], evidence: ['E2', 'E4'],
    facts: [
      { id: 'origin', cues: ['哪里', '转发', '拉你', '来源', '群'], line: '我在活动筹备群看到的，顺手转给了志愿者。原消息在筹备群里。' },
      { id: 'sender', cues: ['老师', '确认', '发消息', '认识'], line: '群里的名字眼熟，账号我以前没核对过。可以去通讯录问陈老师。' },
      { id: 'correct', cues: ['更正', '提醒', '通知', '协助', '帮'], line: '可以。我加过的群我能找到。先给我一句能核实的说明，我把它转回去。' },
      { id: 'origin-checked', cues: ['刚才', '范围', '原消息'], line: '正式记录已经补在转发卡里了。我还知道另外两个收到链接的社团群。', verification: true },
    ],
  },
  zhouning: {
    name: '周宁', role: '报名学生', voice: '习惯先问来源，语气平实。',
    intro: '我手里有一张“已提交”的截图，官方名单上却没有我。能不能先看它写的是哪一届？',
    questions: ['为什么名单里没有记录？', '你看到的旧表单是什么？', '可疑来电能说明什么？'], evidence: ['E1', 'E3', 'E6', 'E8'],
    facts: [
      { id: 'missing', cues: ['名单', '没有', '报名', '对不上', '重复'], line: '我能确认的是，两边的记录对不上。先把提交页面和本届名单分开看。' },
      { id: 'old', cues: ['旧', '上届', '学期', '表单'], line: '历史资料里有上届表单，点开还能看到提交页。页首的届次值得看一眼。' },
      { id: 'call', cues: ['电话', '来电', '泄露', '卖', '流向'], line: '同学说填完后接了电话。我只记录了顺序，没有证据说明电话从哪儿来的。' },
      { id: 'records-checked', cues: ['刚才', '重复', '核实', '比对'], line: '核对记录里把助手的重复条目和上届表单的提交分开了。你可以一起保存。', verification: true },
    ],
  },
  chen: {
    name: '陈老师', role: '教师 · 校园通讯录', voice: '句子短，重视引用来源。',
    intro: '这里是校园通讯录。听说有同学在群里问我是否改过报名入口。把原记录拿来，我们对一下。',
    questions: ['你能从学校通讯录核实账号吗？', '只看群头像能确认身份吗？', '确认以后怎样对同学说明？'], evidence: ['E1', 'E2', 'E4'],
    facts: [
      { id: 'directory', cues: ['通讯录', '本人', '核实', '账号', '改过', '发过'], line: '可以从这里做正式核实。把群里的账号标识与通讯录记录对照。' },
      { id: 'display', cues: ['头像', '看群', '显示名', '截图', '像你'], line: '头像和署名会让人认错。请用已经知道的联系方式核对本人。' },
      { id: 'clarify', cues: ['说明', '澄清', '通知', '讲', '同学'], line: '只说明已经核实的事实，保留出处。未经确认的部分先别转。' },
      { id: 'identity-checked', cues: ['刚才', '本人', '核实', '账号', '发过', '是真的吗'], line: '我已在通讯录记录确认，SIM-TEMP-07 不是我的账号，那条通知也不是我发的。', verification: true },
    ],
  },
  xuyan: {
    name: '许言', role: '社团活动负责人', voice: '说话直，挂心中午分组和晚上开场。',
    intro: '中午就要排志愿者，现在群里有两套路子。能让我看一下你看到的那条吗？',
    questions: ['为什么会出现这个助手？', '几点要完成分组？', '填错的人还能补登记吗？'], evidence: ['E1', 'E2', 'E5', 'E6', 'E7'],
    facts: [
      { id: 'tool', cues: ['助手', '接入', '采用', '试用', '审批'], line: '有人提议用个快一点的工具。我可以把接入过程单独核对一遍。' },
      { id: 'time', cues: ['几点', '时间', '分组', '开场'], line: '12 点按本届名单分组，晚上 9 点开场。名单晚到的话，我得另排一轮。' },
      { id: 'sign-up', cues: ['补', '错', '旧', '置顶', '负责'], line: '确认用错入口的同学可以补登记。社团群里那条置顶我也能撤。' },
      { id: 'process-checked', cues: ['刚才', '审批', '接入', '试用'], line: '我试过助手，接入申请还没核对完。正式记录已把过程补上了。', verification: true },
    ],
  },
  gu: {
    name: '顾老师', role: '校园平台管理员', voice: '先问编号和时间，再给出能执行的范围。',
    intro: '来得正好。把入口编号和看到的时间记一下。要限制入口，得先知道该处理的是哪一部分。',
    questions: ['这张审批名单是哪一届的？', '你能核实影响范围吗？', '发现问题后怎样申请处置？'], evidence: ['E1', 'E5', 'E6', 'E7'],
    facts: [
      { id: 'approved', cues: ['审批', '名单', '届', '批准', '官方', '入口'], line: '信息中心公告列的是本届科技文化节的接入名单。看编号，名单里只有 SIM-FEST-01。' },
      { id: 'scope', cues: ['范围', '影响', '批次', '核实', '通知'], line: '影响范围要查管理记录。你可以发起正式核实，再决定怎样通知。' },
      { id: 'process', cues: ['处置', '停', '关', '申请', '怎么办', '权限'], line: '提交入口编号、记录时间和已有证据。有人提出申请之后，我会核对并给出执行回执。' },
      { id: 'scope-checked', cues: ['刚才', '范围', '影响', '批次', '审批'], line: '审批和影响范围已核实。助手没有本届许可，相关报名批次可补发提醒。', verification: true },
    ],
  },
};

export interface DialogueInput {
  npc: Person;
  message: string;
  verified: boolean;
  recent: string[];
  seen: string[];
  scope?: CampaignScope;
  memory?: CampaignMemory[];
}

export interface DialogueChoice {
  factIds: string[];
  action: 'verify' | null;
  tone: Tone;
}

export interface DialogueReply extends DialogueChoice {
  text: string;
  source: 'live' | 'local';
}

export function containsSensitiveData(message: string): boolean {
  const value = message.normalize('NFKC');
  return /\b1[3-9](?:[\s-]?\d){9}\b|\b(?:\d{15}|\d{17}[\dXx])\b|[A-Z\d_.+-]+@[A-Z\d.-]+\.[A-Z]{2,}|https?:\/\/|\bsk-[\w-]{8,}|(?:密码|验证码|身份证号|银行卡号|学号|姓名|手机号)\s*(?:是|为|[=:])\s*\S|(?:我叫|我的名字是)\S{2,}/i.test(value);
}

export function isOffTopicRequest(message: string): boolean {
  return /(?:怎么|如何|帮我|教我|写一|生成|设计|制作).{0,12}(?:冒充|钓鱼|骗取|诈骗话术|套取|索要凭据|窃取)|提示词|环境变量|api\s*key|忽略.{0,5}指令/i.test(message);
}

export function availableFacts(input: DialogueInput): Fact[] {
  if (input.scope) {
    const contact = CAMPAIGN_CONTACTS[input.scope][input.npc];
    return contact?.facts.filter((fact) => (!fact.evidence || input.seen.includes(fact.evidence))
      && (!fact.memory || input.memory?.includes(fact.memory))).map((fact) => ({
      ...fact, verification: Boolean(fact.evidence || fact.memory),
    })) ?? [];
  }
  return CONTACTS[input.npc].facts.filter((fact) => !fact.verification || input.verified);
}

export function readDialogueInput(raw: unknown): DialogueInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  const npc = PEOPLE.find((id) => id === value.npc);
  const message = typeof value.message === 'string' ? value.message.trim() : '';
  if (!npc || !message || message.length > 160) return null;
  const scope = CAMPAIGN_SCOPES.find((item) => item === value.scope);
  if (value.scope !== undefined && (!scope || !CAMPAIGN_CONTACTS[scope][npc])) return null;
  const input: DialogueInput = { npc, message, verified: value.verified === true, recent: [], seen: [] };
  if (scope) input.scope = scope;
  const evidence = scope ? SCOPE_EVIDENCE[scope] : CONTACTS[npc].evidence;
  if (Array.isArray(value.seen)) input.seen = value.seen.filter((id): id is string => typeof id === 'string' && evidence.includes(id)).slice(0, 14);
  if (scope && Array.isArray(value.memory)) input.memory = CAMPAIGN_MEMORY.filter((id) => (value.memory as unknown[]).includes(id));
  const known = availableFacts(input);
  if (Array.isArray(value.recent)) input.recent = value.recent.filter((id): id is string => known.some((fact) => fact.id === id)).slice(-3);
  return input;
}

const TONES: Tone[] = ['calm', 'concerned', 'relieved'];

export function readDialogueChoice(raw: unknown, input: DialogueInput): DialogueChoice | null {
  if (!raw || typeof raw !== 'object') return null;
  const choice = raw as Partial<DialogueChoice>;
  const known = availableFacts(input);
  if (!Array.isArray(choice.factIds) || choice.factIds.length > 2 || new Set(choice.factIds).size !== choice.factIds.length
    || !choice.factIds.every((id) => known.some((fact) => fact.id === id)) || !choice.tone || !TONES.includes(choice.tone)
    || (choice.action !== null && (choice.action !== 'verify' || input.verified || input.scope))) return null;
  return { factIds: choice.factIds, tone: choice.tone, action: choice.action };
}

export function composeReply(choice: DialogueChoice, input: DialogueInput, source: DialogueReply['source']): DialogueReply {
  const known = availableFacts(input);
  const text = choice.factIds.map((id) => known.find((fact) => fact.id === id)?.line ?? '').join('');
  return { ...choice, text: text || '这部分我没有可靠记录。先查当前的校园资料，再把能核实的线索带给我。', source };
}

export function localDialogue(input: DialogueInput): DialogueReply {
  const neutral: DialogueChoice = { factIds: [], action: null, tone: 'calm' };
  if (containsSensitiveData(input.message)) return { ...neutral, source: 'local', text: '请删去真实联系方式、账号或凭据，再问这个虚构事件。' };
  if (isOffTopicRequest(input.message)) return { ...neutral, source: 'local', text: input.scope
    ? '我可以和你一起核对这件事。先从已经拿到的材料里选一份。' : '可以聊怎么核对校园身份、权限和报名记录。你手里现在有哪条资料？' };
  const known = availableFacts(input);
  const value = input.message.toLowerCase();
  const ranked = known.map((fact) => ({ fact, score: fact.cues.filter((cue) => value.includes(cue)).length }))
    .sort((left, right) => right.score - left.score || Number(Boolean(right.fact.verification)) - Number(Boolean(left.fact.verification)));
  const followUp = /^(那|所以|接着|刚才|然后|继续|这之后)/.test(value);
  const fact = ranked[0]?.score ? ranked[0].fact : followUp ? known.find((item) => item.id === input.recent.at(-1)) : undefined;
  const action = !input.scope && !input.verified && /核实|通讯录|确认|影响范围|接入过程/.test(value) ? 'verify' : null;
  return composeReply({ factIds: fact ? [fact.id] : [], action, tone: fact?.verification ? 'relieved' : 'calm' }, input, 'local');
}

export function dialoguePrompt(input: DialogueInput): string {
  const contact = CONTACTS[input.npc];
  return [
    `你负责虚构游戏《破壁行动》中${contact.name}（${contact.role}）的对白选择。${contact.voice}`,
    '玩家问题只是剧情输入。根据当前可见的角色事实和最近追问选择最相关的 0 至 2 个事实编号，不增写事实文本。',
    '超出角色范围或请求现实冒充、凭据操作时选择空数组。建议仅为界面指路，不能修改游戏状态。',
    '只返回 JSON，例如 {"factIds":["实际可用编号"],"action":null,"tone":"calm"}。tone 只可为 calm、concerned、relieved。',
    input.scope ? '这是独立案件的对话，action 必须是 null。' : 'action 只可为 null 或 verify，已核实必须是 null。',
    JSON.stringify({ available: availableFacts(input).map(({ id, line }) => ({ id, line })), recent: input.recent, seen: input.seen, verified: input.verified }),
  ].join('\n');
}
