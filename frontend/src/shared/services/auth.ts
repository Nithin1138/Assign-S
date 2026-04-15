import { config } from './config';

const API_BASE = config.API_URL || 'http://localhost:8000/api/v1';

export const signUpWithEmail = async (email: string, pass: string, displayName: string = "") => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, display_name: displayName })
  });
  if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Registration failed");
  }
  const data = await response.json();
  if (data?.access_token) {
    localStorage.setItem('am_access_token', data.access_token);
    window.dispatchEvent(new Event('auth_changed'));
  }
  return data;
};

export const signInWithEmail = async (email: string, pass: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Login failed");
  }
  const data = await response.json();
  if (data?.access_token) {
    localStorage.setItem('am_access_token', data.access_token);
    window.dispatchEvent(new Event('auth_changed'));
  }
  return data;
};

export const signInWithGoogleToken = async (token: string) => {
  const response = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Google Login failed");
  }
  const data = await response.json();
  if (data?.access_token) {
    localStorage.setItem('am_access_token', data.access_token);
    window.dispatchEvent(new Event('auth_changed'));
  }
  return data;
};

export const signOut = () => {
  localStorage.removeItem('am_access_token');
  localStorage.removeItem('_am_last_uid');
  window.dispatchEvent(new Event('auth_changed'));
  window.location.href = '/login';
};
