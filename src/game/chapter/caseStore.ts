import { create } from 'zustand';
import { CONTACT_IDS, RISK_IDS, type Mode } from './caseFile';
import { createCase, reduceCase, SAVE_VERSION, validSavedEvidence, type CaseCommand, type CaseState } from './caseEngine';

const SAVE_KEY = 'phantom.chapter-trust-fracture';
const OLD_KEY = 'phantom.vn.run.v2';
const QUIZ_KEY = 'phantom.chapter-quiz.v1';

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function parseCase(raw: string | null): CaseState | null {
  if (!raw) return null;
  try {
    const save = JSON.parse(raw) as Partial<CaseState> | null;
    if (!save || save.version !== SAVE_VERSION || typeof save.id !== 'string' || typeof save.time !== 'string'
      || !['full', 'quick'].includes(save.mode ?? '')
      || !['briefing', 'investigation', 'reversal', 'protection', 'defense', 'ending'].includes(save.phase ?? '')
      || !Number.isInteger(save.points) || save.points! < 0 || save.points! > 6
      || !Array.isArray(save.saved) || !save.saved.every(validSavedEvidence)
      || !Array.isArray(save.verified) || !save.verified.every((id) => CONTACT_IDS.includes(id))
      || !RISK_IDS.every((id) => Array.isArray(save.slots?.[id])) || !save.simulations || !save.protection
      || !save.world || !Array.isArray(save.world.pending) || !save.world.pending.every((id) => RISK_IDS.includes(id))
      || ![1, 2, 3, 4].includes(save.round ?? 0)
      || !Array.isArray(save.events) || !Array.isArray(save.receipts)) return null;
    return save as CaseState;
  } catch { return null; }
}

export type QuizGroup = 'A' | 'B';
export type QuizAnswer = 0 | 1 | 2;

export interface QuizEntry {
  mode: Mode;
  preGroup: QuizGroup;
  pre: QuizAnswer[] | null;
  post: QuizAnswer[] | null;
  preSkipped?: boolean;
}

interface QuizRecords { next: QuizGroup; runs: Record<string, QuizEntry> }

function readQuiz(): QuizRecords {
  try {
    const parsed = JSON.parse(read(QUIZ_KEY) ?? 'null') as QuizRecords | null;
    if (parsed && (parsed.next === 'A' || parsed.next === 'B') && parsed.runs) return parsed;
  } catch { /* A damaged separate questionnaire must not affect the case. */ }
  return { next: 'A', runs: {} };
}

export function pairedGroup(group: QuizGroup): QuizGroup { return group === 'A' ? 'B' : 'A'; }

function snapshotFromDisk() {
  const raw = read(SAVE_KEY);
  const run = parseCase(raw);
  return { run, outdated: !run && Boolean(raw || read(OLD_KEY)), quizzes: readQuiz() };
}

interface CaseSession {
  run: CaseState | null;
  outdated: boolean;
  storageFailed: boolean;
  quizzes: QuizRecords;
  start: (mode: Mode, quiz: boolean) => void;
  act: (command: CaseCommand) => boolean;
  recordQuiz: (stage: 'pre' | 'post', answers: QuizAnswer[] | null) => void;
  reload: () => void;
  clear: () => void;
}

export const useCaseSession = create<CaseSession>((set, get) => ({
  ...snapshotFromDisk(), storageFailed: false,
  start(mode, quiz) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const run = createCase(id, mode);
    let quizzes = get().quizzes;
    let quizSaved = true;
    if (quiz) {
      quizzes = { next: pairedGroup(quizzes.next), runs: { ...quizzes.runs, [id]: { mode, preGroup: quizzes.next, pre: null, post: null } } };
      quizSaved = write(QUIZ_KEY, quizzes);
    }
    set({ run, outdated: false, quizzes, storageFailed: !write(SAVE_KEY, run) || !quizSaved });
  },
  act(command) {
    const { run } = get();
    if (!run) return false;
    const next = reduceCase(run, command);
    if (next === run) return false;
    set({ run: next, storageFailed: !write(SAVE_KEY, next) });
    return true;
  },
  recordQuiz(stage, answers) {
    const { run, quizzes } = get();
    if (!run || (stage === 'pre' ? run.phase !== 'briefing' : run.phase !== 'ending')) return;
    const item = quizzes.runs[run.id];
    if (!item || item[stage] || (answers && answers.length !== 3) || (!answers && stage === 'post')) return;
    const updated: QuizEntry = { ...item, [stage]: answers };
    if (stage === 'pre' && !answers) updated.preSkipped = true;
    const next = { ...quizzes, runs: { ...quizzes.runs, [run.id]: updated } };
    set({ quizzes: next, storageFailed: !write(QUIZ_KEY, next) || get().storageFailed });
  },
  reload() { set(snapshotFromDisk()); },
  clear() {
    try {
      for (const key of [SAVE_KEY, OLD_KEY, QUIZ_KEY]) localStorage.removeItem(key);
      set({ ...snapshotFromDisk(), storageFailed: false });
    } catch { set({ storageFailed: true }); }
  },
}));

export function syncCaseTabs() {
  const listener = (event: StorageEvent) => {
    if (event.key === SAVE_KEY || event.key === QUIZ_KEY || event.key === null) useCaseSession.getState().reload();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
