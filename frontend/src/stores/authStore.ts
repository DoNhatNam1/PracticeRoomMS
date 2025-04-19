import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      
      login: (token, user) => set({
        token,
        user,
        isLoggedIn: true,
      }),
      
      logout: () => set({
        token: null,
        user: null,
        isLoggedIn: false,
      }),
      
      setToken: (token) => set({ token }),
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // storage key name
    }
  )
);