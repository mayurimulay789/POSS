import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get active footer (public)
export const fetchFooter = async () => {
  const response = await axios.get(`${API_URL}/footer`);
  return response.data;
};

// Get all footers (protected)
export const fetchAllFooters = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/footer/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get footer by ID (protected)
export const fetchFooterById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/footer/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Create footer (protected)
export const createFooter = async (footerData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/footer`, footerData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update footer (protected)
export const updateFooter = async ({ id, data }) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/footer/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete footer (protected)
export const deleteFooter = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/footer/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Toggle footer status (protected)
export const toggleFooterStatus = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.patch(`${API_URL}/footer/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
