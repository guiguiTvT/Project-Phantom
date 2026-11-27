import { useCallback, useEffect, useRef, useState } from 'react';

export function useNotice(duration = 2400) {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback(
    (message: string) => {
      setNotice(message);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNotice(null), duration);
    },
    [duration],
  );

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return { notice, show };
}
