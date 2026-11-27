import { ASSETS } from '../data/assets';
import type { Material } from './types';

export type PropIcon = 'phone' | 'notice' | 'folder' | 'screen' | 'wallet' | 'photo' | 'box';
export interface SearchProp {
  id: string;
  label: string;
  icon: PropIcon;
  position: readonly [number, number];
}
export interface SearchArea {
  background: string;
  location: string;
  props: readonly SearchProp[];
  relatedReads?: readonly string[];
}

const prop = (id: string, label: string, icon: PropIcon, x: number, y: number): SearchProp => ({ id, label, icon, position: [x, y] });

export const OPENING_AREA: SearchArea = {
  background: ASSETS.activityRoom, location: '科技文化节 · 活动室',
  props: [
    prop('E1', '墙上公告', 'notice', 45, 33),
    prop('E2', '桌上的手机', 'phone', 57, 85),
    prop('FShift', '签到夹', 'folder', 22, 55),
  ],
};

const OFFICE: SearchArea = {
  background: ASSETS.serviceHall, location: '校园信息中心 · 值班室',
  relatedReads: ['f-notices', 'f-process'],
  props: [
    prop('E1', '值班公告', 'notice', 8.5, 30),
    prop('E4', '筹备群记录', 'phone', 37, 55),
    prop('E7', '桌上的审批夹', 'folder', 64, 54),
    prop('E5', '测试平板', 'screen', 54, 47),
    prop('E3', '登记终端', 'screen', 84, 43),
  ],
};

const JOB_DESK: SearchArea = {
  background: ASSETS.activityRoom, location: '活动室 · 周宁的桌边',
  relatedReads: ['j-receipt', 'j-next'],
  props: [
    prop('J1', '招募海报', 'notice', 43, 31),
    prop('J2', '标注任务笔记', 'folder', 17, 57),
    prop('J3', '收款账单', 'wallet', 58, 61),
    prop('J4', '项目群消息', 'phone', 79, 58),
    prop('J5', '企业招聘页', 'screen', 72, 34),
  ],
};

const CAMERA_DESK: SearchArea = {
  background: ASSETS.dormNight, location: '宿舍 · 沈一的书桌',
  relatedReads: ['c-shots', 'c-ledger'],
  props: [
    prop('C1', '买家的图片 A', 'photo', 24, 42),
    prop('C2', '买家的图片 B', 'photo', 48, 34),
    prop('C3', '平台订单', 'screen', 76, 42),
    prop('C4', '收款账单', 'wallet', 55, 60),
    prop('CParcel', '相机与寄件条', 'box', 21, 64),
  ],
};

export const SEARCH_AREAS: Readonly<Partial<Record<string, SearchArea>>> = {
  'f-notices': OFFICE,
  'f-process': OFFICE,
  'f-last': {
    background: ASSETS.activityRoom, location: '活动室 · 器材架旁',
    props: [
      prop('E6', '上届资料夹', 'folder', 22, 43),
      prop('E8', '周宁的留言', 'phone', 56, 63),
      prop('FShift', '签到夹', 'notice', 76, 39),
    ],
  },
  'j-receipt': JOB_DESK,
  'j-next': JOB_DESK,
  'c-shots': CAMERA_DESK,
  'c-ledger': CAMERA_DESK,
  'v-post': {
    background: ASSETS.dormNight, location: '宿舍 · 沈一的手机',
    props: [prop('V2', '旧通讯录', 'phone', 32, 49), prop('V4', '社团相册', 'photo', 67, 56)],
  },
};

export const OPENING_FILES = ['E1', 'E2'] as const;
export type OpeningFile = typeof OPENING_FILES[number];
export type OpeningBeat = 'arrival' | 'search' | 'compare' | 'invite';

export type FocusField = { id: string; title: string; value: string };
export interface FocusCard {
  title: string;
  source: string;
  fields: readonly FocusField[];
}

export const NOTICE_COMPARISON = [
  { title: '学校活动公告', source: '活动室墙上 · 本届',
    fields: [{ id: 'official-session', title: '活动', value: '科技文化节' }, { id: 'official-route', title: '报名入口', value: 'SIM-FEST-01' }] },
  { title: '林夏的群转发', source: '手机 · 志愿者群',
    fields: [{ id: 'relay-session', title: '活动', value: '科技文化节' }, { id: 'relay-route', title: '报名入口', value: 'SIM-HELP-02' }] },
] satisfies readonly [FocusCard, FocusCard];

export const PAYMENT_COMPARISON = [
  { title: '买家截图 A', source: '消息附件 · 待核',
    fields: [{ id: 'c1-order', title: '订单', value: 'CAM-S17' }, { id: 'c1-trace', title: '流水号', value: 'TRACE-14' }, { id: 'c1-amount', title: '显示金额', value: '¥800' }] },
  { title: '买家截图 B', source: '消息附件 · 待核',
    fields: [{ id: 'c2-order', title: '订单', value: 'CAM-S17' }, { id: 'c2-trace', title: '流水号', value: 'TRACE-14' }, { id: 'c2-amount', title: '显示金额', value: '¥800' }] },
] satisfies readonly [FocusCard, FocusCard];

export function foundPair(picks: readonly string[], expected: readonly string[]) {
  return picks.length === 2 && expected.every((field) => picks.includes(field));
}

export const PAYMENT_FIELDS = ['c1-trace', 'c2-trace'] as const;
export const NOTICE_FIELDS = ['official-route', 'relay-route'] as const;

export const ROOM_NOTES: Record<'FShift' | 'CParcel', Material> = {
  FShift: { title: '志愿者签到夹', source: '活动室 · 林夏整理',
    lines: ['周宁答应今晚负责音响，旧表上的“已提交”却没有进入本届分组。林夏把他的名字用铅笔写在名单角落，等从正式入口补上。'] },
  CParcel: { title: '书桌上的相机盒', source: '沈一 · 尚未寄出的包裹',
    lines: ['相机已经装好，寄件单还是空白。沈一想拿这笔钱换一支镜头，这周还约了林夏拍文化节的舞台。'] },
};
