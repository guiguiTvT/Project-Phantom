import { useEffect, useState } from 'react';

export type AiMode = 'checking' | 'live' | 'demo' | 'offline';

interface AiStatus {
  mode: AiMode;
  model: string | null;
}

export function useAiStatus(): AiStatus {
  const [status, setStatus] = useState<AiStatus>({ mode: 'checking', model: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch('/api/ai/status', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json() as Promise<{ mode: 'live' | 'demo'; model: string }>;
      })
      .then((data) => {
        if (!cancelled) {
          setStatus({ mode: data.mode, model: data.model ?? null });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ mode: 'offline', model: null });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return status;
}
