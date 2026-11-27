import { containsSensitiveData, dialoguePrompt, isOffTopicRequest, readDialogueChoice, readDialogueInput } from './chapterDialogue.ts';
import { campaignReviewContext, readCampaignReview } from './campaignReview.ts';

export const CAUSE_IDS = ['targeted', 'notify', 'formal', 'cooperate', 'paused', 'pending', 'roster'] as const;
export type CauseId = typeof CAUSE_IDS[number];

const CAUSE_MEANING: Record<CauseId, string> = {
  targeted: '调查证据带来了定向处置，官方报名继续', notify: '发布全体提醒或通过人物协作推送定向通知',
  formal: '正式复核阻断三条风险、落实制度，分组需补排', cooperate: '人物协作清理旧表单、处理已确认风险、安排补登记',
  paused: '全面暂停隔离新增访问，同时影响正常报名和名单交付', pending: '待处置风险仍保留，名单暂不交付',
  roster: '已核对官方入口和本届名单，名单可交付分组',
};

const ENDING_IDS = ['ending_dawn', 'ending_rebuild', 'ending_consensus', 'ending_isolation', 'ending_domino', 'ending_unresolved'];

export interface RecapInput {
  causes: CauseId[];
  ending: string;
  pending: number;
  rosterAt: string | null;
}

function readRecapInput(raw: unknown): RecapInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<RecapInput>;
  if (!value.ending || !ENDING_IDS.includes(value.ending) || typeof value.pending !== 'number'
    || ![0, 1, 2, 3].includes(value.pending) || !(value.rosterAt === null || /^(?:10:10|10:30|13:10)$/.test(value.rosterAt ?? ''))
    || !Array.isArray(value.causes) || value.causes.length === 0 || !value.causes.every((id) => CAUSE_IDS.includes(id))
    || new Set(value.causes).size !== value.causes.length) return null;
  return value as RecapInput;
}

export function readRecapOrder<Id extends string>(raw: unknown, causes: readonly Id[]): Id[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const { order } = raw as { order?: Id[] };
  return Array.isArray(order) && order.length === Math.min(3, causes.length) && new Set(order).size === order.length
    && order.every((item) => causes.includes(item)) ? order : null;
}

type ReadSecret = (name: string) => string | undefined;

function config(read: ReadSecret) {
  const baseUrl = read('LLM_BASE_URL')?.trim().replace(/\/+$/, '');
  const apiKey = read('LLM_API_KEY')?.trim();
  const model = read('LLM_MODEL')?.trim();
  return baseUrl && apiKey && model ? { baseUrl, apiKey, model } : null;
}

async function askModel(read: ReadSecret, system: string, message: string): Promise<unknown> {
  const llm = config(read);
  if (!llm) return null;
  try {
    const response = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${llm.apiKey}` },
      body: JSON.stringify({ model: llm.model, temperature: 0.2, max_tokens: 220,
        messages: [{ role: 'system', content: system }, { role: 'user', content: message }] }),
      signal: AbortSignal.timeout(5_500), redirect: 'error',
    });
    if (!response.ok) return null;
    const data = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.length > 2_000) return null;
    return JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  } catch { return null; }
}

export function createChapterAi(read: ReadSecret) {
  let windowStart = 0;
  let requests = 0;
  const visits = new Map<string, number>();

  function hasBudget(client: string): boolean {
    if (!config(read)) return false;
    const now = Date.now();
    if (now - windowStart >= 60_000) {
      windowStart = now;
      requests = 0;
      visits.clear();
    }
    const personal = visits.get(client) ?? 0;
    if (personal >= 20 || requests >= 60) return false;
    visits.set(client, personal + 1);
    requests += 1;
    return true;
  }

  return {
    async dialogue(raw: unknown, client: string) {
      const input = readDialogueInput(raw);
      if (!input || containsSensitiveData(input.message) || isOffTopicRequest(input.message) || !hasBudget(client)) return { source: 'local' as const };
      const choice = readDialogueChoice(await askModel(read, dialoguePrompt(input), input.message), input);
      return choice ? { ...choice, source: 'live' as const } : { source: 'local' as const };
    },
    async recap(raw: unknown, client: string) {
      const campaign = readCampaignReview(raw, ENDING_IDS);
      const input = campaign ?? readRecapInput(raw);
      if (!input || !hasBudget(client)) return { source: 'local' as const };
      const system = `请从本局已发生事件中挑出最能解释结局的 ${Math.min(3, input.causes.length)} 项，按因果重要性排序。只返回 {"order":["事件编号"]}，不可补写事件或虚构经历。`;
      const message = 'scope' in input ? campaignReviewContext(input)
        : JSON.stringify({ ...input, causes: input.causes.map((id) => ({ id, text: CAUSE_MEANING[id] })) });
      const order = readRecapOrder<string>(await askModel(read, system, message), input.causes);
      return order ? { order, source: 'live' as const } : { source: 'local' as const };
    },
  };
}
