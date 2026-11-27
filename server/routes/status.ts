import type { RequestHandler } from 'express';
import { Router } from 'express';

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  configured: boolean;
}

export function readLlmConfig(): LlmConfig {
  const baseUrl = process.env.LLM_BASE_URL?.trim() ?? '';
  const apiKey = process.env.LLM_API_KEY?.trim() ?? '';
  const model = process.env.LLM_MODEL?.trim() ?? '';
  return {
    baseUrl,
    apiKey,
    model,
    configured: Boolean(baseUrl && apiKey && model),
  };
}

const startedAt = Date.now();

export const statusHandler: RequestHandler = (_req, res) => {
  const config = readLlmConfig();
  res.json({
    ok: true,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    mode: config.configured ? 'live' : 'demo',
    // 只暴露模式与模型名，绝不返回 baseUrl / apiKey
    model: config.configured ? config.model : 'local-rules',
  });
};

export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true, service: 'phantom-api', version: '0.5.0-vn-phase4' });
};

export function createStatusRouter(): Router {
  const router = Router();
  router.get('/health', healthHandler);
  router.get('/ai/status', statusHandler);
  return router;
}
