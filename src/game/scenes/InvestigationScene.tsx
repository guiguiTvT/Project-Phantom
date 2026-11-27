import { MessageCircle, Search } from 'lucide-react';
import { ASSETS } from '../data/assets';
import { CASE_HOTSPOTS, CASE_META, VN_EVIDENCE_BY_ID } from '../data/evidence';
import { sfx } from '../audio/sound';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import type { Hotspot } from '../types';
import { SceneHotspot } from '../ui/SceneHotspot';
import { StageFrame } from '../ui/StageFrame';

const TOTAL = CASE_HOTSPOTS.length;

export function InvestigationScene() {
  const foundHotspotIds = useVnStore((state) => state.foundHotspotIds);
  const collectedEvidenceIds = useVnStore((state) => state.collectedEvidenceIds);
  const collectHotspot = useVnStore((state) => state.collectHotspot);
  const enterNpcHub = useVnStore((state) => state.enterNpcHub);
  const openInspect = useVnUi((state) => state.openInspect);
  const showNotice = useVnUi((state) => state.showNotice);

  const foundCount = CASE_HOTSPOTS.filter((item) => foundHotspotIds.includes(item.id)).length;
  const canTalk = collectedEvidenceIds.length >= 2;

  const openHotspot = (hotspot: Hotspot) => {
    const had = collectedEvidenceIds.includes(hotspot.evidenceId);
    const result = collectHotspot(hotspot.id);
    if (!result.ok) {
      showNotice(result.message);
      return;
    }
    if (had) sfx.click();
    else sfx.collect();
    if (!had) showNotice(result.message);
    openInspect(VN_EVIDENCE_BY_ID[hotspot.evidenceId]);
  };

  const handleTalk = () => {
    const result = enterNpcHub();
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  return (
    <div className="vn-frame px-3 pb-4 pt-3 sm:px-6 sm:pt-5">
      <div className="relative">
        <StageFrame bg={ASSETS.activityRoom} className="aspect-[4/3] w-full sm:aspect-video">
          <div className="absolute inset-x-3 top-3 flex items-center justify-between sm:inset-x-5 sm:top-4">
            <div className="rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] tracking-[0.18em] text-vn-paper/60">现场调查</span>
              <span className="mx-2 text-vn-paper/25">·</span>
              <span className="text-[11px] text-vn-paper/90">文化节活动室</span>
            </div>
            <div className="rounded-full border border-white/15 bg-vn-night/55 px-3 py-1.5 text-[10px] tracking-[0.12em] text-vn-paper/70 backdrop-blur-sm">
              已发现 <span className="font-mono text-vn-amber">{foundCount}</span> / {TOTAL}
            </div>
          </div>

          {CASE_HOTSPOTS.map((hotspot) => (
            <SceneHotspot
              key={hotspot.id}
              hotspot={hotspot}
              found={foundHotspotIds.includes(hotspot.id)}
              onOpen={openHotspot}
            />
          ))}

          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 sm:inset-x-5 sm:bottom-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-vn-night/70 px-3 py-2 backdrop-blur-sm">
              <Search className="h-3.5 w-3.5 shrink-0 text-vn-amber" />
              <p className="text-[10px] leading-4 text-vn-paper/85 sm:text-[11px]">
                {foundCount === 0
                  ? '点开物品，材料自动归档。'
                  : foundCount >= TOTAL
                    ? '现场看完了，可以找人聊聊。'
                    : '还有没检查的地方，集齐两份就能问人。'}
              </p>
            </div>
            {canTalk && (
              <button
                type="button"
                onClick={handleTalk}
                className="flex items-center gap-2 rounded-full bg-vn-amber px-4 py-2 text-[12px] font-medium tracking-[0.06em] text-[#2E2318] shadow-vnAmber transition hover:bg-[#E0B387] active:scale-[0.98]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                找人问问
              </button>
            )}
          </div>
        </StageFrame>
      </div>

      <p className="mt-3 text-center text-[10px] tracking-[0.12em] text-vn-paper/35">
        {CASE_META.caseNo} · {CASE_META.timeLabel} · 调查不消耗行动点
      </p>
    </div>
  );
}
