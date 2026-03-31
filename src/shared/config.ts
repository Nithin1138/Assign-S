export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  env: import.meta.env.VITE_ENV || 'development',
};
