import { create } from 'zustand'

interface LayoutData {
  id: number;
  name: string;
  structure: string;
  components: any[];
  theme: string;
}

interface LayoutStore {
  layouts: Record<string, LayoutData>;
  setLayout: (id: string, data: LayoutData) => void;
  getLayout: (id: string) => LayoutData | undefined;
  clearStore: () => void;
}

/**
 * Zustand store to manage layout configurations.
 * Although running in a Next.js API environment, this maintains a consistent 
 * state management pattern with the rest of the application.
 */
export const useLayoutStore = create<LayoutStore>((set, get) => ({
  layouts: {},
  setLayout: (id, data) => set((state) => ({ 
    layouts: { ...state.layouts, [id]: data } 
  })),
  getLayout: (id) => get().layouts[id],
  clearStore: () => set({ layouts: {} })
}))
