const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  
  return '/api/v1';
};

export const config = {
  apiUrl: getApiUrl(),
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  env: import.meta.env.VITE_ENV || 'development',
};
