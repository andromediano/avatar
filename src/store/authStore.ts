import { create } from 'zustand'

export interface User {
  id: string
  email: string
  nickname?: string
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: false,
  user: null,

  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}))
