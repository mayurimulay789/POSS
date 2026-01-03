
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const hotelImageApi = axios.create({
  baseURL: `${API_URL}/hotel-images`,
});

hotelImageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Only add token if it exists (public routes don't need it)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const hotelImageAPI = {
  fetchHotelImages: async () => hotelImageApi.get('/'),
  uploadHotelImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return hotelImageApi.post('/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateHotelImage: async (id, data) => hotelImageApi.put(`/${id}`, data),
  deleteHotelImage: async (id) => hotelImageApi.delete(`/${id}`),
};

export default hotelImageAPI;
