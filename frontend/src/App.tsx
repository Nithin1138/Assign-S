import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ThemeProvider } from './app/providers/ThemeContext';
import AppRoutes from './app/routes/AppRoutes';

/**
 * App.tsx - Main Entry Point
 * 
 * Minimal monolithic setup. Now modularized into:
 * - /src/pages/ - Individual page components
 * - /src/routes/ - Routing logic (AppRoutes.tsx)
 * - /src/context/ - Global state management
 * - /src/layout/ - Shared UI wrappers
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/* Main Content & Routing */}
          <AppRoutes />

          {/* Global Notification system */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-bold text-xs uppercase tracking-widest',
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-main)',
                borderRadius: '1rem',
                padding: '1rem 1.5rem',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
