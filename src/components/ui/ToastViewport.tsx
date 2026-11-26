import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

const toneStyles = {
  info: { border: 'border-primary/40', icon: Info, color: 'text-primary' },
  success: { border: 'border-primary/40', icon: CheckCircle2, color: 'text-primary' },
  warning: { border: 'border-warning/45', icon: AlertTriangle, color: 'text-warning' },
  danger: { border: 'border-danger/45', icon: ShieldAlert, color: 'text-danger' },
};

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const dismiss = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-16 right-4 z-[90] flex w-[min(92vw,340px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = toneStyles[toast.tone];
          const Icon = style.icon;
          return (
            <motion.button
              key={toast.id}
              type="button"
              onClick={() => dismiss(toast.id)}
              className={cn(
                'pointer-events-auto flex items-start gap-3 border bg-surface/95 px-3.5 py-3 text-left shadow-panel',
                style.border,
              )}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={15} className={cn('mt-0.5 shrink-0', style.color)} />
              <span>
                <span className="block text-xs font-medium text-ink">{toast.title}</span>
                {toast.description && (
                  <span className="mt-1 block text-[11px] leading-relaxed text-secondary">
                    {toast.description}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
