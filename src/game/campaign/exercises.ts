export const SIGNAL_WINDOW = 12_000;
export type Gate = 'pass' | 'block' | 'hold';

export const SIGNALS: ReadonlyArray<{ name: string; id: string; source: string; decision: Gate; why: string }> = [
  { name: '本届报名入口', id: 'SIM-FEST-01', source: '学校活动平台已列入本届审批', decision: 'pass',
    why: '本届官方入口已核验，保留它，同学才能照常报名。' },
  { name: '教师署名的群转发', id: 'SIM-HELP-02', source: '通讯录核验表显示账号不符，助手也未获审批', decision: 'block',
    why: '独立核验发现账号不符，先截停这个转发入口。' },
  { name: '旧报名表', id: '上一届活动', source: '页首截止时间已经过去，仍有人转发', decision: 'block',
    why: '旧表的届次已经确认，截停它即可保留本届官方入口。' },
  { name: '异常来电反馈', id: '来源未知', source: '只有事件先后时间，缺少资料流向', decision: 'hold',
    why: '保留这条反馈待查。事件的先后顺序还不足以确认资料流向。' },
];

export type ExerciseAttempt =
  | { kind: 'signals'; routes: readonly Gate[] }
  | { kind: 'circuit'; turns: readonly number[] };

type Direction = 0 | 1 | 2 | 3;
const OPPOSITE: Record<Direction, Direction> = { 0: 2, 1: 3, 2: 0, 3: 1 };
const OFFSETS: Readonly<Record<Direction, readonly [number, number]>> = { 0: [0, -1], 1: [1, 0], 2: [0, 1], 3: [-1, 0] };
export const DIRECTION_NAMES = ['上', '右', '下', '左'] as const;
export const CIRCUIT_TILES: ReadonlyArray<{ label: string; ports: readonly Direction[] }> = [
  { label: '转接角 A', ports: [1, 2] },
  { label: '直线 B', ports: [3, 1] },
  { label: '转接角 C', ports: [2, 3] },
  { label: '任务报酬', ports: [3, 0] },
  { label: '待付资金', ports: [] },
  { label: '本人账单', ports: [0, 1] },
];
export const INITIAL_TURNS = [3, 1, 2] as const;
export const SUGGESTED_TURNS = [0, 2, 0] as const;

export function portsFor(index: number, turns: readonly number[]) {
  return CIRCUIT_TILES[index].ports.map((port) => ((port + (turns[index] ?? 0)) % 4) as Direction);
}

export function traceCircuit(turns: readonly number[]) {
  const path: number[] = [];
  if (turns.length !== 3 || turns.some((turn) => !Number.isInteger(turn) || turn < 0 || turn > 3)) return { connected: false, path, stop: 3 };
  let x = 0;
  let y = 1;
  let input: Direction = 3;
  while (x >= 0 && x < 3 && y >= 0 && y < 2) {
    const index = y * 3 + x;
    const ports = portsFor(index, turns);
    if (path.includes(index) || ports.length !== 2 || !ports.includes(input)) return { connected: false, path, stop: index };
    path.push(index);
    const exit: Direction = ports[0] === input ? ports[1] : ports[0];
    if (index === 5 && exit === 1) return { connected: true, path, stop: index };
    const [dx, dy] = OFFSETS[exit];
    x += dx;
    y += dy;
    input = OPPOSITE[exit];
  }
  return { connected: false, path, stop: path.at(-1) ?? 3 };
}

export function completedExercise(caseId: 'festival' | 'job', attempt: ExerciseAttempt) {
  return caseId === 'festival'
    ? attempt.kind === 'signals' && attempt.routes.length === SIGNALS.length && SIGNALS.every((signal, index) => signal.decision === attempt.routes[index])
    : attempt.kind === 'circuit' && traceCircuit(attempt.turns).connected;
}
