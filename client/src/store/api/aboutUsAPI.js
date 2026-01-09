import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const aboutUsApi = axios.create({
  baseURL: `${API_URL}/about-us`,
});

aboutUsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const aboutUsAPI = {
  // Get active about us (public)
  fetchAboutUs: async () => aboutUsApi.get('/'),
  // Get all about us (protected)
  fetchAllAboutUs: async () => aboutUsApi.get('/all'),
  // Get single about us by ID (protected)
  fetchAboutUsById: async (id) => aboutUsApi.get(`/${id}`),
  // Create new about us (protected)
  createAboutUs: async (data) => aboutUsApi.post('/', data),
  // Update about us (protected)
  updateAboutUs: async (id, data) => aboutUsApi.put(`/${id}`, data),
  // Delete about us (protected)
  deleteAboutUs: async (id) => aboutUsApi.delete(`/${id}`),
  // Toggle active status (protected)
  toggleAboutUsStatus: async (id, status) => aboutUsApi.patch(`/${id}/activate`, { status }),
};

export default aboutUsAPI;
