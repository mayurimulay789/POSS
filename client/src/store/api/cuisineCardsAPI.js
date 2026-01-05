import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const cuisineCardsApi = axios.create({
  baseURL: `${API_URL}/hotel-images`,
});

cuisineCardsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const cuisineCardsAPI = {
  // Use the main hotel-images endpoint and filter in the thunk
  fetchCuisineCards: async () => cuisineCardsApi.get('/'),
  fetchCuisineBackground: async () => cuisineCardsApi.get('/cuisine-gallery'),
};

export default cuisineCardsAPI;
