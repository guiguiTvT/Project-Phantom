import { createChapterAi } from './chapterAi.ts';

const MAX_BODY_BYTES = 4_096;

export function createFunctionHandler(readSecret: (name: string) => string | undefined) {
  const ai = createChapterAi(readSecret);
  return async function handle(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname.replace(/^\/(?:functions\/v1\/)?app(?:-d[0-9a-f]{32})?(?=\/|$)/, '');
    if (request.method === 'GET' && path === '/api/health') return Response.json({ ok: true });
    const route = path === '/api/ai/chapter-dialogue' ? 'dialogue' : path === '/api/ai/recap' ? 'recap' : null;
    if (request.method !== 'POST' || !route) return Response.json({ error: 'not_found' }, { status: 404 });
    if (!request.headers.get('Content-Type')?.startsWith('application/json') || !request.body) {
      return Response.json({ error: 'invalid_input' }, { status: 400 });
    }
    try {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let size = 0;
      let body = '';
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          return Response.json({ error: 'invalid_input' }, { status: 413 });
        }
        body += decoder.decode(part.value, { stream: true });
      }
      body += decoder.decode();
      const client = (request.headers.get('x-forwarded-for') ?? 'guest').split(',').at(-1)?.trim().slice(0, 64) || 'guest';
      return Response.json(await ai[route](JSON.parse(body), client));
    } catch {
      return Response.json({ error: 'invalid_input' }, { status: 400 });
    }
  };
}
