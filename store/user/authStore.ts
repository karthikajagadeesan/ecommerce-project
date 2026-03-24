import { create } from 'zustand'

interface AuthUser {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  full_name?: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
