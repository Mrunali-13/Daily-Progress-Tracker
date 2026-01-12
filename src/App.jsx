import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AppLayout from './components/layout/AppLayout';
import TaskList from './components/task/TaskList';
import TeamView from './components/user/TeamView';
import UserManagement from './components/user/UserManagement';
import Dashboard from './components/dashboard/Dashboard';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/auth/ProtectedRoute';

// Role-based redirect
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'REPORTING_MANAGER') return <Navigate to="/team" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* App Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<RoleBasedRedirect />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER', 'REPORTING_MANAGER', 'ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute allowedRoles={['USER', 'REPORTING_MANAGER', 'ADMIN']}>
                <TaskList />
              </ProtectedRoute>
            }
          />
          <Route
            path="team"
            element={
              <ProtectedRoute allowedRoles={['REPORTING_MANAGER', 'ADMIN']}>
                <TeamView />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
