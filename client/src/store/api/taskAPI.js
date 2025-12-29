import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for task API
const taskApi = axios.create({
  baseURL: `${API_URL}/tasks`,
});

// Add auth interceptor to task API
taskApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
taskApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const taskAPI = {
  // Create task
  createTask: async (taskData) => {
    const response = await taskApi.post('/', taskData);
    return response;
  },

  // Get all tasks
  getAllTasks: async (params = {}) => {
    const response = await taskApi.get('/', { params });
    return response;
  },

  // Get my tasks (assigned to me)
  getMyTasks: async (params = {}) => {
    const response = await taskApi.get('/my-tasks', { params });
    return response;
  },

  // Get tasks assigned by me
  getAssignedTasks: async (params = {}) => {
    const response = await taskApi.get('/assigned-by-me', { params });
    return response;
  },

  // Get my pending tasks
  getMyPendingTasks: async (params = {}) => {
    const response = await taskApi.get('/my-tasks/pending', { params });
    return response;
  },

  // Get my completed tasks
  getMyCompletedTasks: async (params = {}) => {
    const response = await taskApi.get('/my-tasks/completed', { params });
    return response;
  },

  // Get single task
  getTask: async (id) => {
    const response = await taskApi.get(`/${id}`);
    return response;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await taskApi.put(`/${id}`, taskData);
    return response;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await taskApi.delete(`/${id}`);
    return response;
  },

  // Get all users (for assigning tasks)
  getAllUsers: async () => {
    // You might need to import employeeAPI or create a separate endpoint
    const userApi = axios.create({
      baseURL: `${API_URL}/employee`,
    });
    
    userApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );
    
    const response = await userApi.get('/users');
    return response;
  }
};

export default taskAPI;