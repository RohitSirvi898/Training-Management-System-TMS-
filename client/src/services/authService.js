import api from './api';

// ─── Auth Service ────────────────────────────────────────────
const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (userData) => api.post('/auth/register', userData),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/auth/profile', data),

  changePassword: (data) => api.put('/auth/change-password', data),

  getAllUsers: (role = '') => api.get(`/auth/users${role ? `?role=${role}` : ''}`),

  toggleUserStatus: (userId) => api.patch(`/auth/users/${userId}/toggle-status`),
};

export default authService;
