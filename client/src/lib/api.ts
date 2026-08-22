import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  register: async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  googleLogin: async (profile) => {
    const res = await api.post('/auth/google', profile);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const threadsApi = {
  getThreads: async () => {
    const res = await api.get('/threads');
    return res.data;
  },
  createThread: async (systemPrompt) => {
    const res = await api.post('/threads', { systemPrompt });
    return res.data;
  },
  analyzeThread: async (id) => {
    const res = await api.post(`/threads/${id}/analyze`);
    return res.data;
  },
  confirmSetup: async (id, config) => {
    const res = await api.post(`/threads/${id}/confirm`, config);
    return res.data;
  }
};

export const runsApi = {
  getRuns: async (threadId) => {
    const res = await api.get(`/runs/thread/${threadId}`);
    return res.data;
  },
  getRunDetails: async (id) => {
    const res = await api.get(`/runs/${id}`);
    return res.data;
  },
  generateScenarios: async (id) => {
    const res = await api.post(`/runs/${id}/generate-scenarios`);
    return res.data;
  },
  executeSuite: async (id, scenarioIds) => {
    const res = await api.post(`/runs/${id}/execute`, { scenarioIds });
    return res.data;
  },
  getRunStatus: async (id) => {
    const res = await api.get(`/runs/${id}/status`);
    return res.data;
  },
  optimizePrompt: async (id) => {
    const res = await api.post(`/runs/${id}/optimize-prompt`);
    return res.data;
  },
  getTrace: async (scenarioId) => {
    const res = await api.get(`/runs/traces/${scenarioId}`);
    return res.data;
  },
  compareRuns: async (a, b) => {
    const res = await api.get(`/runs/compare/runs?a=${a}&b=${b}`);
    return res.data;
  },
  deleteRun: async (id) => {
    const res = await api.delete(`/runs/${id}`);
    return res.data;
  }
};

export const arenaApi = {
  startDuel: async (data: { promptRed: string; promptBlue: string; taskDomain: string; customRules: string[] }) => {
    const res = await api.post('/arena/duel', data);
    return res.data;
  }
};

export default api;
