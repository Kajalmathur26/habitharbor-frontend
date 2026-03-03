// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 15000,
// });

// // -------------------- Interceptors --------------------

// // Request: attach token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('planora_token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response: handle 401
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('planora_token');
//       localStorage.removeItem('planora_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );


import api from './api';
// -------------------- AUTH --------------------
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/auth/upload-avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteAccount: () => api.delete('/auth/account'),
};

// -------------------- TASKS --------------------
export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (tasks) => api.put('/tasks/reorder', { tasks }),
};

// -------------------- GOALS --------------------
export const goalService = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  updateTargets: (id, targets) => api.put(`/goals/${id}/targets`, { targets }),
  delete: (id) => api.delete(`/goals/${id}`),
  addMilestone: (id, data) => api.post(`/goals/${id}/milestones`, data),
};

// -------------------- HABITS --------------------
export const habitService = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  log: (id, data) => api.post(`/habits/${id}/log`, data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

// -------------------- MOODS --------------------
export const moodService = {
  getAll: (params) => api.get('/moods', { params }),
  getStats: () => api.get('/moods/stats'),
  getTrend: (days) => api.get('/mood/trend', { params: { days } }),
  create: (data) => api.post('/mood', data),
  update: (id, data) => api.put(`/mood/${id}`, data),
  delete: (id) => api.delete(`/mood/${id}`),
};

// -------------------- JOURNAL --------------------
export const journalService = {
  getAll: () => api.get('/journal'),
  getOne: (id) => api.get(`/journal/${id}`),
  create: (data) => api.post('/journal', data),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/journal/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// -------------------- EVENTS --------------------
export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// -------------------- AI --------------------
export const aiService = {
  analyzeProductivity: () => api.get('/ai/analyze'),
  generateJournalPrompts: (data) => api.post('/ai/journal-prompts', data),
  chat: (data) => api.post('/ai/chat', data),
  suggestGoals: (data) => api.post('/ai/suggest-goals', data),
};

// -------------------- DASHBOARD --------------------
export const dashboardService = {
  getData: () => api.get('/dashboard'),
};

// -------------------- FINANCE --------------------
export const financeService = {
  getEntries: (params) => api.get('/finance', { params }),
  getSummary: (month) => api.get('/finance/summary', { params: { month } }),
  getMonthlyTrend: () => api.get('/finance/monthly-trend'),
  createEntry: (data) => api.post('/finance', data),
  updateEntry: (id, data) => api.put(`/finance/${id}`, data),
  deleteEntry: (id) => api.delete(`/finance/${id}`),
};

export default api;