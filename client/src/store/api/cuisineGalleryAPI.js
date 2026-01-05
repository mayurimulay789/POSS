import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const cuisineGalleryApi = axios.create({
  baseURL: `${API_URL}/cuisine-gallery`,
});

cuisineGalleryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const cuisineGalleryAPI = {
  // Get active cuisine gallery (public)
  fetchCuisineGallery: async () => cuisineGalleryApi.get('/'),
  
  // Get all cuisine galleries (protected)
  fetchAllCuisineGalleries: async () => cuisineGalleryApi.get('/all'),
  
  // Get single cuisine gallery by ID (protected)
  fetchCuisineGalleryById: async (id) => cuisineGalleryApi.get(`/${id}`),
  
  // Create new cuisine gallery (protected)
  createCuisineGallery: async (data) => cuisineGalleryApi.post('/', data),
  
  // Update cuisine gallery (protected)
  updateCuisineGallery: async (id, data) => cuisineGalleryApi.put(`/${id}`, data),
  
  // Delete cuisine gallery (protected)
  deleteCuisineGallery: async (id) => cuisineGalleryApi.delete(`/${id}`),
  
  // Toggle active status (protected)
  toggleCuisineGalleryStatus: async (id) => cuisineGalleryApi.patch(`/${id}/toggle`),
};

export default cuisineGalleryAPI;
