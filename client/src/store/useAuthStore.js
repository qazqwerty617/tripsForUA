import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData) => set({ 
        user: userData, 
        token: userData.token,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null,
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set({ user: userData })
    }),
    {
      name: 'auth-storage'
    }
  )
)

export default useAuthStore
