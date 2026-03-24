import { create } from 'zustand'

export interface AppSettings {
  logo?: string
  name?: string
}

interface AppSettingsState {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  settings: {
    logo: '/solution22-logo.png',
    name: 'Solution22',
  },
  setSettings: (settings) => set({ settings }),
}))
