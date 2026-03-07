import api from './api';

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Tasks
export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (tasks) => api.put('/tasks/reorder', { tasks }),
};

// Journal
export const journalService = {
  getAll: (params) => api.get('/journal', { params }),
  getOne: (id) => api.get(`/journal/${id}`),
  create: (data) => api.post('/journal', data),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
};

// Goals
export const goalService = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  addMilestone: (id, data) => api.post(`/goals/${id}/milestones`, data),
  toggleMilestone: (milestoneId, completed) => api.put(`/goals/milestones/${milestoneId}`, { completed }),
  deleteMilestone: (milestoneId) => api.delete(`/goals/milestones/${milestoneId}`),
};

// Habits
export const habitService = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  log: (id, data) => api.post(`/habits/${id}/log`, data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

// Moods
export const moodService = {
  getAll: (params) => api.get('/moods', { params }),
  getStats: () => api.get('/moods/stats'),
  log: (data) => api.post('/moods', data),
  update: (id, data) => api.put(`/moods/${id}`, data),
};

// Events
export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// AI
export const aiService = {
  analyzeProductivity: () => api.get('/ai/analyze'),
  generateJournalPrompts: (data) => api.post('/ai/journal-prompts', data),
  chat: (data) => api.post('/ai/chat', data),
  suggestGoals: (data) => api.post('/ai/suggest-goals', data),
  planMyDay: () => api.post('/ai/daily-plan'),
  suggestTasks: () => api.post('/ai/suggest-tasks'),
};

// Dashboard
export const dashboardService = {
  getData: () => api.get('/dashboard'),
  getWeeklyReport: () => api.get('/dashboard/weekly-report'),
};

// Finance
export const financeService = {
  getAll: (params) => api.get('/finance', { params }),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
  getAnalytics: (params) => api.get('/finance/analytics', { params }),
};

// Search
export const searchService = {
  search: (q) => api.get('/search', { params: { q } }),
};

// Export
export const exportService = {
  exportFinance: () => api.get('/export/finance', { responseType: 'blob' }),
  exportJournal: () => api.get('/export/journal', { responseType: 'blob' }),
  exportProductivity: () => api.get('/export/productivity', { responseType: 'blob' }),
};
