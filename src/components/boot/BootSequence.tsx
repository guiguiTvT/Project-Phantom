import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhantomMark } from './PhantomMark';

const BOOT_LINES = [
  { code: 'SYS', text: 'PHANTOM OS 0.9.4 · cold boot sequence' },
  { code: 'SEC', text: 'verify signed sandbox image ................ OK' },
  { code: 'NET', text: 'isolated campus mirror / no external route .. OK' },
  { code: 'FS', text: 'mount /intel (read-write, session-scoped) .... OK' },
  { code: 'AI', text: 'narrative agents: local fallback armed' },
  { code: 'OPR', text: 'operator clearance: awaiting identity forge' },
  { code: 'SYS', text: 'boot complete. handing over to access portal.' },
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= BOOT_LINES.length) {
      const timer = window.setTimeout(onComplete, 520);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setIndex((value) => value + 1), index === 0 ? 420 : 230);
    return () => window.clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/97 px-5"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="w-full max-w-[620px]">
        <div className="mb-5 flex items-center gap-3 text-primary">
          <PhantomMark size={34} animated />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-secondary">
              isolated sandbox / boot
            </p>
            <p className="font-mono text-[13px] tracking-[0.2em] text-primary">PROJECT PHANTOM</p>
          </div>
        </div>

        <div className="border border-line/80 bg-surface-2/80 p-4 font-mono text-[11px] leading-[1.9] shadow-panel">
          {BOOT_LINES.slice(0, index).map((line) => (
            <div key={`${line.code}-${line.text}`} className="flex gap-3">
              <span className="w-8 shrink-0 text-muted">{line.code}</span>
              <span className={line.text.includes('OK') ? 'text-secondary' : 'text-ink/90'}>
                {line.text}
              </span>
            </div>
          ))}
          {index < BOOT_LINES.length && (
            <div className="flex items-center gap-3 text-primary">
              <span className="w-8 shrink-0 text-muted">RUN</span>
              <span>initializing<span className="caret" /></span>
            </div>
          )}
          {index >= BOOT_LINES.length && (
            <div className="flex items-center gap-3 text-primary">
              <span className="w-8 shrink-0 text-muted">END</span>
              <span>session ready<span className="caret" /></span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="h-px flex-1 bg-line/60">
            <motion.div
              className="h-px bg-primary/70"
              initial={{ width: '2%' }}
              animate={{ width: `${Math.min(100, (index / BOOT_LINES.length) * 100)}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
          >
            skip ›
          </button>
        </div>
      </div>
    </motion.div>
  );
}
