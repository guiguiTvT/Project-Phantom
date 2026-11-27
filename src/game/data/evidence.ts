import { ASSETS } from './assets';
import type { Hotspot, VnEvidence, VnEvidenceId } from '../types';

export const CASE_META = {
  title: '信任裂缝',
  chapter: '第一章',
  caseNo: 'CASE 01',
  timeLabel: '文化节开幕前 48 小时',
  subtitle: '活动室里的报名通知，和官方公告对不上。',
  estimatedMinutes: '3–5 分钟',
};

export const VN_EVIDENCE: VnEvidence[] = [
  {
    id: 'E1',
    title: '官方报名通知',
    source: '校园公告 · 学生工作处',
    time: 'T-48h',
    verification: 'verified',
    description: '仅通过学校官方平台报名，未授权任何第三方小程序。截止延至 11-27 21:00。',
    image: ASSETS.evidence.E1,
    collectible: true,
  },
  {
    id: 'E2',
    title: '社团群里的「更方便」通知',
    source: '社团筹备群 · 转发',
    time: 'T-36h',
    verification: 'pending',
    description: '转发称用「报名助手」更快，今晚 23:59 前必须补填。发送账号没有历史发言。',
    image: ASSETS.evidence.E2,
    collectible: true,
  },
  {
    id: 'E3',
    title: '报名服务异常日志',
    source: '活动平台 · 系统日志',
    time: 'T-24h',
    verification: 'verified',
    description: '提交量突增六倍，日志里出现身份证号、宿舍等报名之外的字段。',
    image: ASSETS.evidence.E3,
    collectible: true,
  },
  {
    id: 'E4',
    title: '「陈老师」的私聊截图',
    source: '私聊转发 · 截图',
    time: 'T-30h',
    verification: 'pending',
    description: '对方用私人账号催你点小程序，还让你「先别在群里问」，身份未核验。',
    image: ASSETS.evidence.E4,
    collectible: true,
  },
  {
    id: 'E5',
    title: '小程序隐私弹窗',
    source: '小程序页面 · 截图',
    time: 'T-20h',
    verification: 'verified',
    description: '报名助手索取通讯录和定位权限，明显超出报名所需。',
    image: ASSETS.evidence.E5,
    collectible: true,
  },
  {
    id: 'E6',
    title: '仍在流传的旧表单',
    source: '历史链接 · 截图',
    time: 'T-72h',
    verification: 'stale',
    description: '旧表截止 11-25 23:59，已被延期公告覆盖，却仍在群里被转发。',
    image: ASSETS.evidence.E6,
    collectible: true,
  },
  {
    id: 'E7',
    title: '顾老师的审批说明',
    source: '校园公告 · 网络与空间管理办公室',
    time: 'T-48h',
    verification: 'verified',
    description: '未审批任何「报名助手」小程序；官方截止时间为 11-27 21:00。',
    image: ASSETS.evidence.E7,
    collectible: true,
  },
  {
    id: 'E8',
    title: '同学反馈的异常情况',
    source: '私聊 · 匿名',
    time: 'T-12h',
    verification: 'pending',
    description: '同学在小程序报名后接到陌生电话，对方能说出姓名和宿舍。',
    image: ASSETS.evidence.E8,
    collectible: true,
  },
];

export const VN_EVIDENCE_BY_ID = Object.fromEntries(
  VN_EVIDENCE.map((item) => [item.id, item]),
) as Record<VnEvidenceId, VnEvidence>;

export const CASE_HOTSPOTS: Hotspot[] = [
  {
    id: 'hotspot-phone',
    evidenceId: 'E2',
    label: '桌上的手机',
    hint: '屏幕还亮着',
    icon: 'phone',
    x: 56.5,
    y: 69,
  },
  {
    id: 'hotspot-laptop',
    evidenceId: 'E4',
    label: '开着的电脑',
    hint: '聊天窗口没关',
    icon: 'laptop',
    x: 65.5,
    y: 56,
  },
  {
    id: 'hotspot-board',
    evidenceId: 'E7',
    label: '公告板',
    hint: '新钉了一张通知',
    icon: 'board',
    x: 31,
    y: 26,
  },
];

export const HOTSPOT_BY_ID = Object.fromEntries(
  CASE_HOTSPOTS.map((item) => [item.id, item]),
) as Record<string, Hotspot>;

export const VERIFICATION_LABEL = {
  verified: '已核验',
  pending: '未核验',
  stale: '已过期',
} as const;
