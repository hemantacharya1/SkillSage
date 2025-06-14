/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URL
 */

export const API_CONFIG = {
  // Base URL can be overridden by environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      RESET_PASSWORD_OTP: '/api/auth/reset-password-sent-otp',
      RESET_PASSWORD: '/api/auth/reset-password',
      PROFILE: '/api/auth/profile'
    }
  },

  // Default headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
}; 