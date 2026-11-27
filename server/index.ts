import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createDialogueRouter } from './routes/dialogue';
import { createStatusRouter } from './routes/status';
import { createChapterAi } from '../functions/shared/chapterAi';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '64kb' }));

app.use('/api', createStatusRouter());
app.use('/api', createDialogueRouter());

const chapterAi = createChapterAi((name) => process.env[name]);
app.post('/api/ai/chapter-dialogue', async (req, res) => {
  res.json(await chapterAi.dialogue(req.body, req.ip ?? 'guest'));
});
app.post('/api/ai/recap', async (req, res) => {
  res.json(await chapterAi.recap(req.body, req.ip ?? 'guest'));
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

app.listen(port, () => {
  const configured = Boolean(
    process.env.LLM_BASE_URL && process.env.LLM_API_KEY && process.env.LLM_MODEL,
  );
  console.log(
    `[phantom-api] listening on http://localhost:${port} · model mode: ${
      configured ? 'live' : 'demo (local fallback)'
    }`,
  );
});
