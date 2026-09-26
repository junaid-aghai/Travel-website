import axios from 'axios';

/**
 * Centralized Axios instance with base URL from environment variables.
 * All API calls should use this instance instead of raw axios.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
