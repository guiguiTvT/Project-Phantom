import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function CaseDialog({
  eyebrow,
  title,
  onClose,
  children,
  footer,
  width = 'max-w-2xl',
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[96] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        aria-label="关闭弹层"
        className="absolute inset-0 cursor-default bg-background/78 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'case-card relative flex max-h-[88vh] w-full flex-col overflow-hidden',
          width,
        )}
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary/80">
              {eyebrow}
            </p>
            <h2 className="mt-1.5 text-[17px] font-medium leading-snug tracking-wide text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-full border border-transparent p-1.5 text-muted transition-colors hover:border-white/10 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] bg-background/35 px-5 py-3.5">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
