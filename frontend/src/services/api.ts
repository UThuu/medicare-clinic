import axios from 'axios';
const api = axios.create({ baseURL: '/api', withCredentials: true, timeout: 10000 });
export default api;
