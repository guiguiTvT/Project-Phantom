import type {
  ChannelMeta,
  College,
  DemoNotice,
  EvidenceKind,
  EvidenceSourceType,
  FeedChannel,
  NpcMood,
  OSView,
  VerificationStatus,
  WorldState,
} from '@/types';

export const GAME_META = {
  title: 'PROJECT PHANTOM',
  subtitle: '破壁行动',
  englishTitle: 'PROJECT PHANTOM // BREACH PROTOCOL',
  chapter: '第一章 · 信任裂缝',
  edition: 'HACK4GOOD 2026 · 技术向善',
  version: '0.2.0-phase1',
  fictiveNotice: '本作中的校园、人物、账号与权限均为虚构，不连接任何真实系统。',
};

export const SAVE_KEY = 'phantom.save.v2';
export const SAVE_VERSION = 2;

export const INITIAL_AP_REDTEAM = 12;
export const INITIAL_AP_DEFENSE = 10;

export const INITIAL_WORLD: WorldState = {
  security: 58,
  operation: 64,
  relations: 61,
  repair: 12,
};

export const COLLEGES: College[] = [
  {
    id: 'computing',
    name: '计算机学院',
    en: 'COMPUTING',
    hint: '常在机房、实验室与深夜的日志之间出没。',
    glyph: '<>',
  },
  {
    id: 'media',
    name: '传媒与艺术学院',
    en: 'MEDIA & ARTS',
    hint: '对镜头、排版和人群里的细节格外敏感。',
    glyph: '◒',
  },
  {
    id: 'humanities',
    name: '人文与社会科学学院',
    en: 'HUMANITIES',
    hint: '擅长阅读语气、动机与话语背后的缝隙。',
    glyph: '¶',
  },
  {
    id: 'science',
    name: '物理与生命科学学院',
    en: 'SCIENCE',
    hint: '习惯先做对照实验，再下结论。',
    glyph: '∆',
  },
];

export const CALLSIGNS = ['灰雀', '折光', '白噪', '迟舟', '夜航', '空集', '纸鸢', '浮标'];

export const INTEREST_TAGS = [
  '城市摄影',
  '桌游',
  '独立音乐',
  '网络安全',
  '志愿服务',
  '科幻写作',
  '舞台灯光',
  '咖啡',
  '攀岩',
  '播客',
];

export const AVATAR_IDS = [
  'sigil-01',
  'sigil-02',
  'sigil-03',
  'sigil-04',
  'sigil-05',
  'sigil-06',
  'sigil-07',
  'sigil-08',
];

export const CLEARANCE_LABEL = 'PHANTOM-RT-07 · 隔离环境授权';

export const CHANNELS: ChannelMeta[] = [
  { id: 'club', label: '社团频道', en: 'CLUB' },
  { id: 'notice', label: '校园公告', en: 'NOTICE' },
  { id: 'life', label: '生活杂谈', en: 'LIFE' },
  { id: 'study', label: '学习互助', en: 'STUDY' },
  { id: 'treehole', label: '匿名树洞', en: 'TREEHOLE' },
  { id: 'system', label: '系统通知', en: 'SYSTEM' },
];

export const CHANNEL_LABEL: Record<FeedChannel, string> = {
  club: '社团频道',
  notice: '校园公告',
  life: '生活杂谈',
  study: '学习互助',
  treehole: '匿名树洞',
  system: '系统通知',
};

export const VERIFICATION_META: Record<
  VerificationStatus,
  { label: string; hint: string }
> = {
  'cross-checked': {
    label: '交叉可核验',
    hint: '存在可相互印证的外部记录，但仍需结合时间线判断。',
  },
  pending: {
    label: '来源待补充',
    hint: '目前仅有一个来源，无法独立复核。',
  },
  stale: {
    label: '时间戳过期',
    hint: '信息发布后出现过更新版本，内容可能已经改变。',
  },
  disputed: {
    label: '来源存在分歧',
    hint: '不同来源对同一事项的描述并不一致。',
  },
};

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  screenshot: '截图快照',
  document: '文档',
  log: '系统日志',
  chat: '对话片段',
  photo: '现场照片',
  record: '记录单',
};

export const EVIDENCE_SOURCE_LABEL: Record<EvidenceSourceType, string> = {
  official: '官方渠道',
  personal: '个人发布',
  system: '系统生成',
  anonymous: '匿名来源',
  offline: '线下取得',
};

export const NPC_MOOD_META: Record<
  NpcMood,
  { label: string; tone: 'primary' | 'secondary' | 'warning' | 'danger' }
> = {
  steady: { label: '平稳', tone: 'primary' },
  busy: { label: '忙碌', tone: 'secondary' },
  worried: { label: '担忧', tone: 'warning' },
  guarded: { label: '审慎', tone: 'secondary' },
  warm: { label: '亲和', tone: 'primary' },
};

export const PHASE_META = {
  redteam: { label: 'RED TEAM', sub: '授权调查', tone: 'primary' as const },
  reversal: { label: 'REVERSAL', sub: '权限失效', tone: 'danger' as const },
  defense: { label: 'STUDENT', sub: '学生视角', tone: 'warning' as const },
  result: { label: 'DEBRIEF', sub: '行为复盘', tone: 'primary' as const },
};

export interface NavItemMeta {
  id: OSView;
  label: string;
  en: string;
  note: string;
  status: 'live' | 'phase2' | 'phase4';
}

export const NAV_ITEMS: NavItemMeta[] = [
  { id: 'feed', label: '校园动态墙', en: 'STREAM', note: '浏览公开信息', status: 'live' },
  { id: 'intel', label: '情报关联板', en: 'INTEL BOARD', note: '归档与比对证据', status: 'live' },
  { id: 'graph', label: '人物关系图', en: 'RELATIONS', note: '观察校园关系', status: 'live' },
  { id: 'simulation', label: '风险模拟舱', en: 'SIMULATION', note: '隔离环境推演', status: 'phase2' },
  { id: 'defense', label: '防御控制台', en: 'DEFENSE', note: '学生身份启用', status: 'phase4' },
];

export const DEMO_NOTICES: DemoNotice[] = [
  {
    id: 'notice-cache',
    tone: 'warning',
    title: '缓存时间戳不一致',
    body: '活动平台的缓存快照与教务处公告在截止时间上存在差异，建议比对来源。',
    at: '19:02',
  },
  {
    id: 'notice-sandbox',
    tone: 'info',
    title: '沙箱维护窗口',
    body: '网络安全实验室今日 20:00–22:00 进行隔离环境核查，模拟舱暂不可用。',
    at: '18:45',
  },
  {
    id: 'notice-ap',
    tone: 'info',
    title: '行动点规则',
    body: '浏览、归档不消耗行动点。有效调查、核验与模拟由规则引擎独立扣除。',
    at: '18:30',
  },
];

export const WORLD_BANDS: Record<
  keyof WorldState,
  { label: string; bands: { max: number; text: string; tone: 'danger' | 'warning' | 'primary' | 'secondary' }[] }
> = {
  security: {
    label: '安全态势',
    bands: [
      { max: 39, text: '失序', tone: 'danger' },
      { max: 59, text: '波动', tone: 'warning' },
      { max: 79, text: '受控', tone: 'primary' },
      { max: 100, text: '稳定', tone: 'primary' },
    ],
  },
  operation: {
    label: '运行状态',
    bands: [
      { max: 39, text: '受阻', tone: 'danger' },
      { max: 59, text: '迟滞', tone: 'warning' },
      { max: 79, text: '正常', tone: 'secondary' },
      { max: 100, text: '顺畅', tone: 'primary' },
    ],
  },
  relations: {
    label: '校园关系',
    bands: [
      { max: 39, text: '紧张', tone: 'danger' },
      { max: 59, text: '疏离', tone: 'warning' },
      { max: 79, text: '平稳', tone: 'secondary' },
      { max: 100, text: '互信', tone: 'primary' },
    ],
  },
  repair: {
    label: '修复进度',
    bands: [
      { max: 19, text: '未展开', tone: 'secondary' },
      { max: 49, text: '初步', tone: 'warning' },
      { max: 79, text: '推进中', tone: 'primary' },
      { max: 100, text: '收束', tone: 'primary' },
    ],
  },
};
