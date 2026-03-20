import axios from 'axios';

// API base URL - change this if backend is on different host
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // 120 second timeout for long-running analysis
});

/**
 * Upload resume PDF and extract text
 */
export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axios.post(
      `${API_BASE_URL}/upload-resume`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 second timeout for file upload
      }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Analyze resume against target role
 */
export const analyzeResume = async (resumeText, targetRole) => {
  try {
    const response = await apiClient.post('/analyze', {
      resumeText,
      targetRole
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get health status of backend
 */
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health', {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not running');
  }
};

/**
 * Handle API errors with user-friendly messages
 */
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorMessage = error.response.data?.error || 'An error occurred';
    const errorDetails = error.response.data?.details;

    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Is the backend running?',
      details: error.message,
      status: 0
    };
  } else {
    // Error in request setup
    return {
      message: 'Error preparing request',
      details: error.message,
      status: 0
    };
  }
};

export default apiClient;
