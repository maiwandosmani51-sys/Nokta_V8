import create from 'zustand';
import type { Role } from '../config/modules';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: UserProfile | null;
  authLoading: boolean;
  setUser: (value: UserProfile | null) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authLoading: true,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  setLoading: (authLoading) => set({ authLoading }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, authLoading: false });
  }
}));
