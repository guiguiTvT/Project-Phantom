import { create } from 'zustand';
import type { OSView } from '@/types';

export type ModalId = 'briefing' | 'dossier' | 'log' | 'return-title' | 'contacts' | null;

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

interface UiStore {
  activeView: OSView;
  modal: ModalId;
  dossierNpcId: string | null;
  pendingPostId: string | null;
  toasts: ToastItem[];
  setView: (view: OSView) => void;
  focusPost: (postId: string) => void;
  clearPendingPost: () => void;
  openDossier: (npcId: string) => void;
  closeDossier: () => void;
  openModal: (modal: Exclude<ModalId, null>) => void;
  closeModal: () => void;
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: number) => void;
  resetUi: () => void;
}

let toastSeq = 0;

export const useUiStore = create<UiStore>((set) => ({
  activeView: 'feed',
  modal: null,
  dossierNpcId: null,
  pendingPostId: null,
  toasts: [],

  setView: (view) => set({ activeView: view }),

  focusPost: (postId) => set({ activeView: 'feed', pendingPostId: postId }),

  clearPendingPost: () => set({ pendingPostId: null }),

  openDossier: (npcId) => set({ modal: 'dossier', dossierNpcId: npcId }),

  closeDossier: () => set({ modal: null, dossierNpcId: null }),

  openModal: (modal) => set({ modal }),

  closeModal: () => set({ modal: null, dossierNpcId: null }),

  pushToast: (toast) => {
    toastSeq += 1;
    const id = toastSeq;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3200);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),

  resetUi: () =>
    set({ activeView: 'feed', modal: null, dossierNpcId: null, pendingPostId: null, toasts: [] }),
}));
