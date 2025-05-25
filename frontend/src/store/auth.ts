import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      setUser: user => set({ user }),
      setAuthenticated: isAuthenticated => set({ isAuthenticated }),
      setAccessToken: token => set({ accessToken: token }),
      logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
