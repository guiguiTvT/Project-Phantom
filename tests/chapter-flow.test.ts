import { describe, expect, it } from 'vitest';
import { CONTACT_IDS, DECISIONS, RISKS, RISK_IDS, ROUND_IDS, type EndingId, type OptionId, type RiskId } from '../src/game/chapter/caseFile';
import { confirmedRisks, createCase, determineEnding, optionBlock, reduceCase, reviewEvidence, type CaseState } from '../src/game/chapter/caseEngine';
import { actionStyle, buildCauses } from '../src/game/chapter/caseResults';
import { parseCase } from '../src/game/chapter/caseStore';

const openCase = () => reduceCase(createCase('test', 'full'), { type: 'enter' });

function confirmRisks(risks: RiskId[]) {
  let state = openCase();
  for (const risk of risks) {
    if (risk === 'H1') state = reduceCase(state, { type: 'verify', contact: 'chen' });
    for (const [index, evidence] of RISKS[risk].required.entries()) {
      state = reduceCase(state, { type: 'save', evidence });
      state = reduceCase(state, { type: 'slot', risk, index, evidence });
    }
    state = reduceCase(state, { type: 'simulate', risk });
  }
  return state;
}

function enterDefense(initial: CaseState) {
  let state = reduceCase(initial, { type: 'handoff', focus: 'open' });
  state = reduceCase(state, { type: 'switch' });
  for (const action of ['contacts', 'location', 'record'] as const) state = reduceCase(state, { type: 'protect', action });
  return reduceCase(state, { type: 'beginDefense' });
}

function finish(initial: CaseState, route: OptionId[]) {
  let state = enterDefense(initial);
  for (const round of ROUND_IDS) {
    const command = { type: 'decide', round, option: route[round - 1] } as const;
    state = reduceCase(state, command);
    expect(reduceCase(state, command)).toBe(state);
    if (state.formalPending) state = reduceCase(state, { type: 'receiveFormal' });
    expect(state.receipts).toHaveLength(round);
    state = reduceCase(state, { type: 'advance', round });
  }
  return state;
}

describe('信任裂缝 chapter rules', () => {
  it('reserves one simulation, makes evidence free and applies each verification once', () => {
    let state = openCase();
    state = reduceCase(state, { type: 'save', evidence: 'E1' });
    expect(reduceCase(state, { type: 'save', evidence: 'E1' })).toBe(state);
    for (const contact of CONTACT_IDS) state = reduceCase(state, { type: 'verify', contact });
    expect(state.points).toBe(2);
    expect(state.verified).toHaveLength(4);
    expect(reduceCase(state, { type: 'verify', contact: 'linxia' })).toBe(state);
    state = reduceCase(state, { type: 'simulate', risk: 'H3' });
    expect(state.points).toBe(0);
    expect(reduceCase(state, { type: 'simulate', risk: 'H3' })).toBe(state);
    expect(reduceCase(state, { type: 'verify', contact: 'gu' })).toBe(state);
    expect(reduceCase(state, { type: 'handoff', focus: 'open' }).phase).toBe('reversal');
  });

  it('requires independent verification for H1 and allows free review without a second simulation', () => {
    let state = openCase();
    for (const [index, evidence] of (['E2', 'E4'] as const).entries()) {
      state = reduceCase(state, { type: 'save', evidence });
      state = reduceCase(state, { type: 'slot', risk: 'H1', index, evidence });
    }
    state = reduceCase(state, { type: 'simulate', risk: 'H1' });
    expect(state.simulations.H1?.status).toBe('insufficient');
    expect(state.simulations.H1?.missing[0]).toContain('通讯录');
    state = reduceCase(state, { type: 'verify', contact: 'chen' });
    state = reduceCase(state, { type: 'recheck', risk: 'H1' });
    expect(state.simulations.H1?.status).toBe('confirmed');
    expect(state.points).toBe(3);
    expect(state.world.pending).toEqual(RISK_IDS);
    expect(state.events.filter((event) => event.risk === 'H1').map((event) => event.spent)).toEqual([2, 0]);
  });

  it('rejects an unsaved card and treats E8 as an unverified association', () => {
    let state = openCase();
    expect(reduceCase(state, { type: 'slot', risk: 'H2', index: 0, evidence: 'E8' })).toBe(state);
    state = reduceCase(state, { type: 'save', evidence: 'E8' });
    state = reduceCase(state, { type: 'slot', risk: 'H2', index: 0, evidence: 'E8' });
    expect(reviewEvidence(state, 'H2')).toMatchObject({ status: 'incorrect', misused: ['E8'] });
    state = reduceCase(state, { type: 'slot', risk: 'H2', index: 0, evidence: null });
    expect(reviewEvidence(state, 'H2').evidence).toEqual([]);
  });

  it('locks investigation after handoff and requires all three account actions', () => {
    const handoff = reduceCase(openCase(), { type: 'handoff', focus: 'open' });
    expect(reduceCase(handoff, { type: 'simulate', risk: 'H3' })).toBe(handoff);
    const state = reduceCase(handoff, { type: 'switch' });
    expect(state.time).toBe('09:10');
    expect(reduceCase(state, { type: 'verify', contact: 'gu' })).toBe(state);
    expect(reduceCase(state, { type: 'beginDefense' })).toBe(state);
    expect(reduceCase(state, { type: 'decide', round: 1, option: 'A' })).toBe(state);
    expect(optionBlock(enterDefense(openCase()), 1, 'B')).toContain('已确认');
  });

  it('applies formal repair only when the receipt arrives and retains a pause until round 4', () => {
    let state = enterDefense(openCase());
    state = reduceCase(state, { type: 'decide', round: 1, option: 'A' });
    expect(state.world).toMatchObject({ paused: true, pending: [...RISK_IDS] });
    state = reduceCase(state, { type: 'advance', round: 1 });
    state = reduceCase(state, { type: 'decide', round: 2, option: 'A' });
    expect(state.world).toMatchObject({ coverage: 'all', pending: [...RISK_IDS] });
    state = reduceCase(state, { type: 'advance', round: 2 });
    state = reduceCase(state, { type: 'decide', round: 3, option: 'A' });
    expect(state.formalPending).toBe(true);
    expect(state.time).toBe('09:40');
    expect(state.world).toMatchObject({ policy: false, pending: [...RISK_IDS] });
    state = reduceCase(state, { type: 'receiveFormal' });
    expect(state.time).toBe('13:00');
    expect(state.world).toMatchObject({ paused: true, policy: true, pending: [] });
    expect(reduceCase(state, { type: 'receiveFormal' })).toBe(state);
    state = reduceCase(state, { type: 'advance', round: 3 });
    state = reduceCase(state, { type: 'decide', round: 4, option: 'A' });
    expect(state.world).toMatchObject({ paused: false, rosterAt: '13:10' });
  });

  it('assigns every legal v4 route exactly one deterministic ending', () => {
    const sets: RiskId[][] = [[], ['H1'], ['H2'], ['H3'], ['H1', 'H2'], ['H1', 'H3'], ['H2', 'H3']];
    const reached = new Set<EndingId>();
    let tested = 0;
    for (const risks of sets) {
      const initial = confirmRisks(risks);
      expect(confirmedRisks(initial)).toEqual(risks);
      const available = (round: 1 | 2 | 3 | 4) => DECISIONS[round].options.map((option) => option.id);
      for (const channel of available(1).filter((id) => !optionBlock(initial, 1, id))) {
        for (const notice of available(2)) for (const fix of available(3)) for (const recovery of available(4)) {
          const state = finish(initial, [channel, notice, fix, recovery]);
          expect(state.phase).toBe('ending');
          const ending = determineEnding(state.world);
          reached.add(ending);
          expect(buildCauses(state).every((cause) => cause.events.every((event) => state.events.includes(event)))).toBe(true);
          if (state.world.rosterAt) expect(state.world).toMatchObject({ paused: false, pending: [] });
          tested += 1;
        }
      }
    }
    expect(tested).toBe(360);
    expect(reached).toEqual(new Set(['ending_dawn', 'ending_rebuild', 'ending_consensus', 'ending_isolation', 'ending_domino', 'ending_unresolved']));
  });

  it('implements the plan example, a single-risk route, and a preloaded fast mode without scoring fixtures', () => {
    const researched = reduceCase(confirmRisks(['H1', 'H2']), { type: 'verify', contact: 'gu' });
    const consensus = finish(researched, ['B', 'B', 'B', 'A']);
    expect(determineEnding(consensus.world)).toBe('ending_consensus');
    expect(consensus.world).toMatchObject({ rosterAt: '10:30', coverage: 'records' });
    expect(actionStyle(consensus).code).toBe('EAFR');
    const incomplete = finish(confirmRisks(['H1']), ['B', 'B', 'B', 'A']);
    expect(incomplete.world).toMatchObject({ pending: ['H2'], rosterAt: null });
    expect(determineEnding(incomplete.world)).toBe('ending_unresolved');
    const quick = reduceCase(createCase('quick', 'quick'), { type: 'enter' });
    expect(quick.points).toBe(3);
    expect(confirmedRisks(quick)).toEqual(['H2']);
    expect(actionStyle(quick).dimensions[0].label).toBe('依据不足');
    expect(parseCase(JSON.stringify(quick))).toEqual(quick);
    expect(parseCase(JSON.stringify({ ...quick, version: 3 }))).toBeNull();
  });
});
