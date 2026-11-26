import {
  FlaskConical,
  Layers3,
  Network,
  Newspaper,
  ShieldHalf,
  type LucideIcon,
} from 'lucide-react';
import type { OSView } from '@/types';

export const NAV_ICONS: Record<OSView, LucideIcon> = {
  feed: Newspaper,
  intel: Layers3,
  graph: Network,
  simulation: FlaskConical,
  defense: ShieldHalf,
};
