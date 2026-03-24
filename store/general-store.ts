import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GeneralState {
  isSidebarOpen: boolean
  isCollapsed: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  setIsCollapsed: (isCollapsed: boolean) => void
}

export const usegeneralStore = create<GeneralState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isCollapsed: false,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: 'general-store',
    }
  )
)
