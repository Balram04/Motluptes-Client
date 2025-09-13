// Utility function for handling API errors
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error: Unable to connect to server. Please check if the server is running.';
  } else {
    // Something else happened
    return error.message || defaultMessage;
  }
};

// Check if response has valid data structure
export const isValidResponse = (response) => {
  return response && response.data && response.data.data !== undefined;
};
