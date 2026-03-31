import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';

// Public Pages
import LandingPage from '../../pages/LandingPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import SignupPage from '../../features/auth/pages/SignupPage';

// Protected Pages
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import ProfilePage from '../../pages/ProfilePage';
import GeneratePage from '../../features/templates/pages/GeneratePage';
import TemplatesPage from '../../features/templates/pages/TemplatesPage';
import DocumentsPage from '../../features/dashboard/pages/DocumentsPage';
import EditorPage from '../../features/editor/pages/EditorPage';

const AppRoutes = () => {
  return (
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

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;