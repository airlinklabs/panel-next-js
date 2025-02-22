import { create } from "zustand"

interface User {
  id: string
  name: string | null
  email: string | null
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
})) 