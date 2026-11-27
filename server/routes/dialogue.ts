import type { RequestHandler } from 'express';
import { Router } from 'express';
import {
  buildSystemPrompt,
  isNpcDialogueId,
  localNpcReply,
  validateNpcReply,
  type NpcDialogueId,
  type NpcDialogueReply,
} from '../../shared/npcDialogue';
import { readLlmConfig } from './status';

const WINDOW_MS = 60_000;
const LIMIT_PER_WINDOW = 20;
const MAX_MESSAGE_LENGTH = 200;
const MODEL_TIMEOUT_MS = 8_000;

const hits = new Map<string, number[]>();

function allowRequest(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function parseModelContent(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

async function fetchLiveReply(npcId: NpcDialogueId, message: string): Promise<NpcDialogueReply | null> {
  const config = readLlmConfig();
  if (!config.configured) return null;

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.6,
        max_tokens: 300,
        messages: [
          { role: 'system', content: buildSystemPrompt(npcId) },
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return validateNpcReply(parseModelContent(content), 'live');
  } catch {
    // 超时、网络或解析失败一律走本地规则，不向客户端暴露细节
    return null;
  }
}

const dialogueHandler: RequestHandler = async (req, res) => {
  if (!allowRequest(req.ip ?? 'unknown')) {
    res.status(429).json({ ok: false, error: 'rate_limited' });
    return;
  }

  const body = req.body as { npcId?: unknown; message?: unknown } | undefined;
  const npcId = body?.npcId;
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!isNpcDialogueId(npcId) || message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ ok: false, error: 'bad_request' });
    return;
  }

  const live = await fetchLiveReply(npcId, message);
  const reply = live ?? localNpcReply(npcId, message);
  res.json({ ok: true, ...reply });
};

export function createDialogueRouter(): Router {
  const router = Router();
  router.post('/ai/dialogue', dialogueHandler);
  return router;
}
