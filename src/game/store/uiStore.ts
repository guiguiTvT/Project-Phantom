import { create } from 'zustand';
import type { VnEvidence, VnEvidenceId } from '../types';

interface PresentedRequest {
  targetName: string;
  onPresent: (id: VnEvidenceId) => void;
}

interface VnUiState {
  bagOpen: boolean;
  bagMode: 'browse' | 'present';
  targetName: string | null;
  presentRequest: PresentedRequest | null;
  inspecting: VnEvidence | null;
  notice: string | null;
  openBag: () => void;
  startPresent: (request: PresentedRequest) => void;
  closeBag: () => void;
  openInspect: (evidence: VnEvidence) => void;
  closeInspect: () => void;
  showNotice: (message: string) => void;
  clearNotice: () => void;
}

let noticeTimer: number | null = null;

export const useVnUi = create<VnUiState>()((set) => ({
  bagOpen: false,
  bagMode: 'browse',
  targetName: null,
  presentRequest: null,
  inspecting: null,
  notice: null,

  openBag: () => set({ bagOpen: true, bagMode: 'browse', targetName: null, presentRequest: null }),
  startPresent: (request) =>
    set({ bagOpen: true, bagMode: 'present', targetName: request.targetName, presentRequest: request }),
  closeBag: () => set({ bagOpen: false, presentRequest: null, targetName: null }),
  openInspect: (evidence) => set({ inspecting: evidence }),
  closeInspect: () => set({ inspecting: null }),
  showNotice: (message) => {
    set({ notice: message });
    if (noticeTimer) window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => set({ notice: null }), 2600);
  },
  clearNotice: () => {
    if (noticeTimer) window.clearTimeout(noticeTimer);
    set({ notice: null });
  },
}));
