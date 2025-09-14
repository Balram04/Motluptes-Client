import Axios from 'axios';

export const axios = Axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true, // This is crucial for sending HTTP-only cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for token refresh and error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be down or slow');
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network Error - please check if the server is running on', process.env.REACT_APP_BASE_URL);
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server Error - there may be a database connection issue');
      return Promise.reject(error);
    }

    // Handle authentication errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post('/api/users/refresh-token');
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        // Clear localStorage
        localStorage.removeItem('userID');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('role');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
