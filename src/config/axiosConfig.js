import axios from 'axios';

// Set up an Axios interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Ensure the token is prefixed with 'Bearer'
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
