import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchLogo = async () => {
  const response = await axios.get(`${API_URL}/settings/logo`);
  return response.data.logoUrl;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await axios.post(`${API_URL}/settings/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.logoUrl;
};

export const deleteLogo = async () => {
  await axios.delete(`${API_URL}/settings/logo`);
};
