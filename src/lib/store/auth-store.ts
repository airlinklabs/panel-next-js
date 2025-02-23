import { create } from "zustand"

interface User {
  id: string
  name: string | null
  email: string | null
  username: string | null
  description: string | null
}

// Helper function to ensure user data has all required fields
const normalizeUserData = (user: Partial<User> | null): User | null => {
  if (!user) return null
  
  return {
    id: user.id || '',
    name: user.name || user.username || user.email?.split('@')[0] || 'User',
    email: user.email || null,
    username: user.username || user.name || user.email?.split('@')[0] || 'user',
    description: user.description || 'AirLink User'
  }
}

interface AuthState {
  user: User | null
  setUser: (user: Partial<User> | null) => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user: normalizeUserData(user) })
})) 