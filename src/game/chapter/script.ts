import { ASSETS } from '../data/assets';
import type { ContactId, EndingId, OptionId, Round } from './caseFile';
import type { CaseState } from './caseEngine';
import type { StoryLine } from './NovelScene';

export const PROLOGUE: readonly StoryLine[] = [
  { voice: 'narrator', background: ASSETS.serviceHall, text: '九点不到，综合楼门口已经挂上了科技文化节的横幅。有人踩着梯子贴指示牌，有人蹲在台阶上翻报名名单。' },
  { voice: 'narrator', background: ASSETS.activityRoom, text: '顾老师把今天的临时测试证推到我面前。桌对面的周宁没有坐下，他正把同一张截图放大又缩小。' },
  { voice: 'zhouning', actor: 'zhouning', mood: 'confused', background: ASSETS.activityRoom, text: '你能帮我看一下吗？我昨晚就填完了。刚才许言说中午按名单分组，可上面根本没有我。' },
  { voice: 'gu', actor: 'gu', background: ASSETS.activityRoom, text: '你先在测试副本里查。桌上的手机和公告都可以看，跟人核实用一点，跑一次推演用两点。今晚九点开幕，我们得赶在中午前弄清报名入口。' },
];

export const QUICK_PROLOGUE: readonly StoryLine[] = [
  { voice: 'zhouning', actor: 'zhouning', mood: 'confused', text: '我照群里的链接填了，可名单上没有我。你来得正好，那边有一份留给你的调查记录。' },
  { voice: 'narrator', text: '本局预置部分证据、通讯录核实和一次推演。桌上的手机可以打开原始记录，其余选择由你决定。' },
];

export const CONTACT_BEATS: Record<ContactId, readonly StoryLine[]> = {
  linxia: [
    { voice: 'narrator', actor: 'linxia', text: '林夏把一卷胶带套在手腕上，从走廊拐回来。听见“报名”两个字，她把手里的指示牌靠到墙边。' },
    { voice: 'linxia', text: '群里那条是我转的。好几个人催着问，我看署名眼熟，就顺手发出去了。你那儿看到的又是哪个入口？', mood: 'confused' },
  ],
  zhouning: [
    { voice: 'narrator', actor: 'zhouning', text: '周宁把屏幕压低，等旁边的人走过，才把两张截图切到一起。' },
    { voice: 'zhouning', text: '我把提交页截下来了。它说已收到，可名字还是查不着。你看，这两张写的是同一届吗？', mood: 'confused' },
  ],
  chen: [
    { voice: 'narrator', actor: 'chen', text: '我从校园通讯录找到陈老师，约在服务中心碰面。她把自己的工作手机放在柜台上。' },
    { voice: 'chen', text: '群名和头像容易看错。把那条消息的账号标识给我，我从通讯录记录里帮你核对。' },
  ],
  xuyan: [
    { voice: 'narrator', actor: 'xuyan', text: '许言手边摊着一张志愿者表。他刚写下几个名字，手机又弹出一条问报名的消息。' },
    { voice: 'xuyan', text: '中午我就得把人分好。现在有人从公告进来，有人拿的是群里的链接。你说的是哪一条？', mood: 'nervous' },
  ],
  gu: [
    { voice: 'narrator', actor: 'gu', text: '服务中心柜台还排着几个人。顾老师看过我的测试证，把一份接入名单翻到本届那一页。' },
    { voice: 'gu', text: '先看入口编号，再看时间。要我去查影响范围，你得告诉我是哪一批记录。' },
  ],
};

export const DECISION_BEATS: Record<Round, readonly StoryLine[]> = {
  1: [
    { voice: 'narrator', actor: 'gu', text: '离开自己的设置页，我带着调查记录走回服务中心。顾老师面前的屏幕还停在本届活动名单。' },
    { voice: 'gu', text: '林夏说群里还有人在点那条链接。你来决定先拦哪些入口。我需要能对上的依据。' },
  ],
  2: [
    { voice: 'narrator', actor: 'linxia', text: '林夏把手机递过来。群聊里，最新一条消息只问了两个字：“还能报吗？”' },
    { voice: 'linxia', mood: 'nervous', text: '我可以把更正转回去。要发给所有人，还是先找陈老师和许言把话对一遍？' },
  ],
  3: [
    { voice: 'narrator', actor: 'xuyan', text: '许言把名单上的铅笔印擦了一遍，纸都起了毛。门外，负责搬展板的同学在问中午几点集合。' },
    { voice: 'xuyan', mood: 'confused', text: '十二点得分组，今晚九点照常开场。要等正式复核，我这边就先准备补排。要是能先改一部分，我们现在就去办。' },
  ],
  4: [
    { voice: 'narrator', actor: 'gu', text: '新回执到了。我重新翻到本届公告那一页。很快就有人要拿这份名单去叫志愿者。' },
    { voice: 'gu', text: '我们再确认一遍。三条问题都拦住了，名单就可以交出去。还有缺口的话，我得把它写在回执上。' },
  ],
};

export const DECISION_REPLY: Record<Round, Partial<Record<OptionId, string>>> = {
  1: { A: '先把报名全部暂停。', B: '用这些证据，先拦已确认的入口。', C: '我先保护自己，再看看情况。' },
  2: { A: '先发全体提醒，别点名。', B: '请陈老师和许言一起核对，再通知相关同学。', C: '我想等下一份回执再发。' },
  3: { A: '请顾老师正式复核，我去和志愿者说一声。', B: '我们一起把能处理的入口先改掉。', C: '我把证据留下，今天先到这里。' },
  4: { A: '按最新回执核对，能恢复就走官方入口。', B: '先继续暂停，等后续安排。' },
};

export function epilogue(state: CaseState, ending: EndingId): StoryLine {
  switch (ending) {
    case 'ending_consensus':
      return { voice: 'shen', text: '许言把核过的名单拿到门口，林夏在群里发了补登记的说明。开幕前还有事要做，这一次，大家知道该找谁。' };
    case 'ending_dawn':
      return { voice: 'shen', text: '顾老师把接入规则和核对后的名单一起交过来。中午的分组错过了，许言在群里发了补排时间。我终于能把那条旧通知划掉。' };
    case 'ending_rebuild':
      return { voice: 'shen', text: '本届的名单终于核完，新接入规则也贴到了公告栏。顾老师收起回执，说下一步该让各个群都知道去哪里核对。' };
    case 'ending_isolation':
      return { voice: 'shen', text: '群里的链接都暂停了。服务台前的人问还能不能报，顾老师指了指尚未交付的名单：恢复的时间，我们还得再确认。' };
    case 'ending_domino':
      return { voice: 'shen', text: '我把手机锁上，群里还在弹出新的转发。离中午越来越近，几个人拿着“提交成功”的截图，仍在找自己的名字。' };
    case 'ending_unresolved':
      return { voice: 'shen', text: `我翻到回执的最后一页，${state.world.pending.length ? '还有几处空着。' : '相关入口已经处理。'}那份名单得再看一遍，许言暂时还不能拿它分组。` };
  }
}
