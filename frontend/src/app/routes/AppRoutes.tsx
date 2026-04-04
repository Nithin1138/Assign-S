import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';
import { RefreshCw } from 'lucide-react';

// Public pages — loaded eagerly (they're the entry points)
import LandingPage from '../../pages/LandingPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import SignupPage from '../../features/auth/pages/SignupPage';

// Protected pages — lazy-loaded so the initial bundle stays lean
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const GeneratePage = lazy(() => import('../../features/templates/pages/GeneratePage'));
const TemplatesPage = lazy(() => import('../../features/templates/pages/TemplatesPage'));
const DocumentsPage = lazy(() => import('../../features/dashboard/pages/DocumentsPage'));
const EditorPage = lazy(() => import('../../features/editor/pages/EditorPage'));
import BillingPage from '../../pages/BillingPage';

// Shared fallback while a lazy chunk is loading
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-stone-50">
    <div className="flex flex-col items-center gap-3">
      <RefreshCw size={24} className="animate-spin text-stone-400" />
      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Loading...</span>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <GeneratePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;