// API Configuration
// Reads from environment variable or falls back to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

console.log('🔗 API Base URL:', API_BASE_URL);

export default API_BASE_URL;
