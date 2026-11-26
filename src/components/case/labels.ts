import type { EvidenceKind, VerificationStatus } from '@/types';

export const KIND_LABEL: Record<EvidenceKind, string> = {
  chat: '群聊转发',
  screenshot: '截图',
  document: '公告',
  log: '日志',
  photo: '照片',
  record: '记录',
};

export const VERIFY_META: Record<
  VerificationStatus,
  { label: string; tone: 'good' | 'warn' | 'danger' | 'quiet' }
> = {
  'cross-checked': { label: '已交叉核实', tone: 'good' },
  disputed: { label: '来源存疑', tone: 'warn' },
  pending: { label: '待核实', tone: 'quiet' },
  stale: { label: '已过期', tone: 'danger' },
};

export const VERIFY_TONE_CLASS = {
  good: 'border-primary/30 bg-primary/[0.08] text-primary',
  warn: 'border-warning/30 bg-warning/[0.08] text-warning',
  danger: 'border-danger/30 bg-danger/[0.08] text-danger',
  quiet: 'border-white/10 bg-white/[0.03] text-secondary',
} as const;
