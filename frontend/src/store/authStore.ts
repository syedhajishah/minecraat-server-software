import { create } from 'zustand';
import { api } from '@/services/api';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ isAuthenticated: true, user: response.data.user, loading: false });
    } catch (error) {
      set({ isAuthenticated: false, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        set({ isAuthenticated: true, user: response.data.user, loading: false });
      } else {
        set({ isAuthenticated: false, loading: false });
      }
    } catch {
      set({ isAuthenticated: false, loading: false });
    }
  },
}));
