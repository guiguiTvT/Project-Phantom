import { useEffect } from 'react';
import { CompleteScene } from './scenes/CompleteScene';
import { DefenseScene } from './scenes/DefenseScene';
import { DialogueScene } from './scenes/DialogueScene';
import { GameCover } from './scenes/GameCover';
import { InvestigationScene } from './scenes/InvestigationScene';
import { PrologueScene } from './scenes/PrologueScene';
import { ReversalScene } from './scenes/ReversalScene';
import { SimulationScene } from './scenes/SimulationScene';
import { TestimonyScene } from './scenes/TestimonyScene';
import { useVnSettings } from './store/settingsStore';
import { useVnStore } from './store/vnStore';
import { useVnUi } from './store/uiStore';
import { EvidenceInventory } from './ui/EvidenceInventory';
import { EvidenceModal } from './ui/EvidenceModal';
import { TopBar } from './ui/TopBar';

export default function VnApp() {
  const scene = useVnStore((state) => state.scene);
  const redteamAccess = useVnStore((state) => state.redteamAccess);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);

  const bagOpen = useVnUi((state) => state.bagOpen);
  const bagMode = useVnUi((state) => state.bagMode);
  const targetName = useVnUi((state) => state.targetName);
  const presentRequest = useVnUi((state) => state.presentRequest);
  const inspecting = useVnUi((state) => state.inspecting);
  const notice = useVnUi((state) => state.notice);
  const openBag = useVnUi((state) => state.openBag);
  const closeBag = useVnUi((state) => state.closeBag);
  const openInspect = useVnUi((state) => state.openInspect);
  const closeInspect = useVnUi((state) => state.closeInspect);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [scene]);

  return (
    <div
      data-reduce-motion={reduceMotion}
      className="min-h-[100svh] bg-vn-night text-vn-paper selection:bg-vn-amber/30"
    >
      {scene === 'cover' ? (
        <GameCover />
      ) : (
        <>
          <TopBar onOpenBag={openBag} />
          <main key={scene} className="animate-vn-scene pb-4">
            {scene === 'prologue' && <PrologueScene />}
            {scene === 'investigation' && <InvestigationScene />}
            {scene === 'npc' && <DialogueScene />}
            {scene === 'testimony' && <TestimonyScene />}
            {scene === 'simulation' && <SimulationScene />}
            {scene === 'reversal' && <ReversalScene />}
            {scene === 'defense' && <DefenseScene />}
            {scene === 'complete' && <CompleteScene />}
          </main>
        </>
      )}

      <EvidenceInventory
        open={bagOpen}
        mode={bagMode}
        archived={!redteamAccess}
        targetName={targetName ?? undefined}
        onClose={closeBag}
        onInspect={(evidence) => {
          closeBag();
          openInspect(evidence);
        }}
        onPresent={(id) => {
          const handler = presentRequest?.onPresent;
          closeBag();
          handler?.(id);
        }}
      />

      {inspecting && (
        <EvidenceModal
          evidence={inspecting}
          archived={!redteamAccess}
          onClose={closeInspect}
        />
      )}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-vn-rise rounded-full border border-white/20 bg-vn-night/90 px-4 py-2 text-[11px] text-vn-paper shadow-lg backdrop-blur"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
