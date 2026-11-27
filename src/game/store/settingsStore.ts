import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VnSettings {
  muted: boolean;
  reduceMotion: boolean;
  setMuted: (muted: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
}

export const useVnSettings = create<VnSettings>()(
  persist(
    (set) => ({
      muted: true,
      reduceMotion: false,
      setMuted: (muted) => set({ muted }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    {
      name: 'phantom.vn.settings.v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
