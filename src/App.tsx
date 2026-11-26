import { AnimatePresence, motion } from 'framer-motion';
import AuthorizationPage from '@/pages/AuthorizationPage';
import BriefingPage from '@/pages/BriefingPage';
import OSPage from '@/pages/OSPage';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { useGameStore } from '@/stores/gameStore';

const pageMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.28, ease: 'easeOut' as const },
};

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const resolved = screen === 'briefing' || screen === 'os' ? screen : 'authorization';

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {resolved === 'authorization' && (
          <motion.div key="authorization" className="h-full" {...pageMotion}>
            <AuthorizationPage />
          </motion.div>
        )}
        {resolved === 'briefing' && (
          <motion.div key="briefing" className="h-full" {...pageMotion}>
            <BriefingPage />
          </motion.div>
        )}
        {resolved === 'os' && (
          <motion.div key="os" className="h-full" {...pageMotion}>
            <OSPage />
          </motion.div>
        )}
      </AnimatePresence>
      <ToastViewport />
    </div>
  );
}
