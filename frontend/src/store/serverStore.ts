import { create } from 'zustand';
import { api } from '@/services/api';

export interface ServerInstance {
  id: string;
  name: string;
  slug: string;
  port: number;
  status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING' | 'CRASHED';
  uptime?: number;
  playerCount?: number;
  maxPlayers?: number;
}

interface ServerStore {
  servers: ServerInstance[];
  loading: boolean;
  fetchServers: () => Promise<void>;
  startServer: (id: string) => Promise<void>;
  stopServer: (id: string) => Promise<void>;
  createServer: (config: any) => Promise<ServerInstance>;
  deleteServer: (id: string) => Promise<void>;
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: [],
  loading: false,

  fetchServers: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/servers');
      set({ servers: response.data.servers, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  startServer: async (id: string) => {
    try {
      await api.post(`/servers/${id}/start`, {});
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === id ? { ...s, status: 'STARTING' as const } : s,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  stopServer: async (id: string) => {
    try {
      await api.post(`/servers/${id}/stop`, {});
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === id ? { ...s, status: 'STOPPING' as const } : s,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  createServer: async (config: any) => {
    try {
      const response = await api.post('/servers', config);
      set((state) => ({ servers: [...state.servers, response.data.server] }));
      return response.data.server;
    } catch (error) {
      throw error;
    }
  },

  deleteServer: async (id: string) => {
    try {
      await api.delete(`/servers/${id}`);
      set((state) => ({ servers: state.servers.filter((s) => s.id !== id) }));
    } catch (error) {
      throw error;
    }
  },
}));
