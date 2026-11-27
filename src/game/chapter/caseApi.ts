import { composeReply, localDialogue, readDialogueChoice, type DialogueInput, type DialogueReply } from '../../../functions/shared/chapterDialogue';
import { readRecapOrder, type CauseId, type RecapInput } from '../../../functions/shared/chapterAi';
import type { CampaignReviewInput, ReviewId } from '../../../functions/shared/campaignReview';

const LIVE_AI = import.meta.env.DEV || import.meta.env.VITE_CASE_LIVE_AI === 'true';

async function request(segment: string, body: unknown, signal: AbortSignal): Promise<Record<string, unknown> | null> {
  if (!LIVE_AI) return null;
  try {
    const response = await fetch(`/functions/v1/app/api/ai/${segment}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      signal: AbortSignal.any([signal, AbortSignal.timeout(6_000)]),
    });
    if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) return null;
    const data: unknown = await response.json();
    return data && typeof data === 'object' ? data as Record<string, unknown> : null;
  } catch { return null; }
}

export async function askContact(input: DialogueInput, signal: AbortSignal): Promise<DialogueReply> {
  const raw = await request('chapter-dialogue', input, signal);
  const live = raw?.source === 'live' && readDialogueChoice(raw, input);
  return live ? composeReply(live, input, 'live') : localDialogue(input);
}

export async function askRecap(input: RecapInput, signal: AbortSignal): Promise<CauseId[] | null> {
  const raw = await request('recap', input, signal);
  return raw?.source === 'live' ? readRecapOrder(raw, input.causes) : null;
}

export async function askCampaignReview(input: CampaignReviewInput, signal: AbortSignal): Promise<ReviewId[] | null> {
  const raw = await request('recap', input, signal);
  return raw?.source === 'live' ? readRecapOrder(raw, input.causes) : null;
}
