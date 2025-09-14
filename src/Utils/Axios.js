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
    // Only attempt token refresh if user is authenticated and this isn't a login/register request
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register');
      const isRefreshRequest = originalRequest.url?.includes('/refresh-token');
      const userRole = localStorage.getItem('role');
      const userID = localStorage.getItem('userID');
      
      // Only try to refresh if:
      // 1. This is not a login/register request
      // 2. This is not already a refresh request 
      // 3. User has some authentication data stored
      if (!isLoginRequest && !isRefreshRequest && (userRole || userID)) {
        originalRequest._retry = true;

        try {
          const refreshEndpoint = userRole === 'admin' ? '/api/admin/refresh-token' : '/api/users/refresh-token';
          
          // Try to refresh the token
          await axios.post(refreshEndpoint);
          
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
          
          // Redirect to appropriate page
          window.location.href = userRole === 'admin' ? '/' : '/login';
          
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);
