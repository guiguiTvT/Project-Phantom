import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES } from '@/game/campaign/cases';
import { INITIAL_TURNS, SIGNALS, SUGGESTED_TURNS, traceCircuit } from '@/game/campaign/exercises';
import { NOTICE_FIELDS, PAYMENT_FIELDS } from '@/game/campaign/investigation';
import { campaignReducer, currentCase, currentStep, endingFor, hasMet, knowsZhou, openingBeat, pendingChecks, results, savedLin, startCampaign, styleFor,
  type Campaign, type Command } from '@/game/campaign/engine';
import type { CaseId, Disposition, Letter } from '@/game/campaign/types';

type Dispositions = Partial<Record<CaseId, Disposition>>;
type RunOptions = { dispositions?: Dispositions; skip?: string[]; choices?: Partial<Record<string, Letter>>; saveLin?: boolean };

const act = (run: Campaign, command: Command) => campaignReducer(run, command);

function enter(id: string) {
  let run = act(startCampaign(id), { type: 'advance' });
  for (const record of ['E1', 'E2']) run = act(run, { type: 'explore', record });
  run = act(run, { type: 'advance' });
  run = act(run, { type: 'noticePair', fields: NOTICE_FIELDS, lead: 'notice' });
  return act(run, { type: 'authorize' });
}

function play(options: RunOptions = {}) {
  let run = enter('test');
  for (let index = 0; index < 80; index++) {
    const act = (command: Command) => { run = campaignReducer(run, command); };
    if (run.stage === 'switch') { act({ type: 'advance' }); continue; }
    if (run.stage !== 'case') return run;
    const definition = currentCase(run);
    const step = currentStep(run);
    if (options.skip?.includes(step.id)) act({ type: 'skip' });
    else switch (step.kind) {
      case 'read': step.cards.forEach((record) => act({ type: 'read', record })); break;
      case 'observe': act({ type: 'observe', letter: options.choices?.[step.id] ?? step.choices[0].letter }); break;
      case 'puzzle': act({ type: 'solve', attempt: step.puzzle.answer }); break;
      case 'verify': act(step.id === 'v-owner' ? { type: 'call', via: savedLin(run) ? 'saved' : 'trusted-friend' } : { type: 'verify' }); break;
      case 'simulation': act({ type: 'simulate', attempt: definition.id === 'festival'
        ? { kind: 'signals', routes: SIGNALS.map((signal) => signal.decision) } : { kind: 'circuit', turns: SUGGESTED_TURNS } }); break;
      case 'contact': act({ type: options.saveLin === false ? 'skip' : 'saveContact' }); break;
      case 'assistance': act({ type: 'lockOrder' }); act({ type: 'proceedOrder' }); break;
      case 'resolve': act({ type: 'dispose', disposition: options.dispositions?.[definition.id] ?? 'resolve' }); break;
    }
    const previous = run;
    act({ type: 'advance' });
    if (previous === run) throw new Error(`Player stuck at ${step.id}`);
  }
  throw new Error('The campaign never reached the final followups');
}

const at = (run: Campaign, id: CaseId, step: string): Campaign => ({ ...run, stage: 'case',
  caseIndex: CAMPAIGN_CASES[id].number - 1, stepIndex: CAMPAIGN_CASES[id].steps.findIndex((item) => item.id === step) });

describe('the campaign', () => {
  it('starts as a volunteer, introduces characters and grants authorization after a real investigation', () => {
    let run = startCampaign('intro');
    expect(act(run, { type: 'authorize' })).toBe(run);
    run = act(run, { type: 'meet', person: 'linxia' });
    expect(hasMet(run, 'linxia')).toBe(true);
    expect(hasMet(run, 'gu')).toBe(false);
    run = act(run, { type: 'advance' });
    expect(openingBeat(run)).toBe('search');
    expect(act(run, { type: 'explore', record: 'FChen' })).toBe(run);
    run = act(run, { type: 'explore', record: 'FShift' });
    run = act(run, { type: 'explore', record: 'E2' });
    expect(act(run, { type: 'advance' })).toBe(run);
    run = act(run, { type: 'explore', record: 'E1' });
    run = act(run, { type: 'advance' });
    expect(openingBeat(run)).toBe('compare');
    expect(act(run, { type: 'noticePair', fields: ['official-session', 'relay-session'], lead: 'notice' })).toBe(run);
    run = act(run, { type: 'noticePair', fields: NOTICE_FIELDS, lead: 'notice' });
    expect(openingBeat(run)).toBe('invite');
    expect(run.cases.festival.seen).toEqual(['FShift', 'E2', 'E1']);
    run = act(run, { type: 'authorize' });
    expect(currentStep(run).id).toBe('f-notices');
    expect(run.cases.festival.completed['f-entry']).toBe('done');
  });

  it('lets players choose the order in which they search a room', () => {
    let run = enter('office');
    for (const record of ['E7', 'E5', 'E3']) run = act(run, { type: 'explore', record });
    expect(run.cases.festival.completed['f-process']).toBe('done');
    expect(act(run, { type: 'advance' })).toBe(run);
    run = act(run, { type: 'explore', record: 'E4' });
    expect(currentStep(act(run, { type: 'advance' })).id).toBe('f-sender');
  });

  it('only credits a completed exercise, and the circuit lights the real connected path', () => {
    let run = at(enter('trials'), 'festival', 'f-sim');
    expect(act(run, { type: 'simulate', attempt: { kind: 'signals', routes: ['pass', 'pass'] } })).toBe(run);
    run = act(run, { type: 'simulate', attempt: { kind: 'signals', routes: SIGNALS.map((signal) => signal.decision) } });
    expect(run.cases.festival).toMatchObject({ exercise: 'signals', requiredSpent: 2 });
    expect(traceCircuit(INITIAL_TURNS)).toMatchObject({ connected: false });
    expect(traceCircuit(SUGGESTED_TURNS)).toMatchObject({ connected: true, path: [3, 0, 1, 2, 5] });
  });

  it('only files duplicated flow from matching evidence and uses old contacts for independent calls', () => {
    let run = at(enter('phone'), 'camera', 'c-ids');
    expect(act(run, { type: 'paymentPair', fields: PAYMENT_FIELDS })).toBe(run);
    run.cases.camera.seen = ['C1', 'C2'];
    expect(act(run, { type: 'paymentPair', fields: ['c1-amount', 'c2-amount'] })).toBe(run);
    expect(act(run, { type: 'paymentPair', fields: PAYMENT_FIELDS }).cases.camera.completed['c-ids']).toBe('done');
    run = at(run, 'voice', 'v-owner');
    expect(act(run, { type: 'call', via: 'saved' })).toBe(run);
    expect(act(run, { type: 'call', via: 'trusted-friend' }).cases.voice.seen).toContain('V3');
  });

  it('runs both roles in order and scores exactly 12 observations', () => {
    const run = play({ choices: { 'j-method': 'R' } });
    expect(run.stage).toBe('followup');
    expect(run.cases.festival.requiredSpent).toBe(4);
    expect(run.cases.job.requiredSpent).toBe(4);
    expect(run.cases.camera.requiredSpent).toBe(0);
    expect(savedLin(run)).toBe(true);
    expect(knowsZhou(run)).toBe(true);
    expect(run.spread).toEqual([]);
    expect(run.observations).toHaveLength(12);
    expect(styleFor(run).dimensions.map((dimension) => dimension.actions.length)).toEqual([3, 3, 3, 3]);
    expect(styleFor(run).profile?.code).toBe('ECPS');
  });

  it('uses a separate optional budget and reuses the optional receipt', () => {
    const base = play();
    const festival = at(startCampaign(), 'festival', 'f-scope');
    festival.cases.festival.seen = ['E4', 'E6'];
    const one = act(festival, { type: 'inquire', person: 'linxia' });
    const two = act(one, { type: 'inquire', person: 'xuyan' });
    expect(act(two, { type: 'inquire', person: 'linxia' })).toBe(two);
    const choose = act(two, { type: 'observe', letter: 'A' });
    expect(choose.cases.festival.extraSpent).toBe(2);
    expect(choose.observations).toHaveLength(1);
    expect(act(choose, { type: 'observe', letter: 'C' })).toBe(choose);
    expect(base.cases.festival.requiredSpent).toBe(4);
  });

  it('allows pending evidence without confirming the underlying claims', () => {
    const run = play({ skip: ['f-chen', 'j-official', 'j-proof', 'v-owner', 'v-proof'], saveLin: false,
      dispositions: { festival: 'pending', job: 'pending', camera: 'pending', voice: 'pending' } });
    for (const id of ['festival', 'job', 'camera', 'voice'] as const) {
      expect(run.cases[id].world.receipts).toEqual([]);
      expect(run.cases[id].world.fixed).toBe(false);
    }
    expect(savedLin(run)).toBe(false);
    expect(run.cases.festival.seen).not.toContain('FChen');
    expect(run.cases.job.seen).not.toContain('JOfficial');
    expect(run.cases.voice.seen).not.toContain('V3');
    expect(run.spread).toEqual(['festival', 'job', 'voice']);
    expect(run.observations).toHaveLength(12);
    expect(endingFor(run)).toBe('ending_domino');
  });

  it('rejects incorrect sorting, unavailable proof and premature repairs', () => {
    let run = at(startCampaign(), 'job', 'j-time');
    expect(act(run, { type: 'solve', attempt: ['later', 'deposit', 'opening', 'paid', 'delivered'] })).toBe(run);
    run = at(run, 'job', 'j-proof');
    expect(act(run, { type: 'solve', attempt: ['JOfficial', 'J4', 'J1'] })).toBe(run);
    run = at(run, 'job', 'j-fix');
    expect(act(run, { type: 'dispose', disposition: 'resolve' })).toBe(run);
    expect(pendingChecks(CAMPAIGN_CASES.job, run.cases.job).length).toBe(5);
    expect(act(run, { type: 'dispose', disposition: 'isolate' }).cases.job.world).toMatchObject({ safe: true, fixed: false });
  });

  it('keeps the simulated assistance separate from the order and finishes only after closing it', () => {
    const order = at(startCampaign(), 'camera', 'c-assist');
    const open = act(order, { type: 'help', open: true });
    expect(act(open, { type: 'proceedOrder' })).toBe(open);
    const locked = act(open, { type: 'lockOrder' });
    expect(locked.cases.camera).toMatchObject({ help: 'closed', lockedOrder: true });
    expect(locked.cases.camera.world).toMatchObject({ safe: false, fixed: false });
    expect(act(locked, { type: 'proceedOrder' }).cases.camera.completed['c-assist']).toBe('done');
  });

  it('accounts for each followup once and never re-votes on style', () => {
    const run = play({ dispositions: { voice: 'pending' } });
    const repaired = act(run, { type: 'follow', caseId: 'voice', action: 'repair' });
    const restored = act(repaired, { type: 'follow', caseId: 'voice', action: 'restore' });
    expect(repaired.cases.voice.world).toMatchObject({ safe: true, fixed: true, normal: false });
    expect(restored.cases.voice.world).toMatchObject({ safe: true, fixed: true, normal: true });
    expect(restored.spread).toEqual(['voice']);
    expect(restored.observations).toBe(run.observations);
    expect(results(restored)).toMatchObject({ safety: 100, fix: 100, order: 100 });
    expect(act(restored, { type: 'follow', caseId: 'festival', action: 'rule' })).toBe(restored);
  });

  it('replays a case from its opening and preserves earlier outcomes and contacts', () => {
    const completed = act(play({ choices: { 'j-method': 'R' } }), { type: 'end' });
    const replayed = act(completed, { type: 'replay', caseId: 'camera' });
    expect(replayed.stage).toBe('case');
    expect(currentStep(replayed).id).toBe('c-open');
    expect(replayed.cases.festival).toBe(completed.cases.festival);
    expect(replayed.cases.job).toBe(completed.cases.job);
    expect(replayed.cases.camera.seen).toEqual([]);
    expect(replayed.observations).toHaveLength(6);
    expect(knowsZhou(replayed)).toBe(true);
    expect(savedLin(replayed)).toBe(true);
  });

  it('makes six endings reachable through actual campaign choices', () => {
    expect(endingFor(play({ dispositions: { voice: 'isolate' } }))).toBe('ending_dawn');
    const consensus = play({ choices: { 'f-method': 'R', 'j-method': 'R', 'v-scope': 'A' },
      dispositions: { job: 'isolate', camera: 'pending' } });
    expect(endingFor(consensus)).toBe('ending_consensus');
    const order = play({ dispositions: { job: 'pause-repaired', camera: 'pending', voice: 'isolate' } });
    expect(endingFor(act(order, { type: 'follow', caseId: 'festival', action: 'rule' }))).toBe('ending_rebuild');
    expect(endingFor(play({ dispositions: { festival: 'pause-repaired', job: 'pause-repaired', camera: 'isolate', voice: 'isolate' } }))).toBe('ending_isolation');
    expect(endingFor(play({ dispositions: { job: 'pending', camera: 'pending', voice: 'pending' } }))).toBe('ending_domino');
    expect(endingFor(play({ dispositions: { camera: 'pending', voice: 'pending' } }))).toBe('ending_unresolved');
  });
});
