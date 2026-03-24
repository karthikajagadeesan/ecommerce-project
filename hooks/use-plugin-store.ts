import { create } from 'zustand';

interface PluginState {
  currentPopupIndex: number | null;
  setPopup: (index: number | null) => void;
  nextPopup: (total: number) => void;
  prevPopup: (total: number) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  currentPopupIndex: null,
  setPopup: (index) => set({ currentPopupIndex: index }),
  nextPopup: (total) =>
    set((state) => ({
      currentPopupIndex:
        state.currentPopupIndex === null
          ? 0
          : (state.currentPopupIndex + 1) % total,
    })),
  prevPopup: (total) =>
    set((state) => ({
      currentPopupIndex:
        state.currentPopupIndex === null
          ? total - 1
          : (state.currentPopupIndex - 1 + total) % total,
    })),
}));
