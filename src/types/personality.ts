export type DimId = 'evidence' | 'caution' | 'protection' | 'system';

export type PersonalityCode =
  | 'ECPS'
  | 'ECPR'
  | 'ECFS'
  | 'ECFR'
  | 'EAPS'
  | 'EAPR'
  | 'EAFS'
  | 'EAFR'
  | 'ICPS'
  | 'ICPR'
  | 'ICFS'
  | 'ICFR'
  | 'IAPS'
  | 'IAPR'
  | 'IAFS'
  | 'IAFR';

export type AxisLetter = 'E' | 'I' | 'C' | 'A' | 'P' | 'F' | 'S' | 'R';

export interface DimAccumulator {
  /** 带方向累计值，正负对应主导字母 */
  score: number;
  /** 参与该维度的有效行为次数 */
  count: number;
}

export type PersonalityState = Record<DimId, DimAccumulator>;

export interface PersonalityGlyphSpec {
  /** 原创几何符印的构图编号 0-15 */
  seed: number;
  /** 内部纹样：eye / shield / circuit / orbit / bridge / prism */
  motif: 'eye' | 'shield' | 'circuit' | 'orbit' | 'bridge' | 'prism';
}

export interface PersonalityConfig {
  code: PersonalityCode;
  nameCn: string;
  nameEn: string;
  codeName: string;
  themeColor: string;
  glyph: PersonalityGlyphSpec;
  tagline: string;
  description: string;
  style: string;
  strengths: string[];
  blindspots: string[];
  advice: string[];
}

export interface PersonalityReading {
  code: PersonalityCode | null;
  mixedDims: DimId[];
  insufficientDims: DimId[];
  normalized: Record<DimId, number>;
  sampleCount: number;
}
