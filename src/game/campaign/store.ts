import { create } from 'zustand';
import { CAMPAIGN_CASES } from './cases';
import { campaignReducer, openingBeat, startCampaign, type Campaign, type Command } from './engine';
import { CASE_IDS } from './types';

const SAVE_KEY = 'phantom.campaign.v6';

function load(): Campaign | null {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as Campaign | null;
    if (!save || save.version !== 6 || typeof save.id !== 'string'
      || !['opening', 'case', 'switch', 'followup', 'ending'].includes(save.stage)
      || !Number.isInteger(save.caseIndex) || !Number.isInteger(save.stepIndex)
      || !CASE_IDS[save.caseIndex] || !CAMPAIGN_CASES[CASE_IDS[save.caseIndex]].steps[save.stepIndex]
      || !CASE_IDS.every((id) => {
        const progress = save.cases?.[id];
        return progress?.completed && Array.isArray(progress.seen)
          && progress.seen.every((file) => Object.hasOwn(CAMPAIGN_CASES[id].files, file))
          && Array.isArray(progress.world?.receipts);
      })
      || !Array.isArray(save.observations) || !Array.isArray(save.followups) || !Array.isArray(save.spread)) return null;
    return save;
  } catch { return null; }
}

function save(run: Campaign) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(run)); return true; }
  catch { return false; }
}

interface Session {
  run: Campaign | null;
  storageFailed: boolean;
  start: () => Campaign;
  act: (command: Command) => void;
}

export const useCampaign = create<Session>((set, get) => ({
  run: load(), storageFailed: false,
  start() {
    const run = startCampaign();
    set({ run, storageFailed: !save(run) });
    return run;
  },
  act(command) {
    const { run, storageFailed } = get();
    if (!run) return;
    const current = storageFailed ? null : load();
    if (current && (current.id !== run.id || current.stage !== run.stage
      || current.caseIndex !== run.caseIndex || current.stepIndex !== run.stepIndex
      || (current.stage === 'opening' && openingBeat(current) !== openingBeat(run)))) {
      set({ run: current });
      return;
    }
    const before = current ?? run;
    const next = campaignReducer(before, command);
    if (next !== before) set({ run: next, storageFailed: !save(next) });
  },
}));

export function syncCampaignTabs() {
  function sync(event: StorageEvent) {
    if (event.key === SAVE_KEY || event.key === null) useCampaign.setState({ run: load(), storageFailed: false });
  }
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
}

const OPEN_KEY = 'phantom.campaign.open';

export function openInTab(id?: string) {
  try { if (id) sessionStorage.setItem(OPEN_KEY, id); else sessionStorage.removeItem(OPEN_KEY); }
  catch { /* The campaign can still be entered from the cover. */ }
}

export function tabRun() {
  try { return sessionStorage.getItem(OPEN_KEY); }
  catch { return null; }
}
