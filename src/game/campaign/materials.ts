import { EVIDENCE } from '../chapter/caseFile';
import { ROOM_NOTES } from './investigation';
import type { Material, Token } from './types';

export const FESTIVAL = {
  FShift: ROOM_NOTES.FShift,
  E1: { title: '本届科技文化节公告', source: '学校活动平台 · 本届活动', lines: ['科技文化节 48 小时后开幕。本届只使用官方活动入口 SIM-FEST-01。报名只需姓名、学号、场次。', '上届表单不再写入本届名单。已经填写过旧表的同学，请走官方入口核对。'] },
  E2: { title: '林夏的群转发', source: '科技节志愿者群 · 林夏', lines: ['林夏说她看见熟悉的教师署名，便把活动筹备群的消息转到社团群。推荐入口为 SIM-HELP-02。', '这份记录保留了转发来源。'] },
  E3: { title: EVIDENCE.E3.title, source: '演练副本 · 登记日志', lines: ['虚构参与编号 S-17 出现了两条助手登记记录，官方本届名单没有相应条目。日志还记录了额外的地址字段。'] },
  E4: { title: EVIDENCE.E4.title, source: '筹备群 · 原消息截取', lines: ['显示名为“陈老师 活动协调”，账号标识 SIM-TEMP-07，推荐 SIM-HELP-02。截图没有校园通讯录的身份记录。'] },
  E5: { title: EVIDENCE.E5.title, source: '报名助手 · 演练副本', lines: ['进入报名时，助手除姓名、学号、场次外，还要求身份证资料、宿舍信息、通讯录和定位。页面没有解释为什么报名需要这四项。'] },
  E6: { title: EVIDENCE.E6.title, source: '活动存档 · 上学期', lines: ['页首写的是上届活动，截止日期已经过去。这个页面还能显示“已提交”，但本届名单没有新增记录。'] },
  E7: { title: EVIDENCE.E7.title, source: '校园信息中心 · 本届审批', lines: ['本届批准接入的工具只有 SIM-FEST-01。表里没有助手 SIM-HELP-02。顾老师负责查阅审批记录。'] },
  E8: { title: EVIDENCE.E8.title, source: '周宁转来的去标识反馈', lines: ['同学说在提交资料之后收到陌生来电。记录只有先后时间。来电来源、资料流向都还没核实。'] },
  FChen: { title: '陈老师的独立确认', source: '从校园通讯录联系 · 教师本人', lines: ['陈老师确认 SIM-TEMP-07 与本人无关，她没有发布助手推荐。'] },
  FGu: { title: '顾老师的审批回执', source: '校园信息中心 · 管理员核验', lines: ['顾老师核对了正式审批记录。许言允许试用助手时还没有获得学校批准。许言承认自己有流程责任。'] },
  FRelay: { title: '另一条社团转发', source: '林夏从她自己所在的群核对', lines: ['林夏确认另一群也转发过同一来源的推荐。她同意负责发出更正并保留核对记录。'] },
  FContact: { title: '林夏确认的原有联系', source: '校园通讯录 · 由林夏本人核对', lines: ['林夏确认已保存的校内联系仍有效。以后有临时号码自称她时，可从这个原有入口核实。'] },
  FExtra: { title: '旧表流传范围补记', source: '许言核对的社团资料', lines: ['许言确认只在自己管理的社团群发现这份旧表的副本。其他群的流转范围仍待查。'] },
} satisfies Record<string, Material>;

export const JOB = {
  J1: { title: '远程实习介绍', source: '周宁保留的招募材料 · 昨天 14:10', lines: ['同学转来一份远程 AI 实习，文中声称与一家企业合作，并承诺按图像标注任务计酬。'] },
  J2: { title: '已交付的标注任务', source: '周宁的任务记录 · 昨天 15:20', lines: ['周宁做了一次图像标注，任务页显示已提交。这是目前能确认的工作成果。'] },
  J3: { title: '真实到账 20 元', source: '本人确认的收款记录 · 昨天 16:00', lines: ['周宁自己的账单上有该笔入账，金额 20 元。到账记录只对应前一次任务。'] },
  J4: { title: '接下来的垫付要求', source: '项目内消息 · 今天 08:10 与 08:35', lines: ['08:10，项目要求先垫付 300 元才可接下一项任务。08:35，又出现可能继续追加资金的要求。周宁没有付款。'] },
  J5: { title: '企业原有招聘渠道', source: '企业独立招聘入口 · 今天', lines: ['这是从企业原有渠道独立找到的招聘信息。只看项目发来的说明无法核实授权，仍需要拿着材料向招聘方确认。'] },
  JZhou: { title: '周宁核实的初始来源', source: '本人说明 · 周宁', lines: ['周宁说这份材料来自同学转发。转发同学也没有核验过招募人的授权。'] },
  JOfficial: { title: '企业独立核验回复', source: '企业原有招聘渠道 · 核验回执', lines: ['企业确认没有发布该远程实习，也没有授权文中提到的招募人。'] },
  JExtra: { title: '周宁的投递途径补记', source: '周宁逐项核对的备忘', lines: ['周宁再次核对了项目的任务记录与企业自己的招聘页。此前完成的标注留在项目任务页，企业招聘页没有对应的投递。'] },
  JCampus: { title: '校内招募的发布范围', source: '顾老师 · 授权核验记录', lines: ['校内发布负责人确认这条招募出现于开放的兼职信息区。后续由该负责人联系从校内入口提交过资料的人。'] },
} satisfies Record<string, Material>;

export const CAMERA = {
  CParcel: ROOM_NOTES.CParcel,
  C1: { title: '买家的第一张图', source: '买家提交的图像 · 未经平台核验', lines: ['显示金额 800 元。画面上写着订单 CAM-S17、流水 TRACE-14。两项都只是图片里的文字。'] },
  C2: { title: '买家的第二张图', source: '买家提交的图像 · 未经平台核验', lines: ['也显示 800 元。订单为 CAM-S17，流水同为 TRACE-14。买家称这是另一笔付款。'] },
  C3: { title: '原平台订单', source: '沈一通过原有平台打开 · 本人订单', lines: ['相机订单 CAM-S17，标价 800 元。当前状态为“等待买家付款”。寄件预约还没有确认。'] },
  C4: { title: '本人收款账单', source: '沈一的演练收款记录 · 账单', lines: ['找不到与 CAM-S17 对应的任何 800 元入账。没有可退的第二笔到账记录。'] },
  C5: { title: '新开的协助会话', source: '陌生会话 · 身份待查', lines: ['对方自称客服，想在新会话里核查。当前看不到平台官方验明身份的记录。演练中的会话只有本地状态。'] },
  CHelp: { title: '周宁整理的凭证', source: '周宁 · 当事人主动展示的截图', lines: ['周宁整理了两张图片的相同编号，把平台订单和沈一的账单单列为独立来源。结果仍由平台核对。'] },
} satisfies Record<string, Material>;

export const VOICE_TRANSCRIPT = '是我，事情有点急。先帮我处理一下，我回去再跟你解释。';

export const VOICE = {
  V1: { title: '陌生账号发来的语音', source: '新号 · 头像显示林夏', audio: '/assets/audio/voice-rehearsal.wav', lines: [VOICE_TRANSCRIPT, '随附消息称自己是林夏，想请沈一转钱，并要求转给另一位收款人。没有提交转账。'] },
  V2: { title: '熟悉的联系渠道', source: '沈一原有通讯录', lines: ['已有联系来自认识的人。新号提供的新联系方式仍属于同一条消息，不能作为独立核验渠道。'] },
  V3: { title: '林夏的本人回复', source: '此前已确认的联系方式 · 本人独立确认', lines: ['林夏确认手机没坏，她没有借款，也没请沈一给第三方付款。'] },
  V4: { title: '社团的公开动态', source: '以前发布的活动介绍与合照', lines: ['公开介绍中提过语音里涉及的人和活动。它说明这些细节不一定来自私人对话。材料无法追溯冒名者从哪里获得了信息。'] },
  V5: { title: '向其他收件人核对', source: '用原有联系询问相关同学', lines: ['周宁答应核对自己的消息，并协助把更正转给收到类似请求的人。这个协作不会替代林夏本人的确认。'] },
} satisfies Record<string, Material>;

export function evidenceTokens(files: Record<string, Material>, ids: string[]): Token[] {
  return ids.map((id) => ({ id, label: files[id].title, detail: files[id].source }));
}
