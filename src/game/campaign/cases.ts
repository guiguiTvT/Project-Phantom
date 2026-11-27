import { ASSETS } from '../data/assets';
import type { StoryLine } from '../chapter/NovelScene';
import { CAMERA, evidenceTokens, FESTIVAL, JOB, VOICE } from './materials';
import type { Axis, CaseDefinition, CaseId, ObservationChoice, Puzzle, Step, Token } from './types';

type Voice = StoryLine['voice'];
const line = (voice: Voice, text: string): StoryLine => ({ voice, text });
const scene = (id: string, goal: string, voice: Voice, text: string, button: string): Step => ({ kind: 'scene', id, goal, line: line(voice, text), button });
const read = (id: string, goal: string, voice: Voice, text: string, cards: string[], button = '继续'): Step => ({ kind: 'read', id, goal, line: line(voice, text), cards, button });
const observe = (id: string, goal: string, voice: Voice, text: string, axis: Axis, left: ObservationChoice, right: ObservationChoice): Step => ({
  kind: 'observe', id, goal, line: line(voice, text), button: '继续', axis, choices: [left, right],
});
const puzzle = (id: string, goal: string, voice: Voice, text: string, button: string, setup: Puzzle, instruction: string, clue: string, conclusion: string): Step => ({
  kind: 'puzzle', id, goal, line: line(voice, text), button, puzzle: setup, instruction, clue, conclusion,
});
const verify = (id: string, goal: string, voice: Voice, text: string, button: string, record: string, confirmation: string, cost: 0 | 1 = 1): Step => ({
  kind: 'verify', id, goal, line: line(voice, text), button, record, confirmation, cost,
});
const simulate = (id: string, voice: Voice, text: string, scenes: StoryLine[]): Step => ({
  kind: 'simulation', id, goal: id === 'f-sim' ? '在沙盘里拦住错误的报名信号' : '把真实入账的记录接到本人账单',
  line: line(voice, text), button: id === 'f-sim' ? '进入信号拦截' : '进入资金断路板', scenes,
});
const resolve = (id: string, voice: Voice, text: string): Step => ({ kind: 'resolve', id, goal: '决定是否落实处置，再查看回执', line: line(voice, text), button: '选择处理安排' });
const token = (id: string, label: string, detail?: string): Token => ({ id, label, detail });

const festival: CaseDefinition = {
  id: 'festival', number: 1, title: '文化节的另一张报名表', place: '澄川大学 · 文化节活动室', time: '彩排前', background: ASSETS.activityRoom,
  files: FESTIVAL, handler: '顾老师与许言', ruleOwner: '顾老师',
  steps: [
    read('f-open', '先打开林夏转来的群消息', 'linxia', '陈老师推荐的这个报名助手快一点，我已经转到社团群了。咦，你手里的官方公告写的是另一个入口？', ['E2'], '对照原始通知'),
    observe('f-first', '决定先看公告，还是先记下疑点', 'self', '群里有人催报名。我可以先去看学校的原始公告，也可以先记下「两个入口可能对不上」，等有材料再判断。', 'EI',
      { letter: 'E', label: '先打开本届官方公告', action: '你先从学校活动平台查看本届官方公告。', material: 'E1' },
      { letter: 'I', label: '先记下入口可能对不上', action: '你先记下入口可能不一致的疑点，接下来查原始公告核对。' }),
    read('f-notices', '看官方公告和群里的原消息', 'self', '先弄明白每条消息各自指向哪里。林夏只是转发，署名那条得从筹备群的原记录里看。', ['E1', 'E4'], '开始连线'),
    puzzle('f-entry', '用两份通知找出不一致的入口', 'self', '把学校发的公告和林夏转发的消息摆到一起，看看两条入口是否指向同一个地方。', '把两份通知连起来',
      { kind: 'link', tokens: evidenceTokens(FESTIVAL, ['E4', 'E2', 'E1']), answer: ['E1', 'E2'] },
      '依次点选写着本届官方入口的公告，以及写着助手入口的群消息。', '这一步对照的是两个入口。先找学校发的公告，再找林夏转到群里的推荐。',
      '官方公告写的是 SIM-FEST-01，群转发了 SIM-HELP-02。两个入口不同，需要分别核查。'),
    read('f-process', '查助手的权限和学校的接入记录', 'xuyan', '当时官网有点慢，我怕耽误报名，就同意先试试助手。权限页和学校审批名单都在这里，你看完就知道我们差在哪一步了。', ['E3', 'E5', 'E7'], '核对教师推荐'),
    puzzle('f-sender', '找到声称推荐的人和学校审批材料', 'gu', '群截图能告诉我们账号写着什么，审批名单能告诉我们学校批准了什么。你先把这两份材料找出来。', '对照署名和审批',
      { kind: 'link', tokens: evidenceTokens(FESTIVAL, ['E2', 'E7', 'E4', 'E3']), answer: ['E4', 'E7'] },
      '点选带教师署名的原截图和本届接入名单。', '要看带账号标识的原消息，并对照信息中心的本届审批记录。',
      '截图中的署名看起来像陈老师，名单却没批准这款助手。现在从校园通讯录联系陈老师本人。'),
    verify('f-chen', '从学校原有通讯录找陈老师本人', 'chen', '我是陈老师。你从校园通讯录打来的这通电话，和群里的那条消息是两个独立来源。把截图上的编号给我看看。',
      '请陈老师核实账号 · 1 点', 'FChen', '我核对过工作账号了。SIM-TEMP-07 不是我的号，那条推荐也不是我发的。'),
    puzzle('f-fields', '分出报名明确需要的资料和用途不明的资料', 'self', '现在再看助手权限。学校公告只写了姓名、学号和场次。其他项目要单独核对用途。', '归类七项报名资料',
      { kind: 'group', tokens: [token('name', '姓名'), token('idcard', '身份证资料'), token('class', '场次'), token('dorm', '宿舍'), token('student', '学号'), token('contacts', '通讯录'), token('location', '定位')],
        groups: [token('needed', '公告明确需要'), token('extra', '本次报名没有说明用途')], answer: { name: 'needed', class: 'needed', student: 'needed', idcard: 'extra', dorm: 'extra', contacts: 'extra', location: 'extra' } },
      '先点一项，再点它所属的分类。分完后可以重新调整。', '本届公告明确需要三项。另四项虽由助手索取，页面没有说明用途。',
      '助手额外索取身份证资料、宿舍、通讯录、定位。下一步请顾老师核实它有没有接入权限。'),
    verify('f-gu', '请顾老师核实学校是否批准助手', 'gu', '我只看正式通过的审批。许言说同意试用，学校有没有批准，要以这份记录为准。',
      '请顾老师核实审批 · 1 点', 'FGu', '本届没有批准 SIM-HELP-02。许言可以更正自己管理的社团消息，学校入口的限制由我执行。'),
    read('f-last', '核对旧表单届次和同学的来电反馈', 'zhouning', '还有两份材料。一份表单写着上学期。另有一位同学说填完资料接到了电话。', ['E6', 'E8'], '核对这两份材料'),
    puzzle('f-side', '区分已过期的入口和仍待核实的来电', 'self', '一个记录有明确届次和截止日期，另一个只记录了谁先谁后。不能把它们写成同一项结论。', '归类剩下两份材料',
      { kind: 'group', tokens: evidenceTokens(FESTIVAL, ['E8', 'E6']), groups: [token('expired', '已过期，停止流传'), token('unknown', '待核实，保留反馈')], answer: { E6: 'expired', E8: 'unknown' } },
      '按材料真正能证明的范围放入对应位置。', '届次和日期能证明旧表单过期。一次来电和一次报名先后发生，还缺资料流向。',
      '旧表单已过期。来电留下待查记录，现有材料还不足以确认泄露。'),
    simulate('f-sim', 'gu', '报名不能一直停着。来，用沙盘把这几条记录过一遍。好的入口放行，有问题的拦下，没证据的先存着。', [
      line('system', '只认群里熟悉的署名时，预置的错误推荐经林夏转入社团群。'),
      line('system', '先核验真实联系人，再核对审批名单，同一条错误推荐在转发前被拦下。'),
    ]),
    observe('f-scope', '决定只整理本案入口，还是多查一个社团', 'linxia', '我知道那几个群。你想先把已经查过的入口整理好，还是要我顺手核对另一个群？', 'CA',
      { letter: 'C', label: '先整理本次已经核验的入口', action: '你先整理文化节当前路径，把已经核验的材料交接。' },
      { letter: 'A', label: '请林夏补查另一条转发 · 1 点', action: '你请林夏核对了另一个社团群的转发来源。', material: 'FRelay', optionalPoint: true }),
    observe('f-method', '决定从正式申请还是人物分工开始', 'xuyan', '流程是我没走完。社团里的消息我能撤，学校那边得由顾老师来办。你打算先找谁？', 'SR',
      { letter: 'S', label: '先把正式申请交给顾老师', action: '你先用正式申请整理了文化节处置范围。' },
      { letter: 'R', label: '先和许言、林夏分好谁做什么', action: '你先跟许言和林夏约定：许言管社团置顶，林夏把更正送回转发群。' }),
    { kind: 'contact', id: 'f-contact', goal: '可以把林夏确认的联系入口存下来', line: line('linxia', '以后如果收到说是我的临时消息，你可以从这个已经用过的入口找我。我本人确认过它有效。'), button: '保存林夏确认的入口' },
    resolve('f-fix', 'gu', '我处理校园入口，许言负责社团里的更正。证据齐了就可以定向处理。还有疑点的话，先隔离或留档都行。'),
  ],
  result: { repaired: '顾老师确认限制了冒名发布、停用助手和旧表单。许言撤下社团置顶并发出更正。', isolated: '顾老师暂时关闭文化节各报名入口，继续传播和提交已受限，三项问题还要逐项复核。',
    pending: '文化节材料已留档，等待负责人接手。错误入口仍可能被转发。', normal: '本届官方报名入口已核验并开放，误填旧表的同学可以按公告补登记。',
    cooperation: '林夏已在原群整理更正，许言确认负责核对转发和补登记。', rule: '顾老师已执行第三方接入先审批、教师通知用独立渠道核验的规则。',
    lesson: '把转发者、署名者和有权批准的人分开核实。' },
};

const job: CaseDefinition = {
  id: 'job', number: 2, title: '第一笔工资确实到账了', place: '澄川大学 · 活动室走廊', time: '文化节核查之后', background: ASSETS.serviceHall,
  files: JOB, handler: '周宁与校内发布负责人', ruleOwner: '校内发布负责人',
  steps: [
    scene('j-open', '看看周宁带来的实习记录', 'zhouning', '你刚才帮我对报名入口，我也有件拿不准的事。这个实习真的给我发了 20 块。第二天他们说，要我先垫 300 才能做下一单。', '去周宁的桌边'),
    observe('j-first', '决定先看独立渠道，还是先写下疑点', 'self', '我可以从企业原有招聘渠道开始，也可以先记下「工作内容和垫付要求对不上」，然后用记录验证。', 'EI',
      { letter: 'E', label: '先查看企业原有招聘渠道', action: '你先查看了独立于招募消息的企业招聘渠道。', material: 'J5' },
      { letter: 'I', label: '先记下任务变成垫付的疑点', action: '你先记下付款要求与工作任务不一致的疑点，再查看记录。' }),
    read('j-receipt', '读招聘、实际任务和那笔真实到账', 'zhouning', '这三份是已经发生的事。先看我到底交付了什么、收到了什么。', ['J1', 'J2', 'J3'], '接着看后来要求'),
    read('j-next', '查看后来的付款要求和独立渠道', 'zhouning', '后面的两条消息开始谈垫付。我停在这儿了，没有付款。', ['J4', 'J5'], '把时间排出来'),
    puzzle('j-time', '按发生时间排出五条记录', 'self', '第一笔收入真的发生过。把它放回时间线，才能看出要求什么时候变了。', '排列任务时间线',
      { kind: 'order', tokens: [token('later', '出现追加资金要求', '今天 08:35'), token('paid', '20 元到账', '昨天 16:00'), token('opening', '看到招聘', '昨天 14:10'), token('deposit', '要求先垫付 300 元', '今天 08:10'), token('delivered', '完成标注', '昨天 15:20')],
        answer: ['opening', 'delivered', 'paid', 'deposit', 'later'] },
      '从最早到最晚点击记录。点已放入的记录可以移出。', '先排昨天的招聘、标注和到账，再排今天 08:10 与 08:35 的两条要求。',
      '标注交付后 20 元到账。垫付 300 元和追加要求是在之后才出现的。'),
    puzzle('j-money', '分清交付、实际收入和被要求支付的金额', 'self', '时间顺序已经排开。接着看钱的方向：哪一条是收入，哪几条改成了让周宁付钱？', '按资金方向归类',
      { kind: 'group', tokens: [token('paid', '到账 20 元'), token('deposit', '要求垫付 300 元'), token('work', '一次图片标注'), token('later', '继续追加资金的要求')],
        groups: [token('work', '实际交付的工作'), token('in', '已收到的报酬'), token('out', '要求自己支付的资金')], answer: { work: 'work', paid: 'in', deposit: 'out', later: 'out' } },
      '逐项选中记录，放到对应位置。要求付款和已经付款是两回事。', '实际到账只有 20 元。两条后续要求都没有支付，标注才是交付。',
      '后半段增加了资金要求。现有账单只有前一次任务的收入。'),
    verify('j-source', '向周宁核实最初是谁转来的', 'zhouning', '我能说清最开始从哪儿看到它。也请你把这条来源和企业的授权分开记。',
      '向周宁核实来源 · 1 点', 'JZhou', '这条是同学转发给我的。问过他了，他也没通过企业招聘渠道核验过。'),
    verify('j-official', '从企业原有招聘渠道独立核验', 'self', '我带着岗位介绍去问企业自己的招聘渠道。回信应该说明这份实习是否由他们发布。',
      '取得独立招聘回复 · 1 点', 'JOfficial', '企业回复：这份实习未由我们发布，提及的招募人也没有获得授权。'),
    puzzle('j-proof', '把岗位承诺、付款要求和企业回复连起来', 'self', '结论必须让周宁能自己复核。哪三份记录能一起说明问题？', '连起三份独立材料',
      { kind: 'link', tokens: evidenceTokens(JOB, ['J3', 'J1', 'JOfficial', 'J2', 'J4']), answer: ['J1', 'J4', 'JOfficial'] },
      '选中岗位介绍、后续付款要求和企业独立核验回复。', '除了原承诺和后来的资金要求，还缺企业自己的回复。',
      '项目后来要求先付资金才能继续领取报酬，企业又独立否认了授权。这两条依据可以一起写进报告。'),
    simulate('j-sim', 'zhouning', '你能在沙盘里把这 20 块怎么进我账上的画给我看吗？我想把后来他们要的 300 元单独圈住。', [
      line('system', '停止追加：20 元仍是已发生的报酬，没有新的支出。'),
      line('system', '虚构的继续追加路径：垫付和再次加钱只会增加支出。第一笔到账不保证后面的钱能退回。'),
    ]),
    observe('j-priority', '决定先帮助已接触的人，还是先给出可信投递入口', 'zhouning', '别的同学也在找实习。我们先整理已接触项目的人怎么求助，还是先告诉大家可以从哪里正规投递？', 'PF',
      { letter: 'P', label: '先陪已接触的同学整理材料', action: '你先安排已接触项目的同学整理材料，向校内负责人求助。' },
      { letter: 'F', label: '先提供经核验的正规投递入口', action: '你先准备了企业原有的投递入口，把历史资料跟进单列给校内负责人。' }),
    observe('j-method', '决定先提交正式核验，还是一起组织核对', 'zhouning', '我可以和你逐条把材料对好，也可以先把企业回复附进正式核验记录。两种都能交到发布负责人手上。', 'SR',
      { letter: 'S', label: '先提交正式招聘核验记录', action: '你先整理了带企业独立回复的正式核验记录。' },
      { letter: 'R', label: '先和周宁一起整理并确认材料', action: '你和周宁逐条核对了岗位、任务和付款材料，并约定由他协助后续核查。' }),
    resolve('j-fix', 'zhouning', '负责人得看到记录才能处理校内的招募信息。同学已经交过的材料也要有回执。我会把这件事单独记，和文化节报名分开。'),
  ],
  result: { repaired: '校内发布负责人撤下招募信息，通知相关同学，并逐项回执已提交材料的处理安排。', isolated: '相关招募展示与提交入口暂时关闭，已提交资料仍由负责人查核。',
    pending: '实习疑点留在材料里，尚未收到撤下招募或处理资料的回执。', normal: '已经核验企业原有招聘入口，同学可在正规渠道继续投递。',
    cooperation: '周宁和发布负责人已逐条核对材料，并明确由周宁联络受影响同学。', rule: '校内发布负责人确认招聘信息须通过企业原有渠道核验授权后再发布。',
    lesson: '把真实发生的报酬和之后的付款要求放在时间线上分开核对。' },
};

const camera: CaseDefinition = {
  id: 'camera', number: 3, title: '相机没寄出，却要先退钱', place: '沈一的手机 · 二手订单', time: '学生身份 · 当天', background: ASSETS.dormNight,
  files: CAMERA, handler: '平台与周宁', ruleOwner: '平台协助负责人',
  steps: [
    scene('c-open', '打开买家发来的订单消息', 'shen', '相机已经装进盒子了。买家说他误付了两次，一边催我寄出去，一边让我把多的 800 元退到另一个账户。钱真的到了吗？', '看书桌上的订单'),
    observe('c-scope', '选择从本机订单或两张凭证开始核对', 'shen', '我手上只有他发来的图。原平台里有我自己的订单和账单，也可以先把两张图上的标识摆在一起。', 'CA',
      { letter: 'C', label: '先打开原有平台的当前订单', action: '你先从可信平台查当前相机订单。', material: 'C3' },
      { letter: 'A', label: '先比对买家发来的两张凭证', action: '你先打开买家的图，开始比对两张凭证的重复之处。', material: 'C1' }),
    read('c-shots', '分别查看买家的两张图片', 'shen', '别先数他说付了几次。我只看每张图写着哪个订单、哪条流水。', ['C1', 'C2'], '对齐图片标识'),
    puzzle('c-ids', '把两张图的订单号、流水号放到同一订单下', 'shen', '金额一样可能是巧合。先挑出能识别记录的字段，看看是不是同一个单。', '比对两张图片',
      { kind: 'group', tokens: [token('c1-order', '图一订单 CAM-S17'), token('c2-order', '图二订单 CAM-S17'), token('c1-trace', '图一流水 TRACE-14'), token('c2-trace', '图二流水 TRACE-14'), token('c-amount', '两张图都显示 800 元')],
        groups: [token('same', '放到同一订单下核查'), token('claim', '图片上显示的金额')], answer: { 'c1-order': 'same', 'c2-order': 'same', 'c1-trace': 'same', 'c2-trace': 'same', 'c-amount': 'claim' } },
      '把两张图的订单号和流水号放到同一订单，显示的金额另放。', '两张图片写着同一订单和同一流水。图片金额无法确认实际入账。',
      '两张图片写的是同一订单和同一流水。现在查自己从原平台打开的记录。'),
    read('c-ledger', '从原平台查订单，再看本人账单', 'shen', '这次我从原来用的平台进订单。付款状态和本人入账各有一份独立记录。', ['C3', 'C4'], '算清真实到账'),
    puzzle('c-money', '把实际到账和对方声称多付的金额分别填好', 'shen', '相机标的是 800 元，但我需要退的金额，要由真实入账来支持。', '在对账单里填金额',
      { kind: 'group', tokens: [token('zero', '0 元'), token('claimed', '800 元')], groups: [token('actual', '卖家实际收到'), token('alleged', '买家声称多付')], answer: { zero: 'actual', claimed: 'alleged' } },
      '按自己的账单和对方的说法各归一项。', '订单仍等待买家付款，账单没有入账。800 元是对方声称多付的金额。',
      '实际到账为 0 元。这时没有已到账的款项可退。'),
    { kind: 'assistance', id: 'c-assist', goal: '保持发货和退款未执行，检查陌生会话', line: line('shen', '又弹出一个自称平台客服的会话。我可以从原平台核查。眼下先决定是否保持寄件和退款都未执行。'), button: '保持寄件和退款未执行' },
    observe('c-method', '决定先请平台核查，还是先请周宁整理凭证', 'shen', '平台能核查付款与客服身份。周宁只能帮我把我愿意给他看的材料摆清楚。', 'SR',
      { letter: 'S', label: '先从原平台发起核查', action: '你先从原平台提交订单核查请求，等待平台回执。' },
      { letter: 'R', label: '先请周宁整理两份凭证', action: '你请周宁确认了图片上重复的标识，并按来源整理凭证。', material: 'CHelp' }),
    observe('c-priority', '决定是否先安排求助，或先确认安全的交易路径', 'shen', '相机可以留在我这儿。现在可以先把凭证和求助安排好，也可以先确认争议以外的正常平台路径。', 'PF',
      { letter: 'P', label: '先保存凭证并安排求助', action: '你先保存交易凭证，并把求助交给原平台。' },
      { letter: 'F', label: '先确认以后只在可信平台交易', action: '你先确认原平台内的正常交易途径，把原争议单独交给负责人跟进。' }),
    resolve('c-fix', 'shen', '我能暂停自己的寄件和退款。只有平台能给出付款与客服核验的回执，我把准备好的材料交给它。'),
  ],
  result: { repaired: '平台确认没有相应支付记录，新会话也不是官方客服，已受理并处理该争议的风险入口。', isolated: '相机保持未寄出，退款保持未执行，陌生协助会话已关闭。平台争议仍待核实。',
    pending: '相机未寄出、退款未执行。付款争议继续待核实，目前没有平台身份回执。', normal: '本笔争议可安全结束，可以继续从原平台查看订单或另行发布。',
    cooperation: '周宁已把买家图片与本人账单分开整理，原平台联络人确认接手核查。', rule: '平台协助负责人确认站内订单与实际入账双核验后才能进入退款流程。',
    lesson: '先看原平台订单和本人账单，再判断是否发生了真实付款。' },
};

const voice: CaseDefinition = {
  id: 'voice', number: 4, title: '声音像她，事情却不是她说的', place: '沈一的手机 · 新语音', time: '订单核对之后', background: ASSETS.dormNight,
  files: VOICE, handler: '林夏、许言与平台', ruleOwner: '顾老师',
  steps: [
    read('v-open', '听一段从陌生号发来的语音', 'shen', '寄件单还压在桌上，手机又亮了。这次听起来是林夏，她提到我们约好拍文化节舞台的事。发信号码我没见过。', ['V1'], '决定从哪里核实'),
    observe('v-first', '选择联系本人，或先标记冒用疑点', 'shen', '她说手机坏了，提到我和她都认识的人。我可以先用原来的方式找她，也可以先把可能冒用记为假设。', 'EI',
      { letter: 'E', label: '先从原有联系渠道找本人', action: '你先翻开原有通讯录，查找独立于新号的联系方式。', material: 'V2' },
      { letter: 'I', label: '先记下可能有人冒用身份', action: '你先标记冒用假设，接着通过独立联系核实。' }),
    puzzle('v-request', '分清对方自称是谁、要你做什么、让你付给谁', 'shen', '先把这条请求拆开。声音熟悉只是一个线索，付款仍保持未提交。', '把请求拆成三项',
      { kind: 'group', tokens: [token('voice-name', '自称林夏'), token('voice-payee', '要求转给另一位收款人'), token('voice-action', '要求沈一转钱')],
        groups: [token('who', '身份主张'), token('action', '实际请求'), token('payee', '收款对象')], answer: { 'voice-name': 'who', 'voice-action': 'action', 'voice-payee': 'payee' } },
      '选中语音请求中的一项，再点击它的分类。', '区分对方说自己是谁、要你做什么、钱会到谁那里。',
      '新号自称林夏，却请沈一把钱转给另一个人。现在用已经知道的原有联系人核实。'),
    verify('v-owner', '用原有联系独立找林夏本人', 'shen', '从这个新号给的号码核对，只会回到同一个来源。借用手机的说法要让本人独立确认。',
      '从原有渠道核实本人', 'V3', '林夏本人确认：我没请你借钱，也没有让你给别人付款。', 0),
    read('v-post', '查看原有联系方式和公开动态', 'linxia', '那张合照和活动介绍之前公开发过。对方知道这件事，不能证明是我跟他说的。', ['V2', 'V4'], '把独立确认摆到语音旁边'),
    puzzle('v-proof', '把语音与林夏本人的独立确认连起来', 'shen', '我现在要回答的是这次请求是不是林夏本人提出的。哪两份材料最直接？', '核对请求是否出自本人',
      { kind: 'link', tokens: evidenceTokens(VOICE, ['V4', 'V1', 'V3', 'V2']), answer: ['V1', 'V3'] },
      '选中原请求，以及从原有渠道得到的本人回复。', '公开合照只能解释细节为何熟悉。确认这次请求要用语音原件和独立本人回复。',
      '林夏没有发起借款。公开信息有多种来源，现有材料也无法将它归因于文化节助手。'),
    observe('v-scope', '决定先控制这一条消息，还是同时核对其他收件人', 'linxia', '听起来像我。别人也可能收到，你想先处理你手里这条，还是我和周宁一起问问别人？', 'CA',
      { letter: 'C', label: '先记下这次请求，保持未提交', action: '你先控制本次付款请求，转账保持未提交。' },
      { letter: 'A', label: '同时用原有联系问其他同学', action: '你用原有渠道向其他收件人核对，并请周宁协助整理更正对象。', material: 'V5' }),
    observe('v-priority', '决定先组织更正，还是先恢复已核验的日常联系', 'linxia', '我能通过原来的渠道确认安排。你是先帮我把身份更正发出去，还是先把正常联系恢复并给更正留个人接手？', 'PF',
      { letter: 'P', label: '先安排身份更正和求助', action: '你先安排身份更正、提醒受影响的人，并向平台提出求助。' },
      { letter: 'F', label: '先保留核验过的日常联系渠道', action: '你先确认日常联系仍走原有入口，再明确将更正交给联系人跟进。' }),
    resolve('v-fix', 'shen', '我可以保留语音和账号记录，联系真正的林夏，再向平台申请处理。只有收到更正和处理回执，才算已经落实。'),
  ],
  result: { repaired: '林夏和许言完成身份更正，向收到消息的同学说明原有联系方式。平台回执确认已处置冒名会话。', isolated: '本次请求继续保持未付款，新会话暂时隔离，当前安排暂停，仍待更正与平台核验。',
    pending: '请求保留待核实或待更正，转账未提交，相关收件人尚未全部收到说明。', normal: '林夏的原有联系已经确认，日常安排可沿用原有渠道。',
    cooperation: '林夏确认自己负责原有渠道澄清，许言与周宁已开始逐条联系相关同学。', rule: '顾老师确认紧急付款类请求须由已知渠道确认本人，再进入任何后续环节。',
    lesson: '声音、头像和熟悉细节都只能提供线索。真正的核验要走和原请求独立的已有渠道。' },
};

export const CAMPAIGN_CASES: Readonly<Record<CaseId, CaseDefinition>> = { festival, job, camera, voice };
