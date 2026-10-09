import axios from 'axios';

const api = axios.create({
  baseURL: ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
