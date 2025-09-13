import Axios from 'axios';

const token = localStorage.getItem('jwt_token');

export const axios = Axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

// Add a request interceptor to update token dynamically
axios.interceptors.request.use(
  (config) => {
    const currentToken = localStorage.getItem('jwt_token');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down or slow');
    } else if (error.message === 'Network Error') {
      console.error('Network Error - please check if the server is running on', process.env.REACT_APP_BASE_URL);
    } else if (error.response?.status === 500) {
      console.error('Server Error - there may be a database connection issue');
    }
    return Promise.reject(error);
  }
);
