import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const contactUsApi = axios.create({
  baseURL: `${API_URL}/contact-us`,
});

contactUsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const contactUsAPI = {
  // Get active contact us (public)
  fetchContactUs: async () => contactUsApi.get('/'),
  
  // Get all contact us (protected)
  fetchAllContactUs: async () => contactUsApi.get('/all'),
  
  // Get single contact us by ID (protected)
  fetchContactUsById: async (id) => contactUsApi.get(`/${id}`),
  
  // Create new contact us (protected)
  createContactUs: async (data) => contactUsApi.post('/', data),
  
  // Update contact us (protected)
  updateContactUs: async (id, data) => contactUsApi.put(`/${id}`, data),
  
  // Delete contact us (protected)
  deleteContactUs: async (id) => contactUsApi.delete(`/${id}`),
  
  // Toggle active status (protected)
  toggleContactUsStatus: async (id) => contactUsApi.patch(`/${id}/toggle`),
};

export default contactUsAPI;
