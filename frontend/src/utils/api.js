import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const userInfoRaw = localStorage.getItem('userInfo');
    if (userInfoRaw && userInfoRaw !== 'null') {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        if (userInfo && userInfo.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
      } catch (err) {
        console.error('Error parsing userInfo from localStorage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
