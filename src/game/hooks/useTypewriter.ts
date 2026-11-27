import { useCallback, useEffect, useState } from 'react';
import { useVnSettings } from '../store/settingsStore';

export function useTypewriter(text: string, speed = 26) {
  const reduceMotion = useVnSettings((state) => state.reduceMotion);
  const [count, setCount] = useState(() => (reduceMotion ? text.length : 0));

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed, reduceMotion]);

  const finish = useCallback(() => setCount(text.length), [text.length]);
  const done = count >= text.length;

  return { visible: text.slice(0, count), done, finish };
}
