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
        // Check if user is admin or regular user
        const userRole = localStorage.getItem('role');
        const refreshEndpoint = userRole === 'admin' ? '/api/admin/refresh-token' : '/api/users/refresh-token';
        
        // Try to refresh the token
        await axios.post(refreshEndpoint);
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        // Check role before clearing localStorage
        const userRole = localStorage.getItem('role');
        
        // Clear localStorage
        localStorage.removeItem('userID');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('role');
        
        // Redirect to appropriate page
        window.location.href = userRole === 'admin' ? '/' : '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
