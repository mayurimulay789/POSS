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
  fetchCuisineGallery: async () => cuisineGalleryApi.get('/'),
  updateCuisineGallery: async (data) => cuisineGalleryApi.post('/', data),
};

export default cuisineGalleryAPI;
