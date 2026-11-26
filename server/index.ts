import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createStatusRouter } from './routes/status';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '64kb' }));

app.use('/api', createStatusRouter());

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
