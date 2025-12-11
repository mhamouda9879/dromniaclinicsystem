import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import ReceptionDashboard from './components/dashboards/ReceptionDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import WaitingRoomDisplay from './components/dashboards/WaitingRoomDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import { UserRole } from './types';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/reception"
            element={
              <ProtectedRoute allowedRoles={[UserRole.RECEPTION, UserRole.ADMIN]}>
                <Layout>
                  <ReceptionDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
                <Layout>
                  <DoctorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/waiting-room"
            element={
              <ProtectedRoute>
                <Layout>
                  <WaitingRoomDisplay />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/reception" replace />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
