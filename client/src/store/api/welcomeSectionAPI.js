import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const welcomeSectionApi = axios.create({
  baseURL: `${API_URL}/welcome-section`,
});

welcomeSectionApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const welcomeSectionAPI = {
  // Get active welcome section (public)
  fetchWelcomeSection: async () => welcomeSectionApi.get('/'),
  
  // Get all welcome sections (protected)
  fetchAllWelcomeSections: async () => welcomeSectionApi.get('/all'),
  
  // Get single welcome section by ID (protected)
  fetchWelcomeSectionById: async (id) => welcomeSectionApi.get(`/${id}`),
  
  // Create new welcome section (protected)
  createWelcomeSection: async (data) => welcomeSectionApi.post('/', data),
  
  // Update welcome section (protected)
  updateWelcomeSection: async (id, data) => welcomeSectionApi.put(`/${id}`, data),
  
  // Delete welcome section (protected)
  deleteWelcomeSection: async (id) => welcomeSectionApi.delete(`/${id}`),
  
  // Toggle active status (protected)
  toggleWelcomeSectionStatus: async (id) => welcomeSectionApi.patch(`/${id}/toggle`),
};

export default welcomeSectionAPI;
