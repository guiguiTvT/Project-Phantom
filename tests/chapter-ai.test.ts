import { afterEach, describe, expect, it, vi } from 'vitest';
import { localDialogue, readDialogueChoice, readDialogueInput, type DialogueInput } from '../functions/shared/chapterDialogue';
import { createFunctionHandler } from '../functions/shared/functionHandler';

const input: DialogueInput = { npc: 'chen', message: '你能核实账号吗？', verified: false, recent: [], seen: ['E4'] };
const local = createFunctionHandler(() => undefined);
const secrets: Record<string, string> = { LLM_BASE_URL: 'https://model.example/v1', LLM_API_KEY: 'test-fixture', LLM_MODEL: 'test-model' };
const logical = 'https://game.example/functions/v1/app';

function jsonRequest(path: string, body: unknown) {
  return new Request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function modelResponse(content: unknown) {
  return Response.json({ choices: [{ message: { content: JSON.stringify(content) } }] });
}

afterEach(() => vi.unstubAllGlobals());

describe('chapter dialogue and recap', () => {
  it('uses role-scoped facts in fallback and remembers a free follow-up', () => {
    const first = localDialogue(input);
    expect(first.factIds).toEqual(['directory']);
    expect(first.action).toBe('verify');
    expect(localDialogue({ ...input, message: '那然后呢？', recent: first.factIds }).factIds).toEqual(first.factIds);
    expect(readDialogueChoice({ factIds: ['identity-checked'], action: null, tone: 'calm' }, input)).toBeNull();
  });

  it('routes same-origin logical and physical function requests and gracefully falls back', async () => {
    const physical = `app-d${'a'.repeat(32)}`;
    for (const prefix of [logical, `https://game.example/${physical}`, `https://game.example/functions/v1/${physical}`]) {
      expect(await (await local(new Request(`${prefix}/api/health`))).json()).toEqual({ ok: true });
      expect(await (await local(jsonRequest(`${prefix}/api/ai/chapter-dialogue`, input))).json()).toEqual({ source: 'local' });
    }
    expect((await local(jsonRequest(`${logical}/other/api/ai/chapter-dialogue`, input))).status).toBe(404);
    expect((await local(jsonRequest(`${logical}/api/ai/chapter-dialogue`, '测'.repeat(1500)))).status).toBe(413);
  });

  it('calls the configured model for an eligible turn and filters unrecognized output', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(modelResponse({ factIds: ['display', 'directory'], action: 'verify', tone: 'calm' }))
      .mockResolvedValueOnce(modelResponse({ factIds: ['identity-checked'], action: 'verify', tone: 'calm' }));
    vi.stubGlobal('fetch', fetchMock);
    const handler = createFunctionHandler((name) => secrets[name]);
    const endpoint = `${logical}/api/ai/chapter-dialogue`;
    expect(await (await handler(jsonRequest(endpoint, input))).json()).toMatchObject({ source: 'live', factIds: ['display', 'directory'] });
    expect(await (await handler(jsonRequest(endpoint, input))).json()).toEqual({ source: 'local' });
    expect(await (await handler(jsonRequest(endpoint, { ...input, message: '学号是 20260001' }))).json()).toEqual({ source: 'local' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('only returns recap causes that were provided from the current log', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(modelResponse({ order: ['roster', 'cooperate'] }))
      .mockResolvedValueOnce(modelResponse({ order: ['roster', 'formal'] }));
    vi.stubGlobal('fetch', fetchMock);
    const handler = createFunctionHandler((name) => secrets[name]);
    const endpoint = `${logical}/api/ai/recap`;
    const data = { causes: ['cooperate', 'roster'], ending: 'ending_consensus', pending: 0, rosterAt: '10:30' };
    expect(await (await handler(jsonRequest(endpoint, data))).json()).toEqual({ source: 'live', order: ['roster', 'cooperate'] });
    expect(await (await handler(jsonRequest(endpoint, data))).json()).toEqual({ source: 'local' });
  });

  it('keeps v6 replies scoped to the current case and the player’s confirmed record', () => {
    const voice = readDialogueInput({ ...input, scope: 'voice', npc: 'linxia', message: '你发了这次借款请求吗？', seen: ['JOfficial', 'V1'] });
    expect(voice?.seen).toEqual(['V1']);
    expect(voice && localDialogue(voice).factIds).toEqual([]);
    expect(voice && readDialogueChoice({ factIds: ['v-denial'], action: null, tone: 'calm' }, voice)).toBeNull();
    expect(voice && localDialogue({ ...voice, seen: ['V3'] }).factIds).toEqual(['v-denial']);
    const helper = readDialogueInput({ ...input, scope: 'camera', npc: 'zhouning', message: '刚才还能怎样帮我？', seen: [], memory: ['job-team', 'fake'] });
    expect(helper?.memory).toEqual(['job-team']);
    expect(helper && localDialogue(helper).factIds).toEqual(['c-team']);
  });

  it('ranks only existing v6 records without using arbitrary model prose', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(modelResponse({ order: ['job-spread', 'festival-fixed'] }))
      .mockResolvedValueOnce(modelResponse({ order: ['voice-normal', 'job-spread'] }));
    vi.stubGlobal('fetch', fetchMock);
    const handler = createFunctionHandler((name) => secrets[name]);
    const endpoint = `${logical}/api/ai/recap`;
    const data = { scope: 'campaign', ending: 'ending_domino', causes: ['festival-fixed', 'job-spread'] };
    expect(await (await handler(jsonRequest(endpoint, data))).json()).toEqual({ source: 'live', order: ['job-spread', 'festival-fixed'] });
    expect(await (await handler(jsonRequest(endpoint, data))).json()).toEqual({ source: 'local' });
    expect(await (await handler(jsonRequest(endpoint, { ...data, causes: ['generated-fact'] }))).json()).toEqual({ source: 'local' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
