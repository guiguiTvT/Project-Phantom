import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ModalShell({
  eyebrow,
  title,
  onClose,
  children,
  footer,
  width = 'max-w-3xl',
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

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        aria-label="关闭弹层"
        className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'corner-frame relative flex max-h-[86vh] w-full flex-col border border-line bg-surface shadow-panel',
          width,
        )}
        initial={{ opacity: 0, y: 14, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.995 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between border-b border-line/80 px-5 py-4">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-1.5 text-base font-medium tracking-wide text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="border border-transparent p-1 text-muted transition-colors hover:border-line hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line/80 bg-surface-2/60 px-5 py-3">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
