const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    // For production/public hosts, default to the same origin's API prefix
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${origin}/api/v1`;
    }
  }
  
  return 'http://localhost:8000/api/v1';
};

export const config = {
  apiUrl: getApiUrl(),
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  env: import.meta.env.VITE_ENV || 'development',
};
