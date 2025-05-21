import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://energy-monitoring-backend.onrender.com/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default axiosInstance;
