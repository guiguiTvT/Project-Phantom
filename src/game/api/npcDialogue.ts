import {
  localNpcReply,
  parseDialogueResponse,
  type NpcDialogueId,
  type NpcDialogueReply,
} from '../../../shared/npcDialogue';

export type { NpcDialogueId, NpcDialogueReply };

export async function askNpc(npcId: NpcDialogueId, message: string): Promise<NpcDialogueReply> {
  try {
    const response = await fetch('/api/ai/dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npcId, message }),
      signal: AbortSignal.timeout(9_000),
    });
    if (!response.ok) throw new Error(`dialogue_${response.status}`);
    const parsed = parseDialogueResponse(await response.json());
    if (parsed) return parsed;
  } catch {
    // 服务端不可达或响应不合法时退回本地规则，自由对话不阻断主线
  }
  return localNpcReply(npcId, message);
}
