import { WORLD_BANDS } from '@/data/gameConfig';
import type { WorldState } from '@/types';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getMonth() + 1}.${date.getDate()} ${WEEKDAYS[date.getDay()]}`;
}

export function formatSaveTime(iso: string | null | undefined): string {
  if (!iso) return '尚无存档';
  return formatStamp(iso);
}

export function worldBand(key: keyof WorldState, value: number) {
  const config = WORLD_BANDS[key];
  const band = config.bands.find((item) => value <= item.max) ?? config.bands[config.bands.length - 1];
  return { label: config.label, ...band };
}

export function initials(name: string): string {
  return name.trim().slice(0, 1);
}
