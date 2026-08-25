import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Layout } from './components/layout/Layout.js';

import { LoginPage } from './pages/auth/LoginPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';

// Operations Pages
import { AssetsPage } from './pages/operations/AssetsPage.js';
import { OperationsPlaceholder } from './pages/operations/OperationsPlaceholder.js';

// Master Data Pages
import { DepartmentsPage } from './pages/master-data/DepartmentsPage.js';
import { PositionsPage } from './pages/master-data/PositionsPage.js';
import { EmployeesPage } from './pages/master-data/EmployeesPage.js';
import { AssetCategoriesPage } from './pages/master-data/AssetCategoriesPage.js';
import { WarehousesPage } from './pages/master-data/WarehousesPage.js';
import { VendorsPage } from './pages/master-data/VendorsPage.js';

// System Admin Pages
import { ProfilePage } from './pages/admin/ProfilePage.js';
import { UsersPage } from './pages/admin/UsersPage.js';
import { SettingsPage } from './pages/admin/SettingsPage.js';
import { BackupSettingsPage } from './pages/admin/BackupSettingsPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Đang xác thực hệ thống...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes inside Fluid Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* 2. Quản lý vận hành */}
                <Route path="operations/assets" element={<AssetsPage />} />
                <Route path="operations/discovery" element={<OperationsPlaceholder />} />
                <Route path="operations/maintenance" element={<OperationsPlaceholder />} />
                <Route path="operations/audit" element={<OperationsPlaceholder />} />
                <Route path="operations/drift-alerts" element={<OperationsPlaceholder />} />

                {/* 3. Danh mục hệ thống */}
                <Route path="master-data/departments" element={<DepartmentsPage />} />
                <Route path="master-data/positions" element={<PositionsPage />} />
                <Route path="master-data/employees" element={<EmployeesPage />} />
                <Route path="master-data/asset-categories" element={<AssetCategoriesPage />} />
                <Route path="master-data/warehouses" element={<WarehousesPage />} />
                <Route path="master-data/vendors" element={<VendorsPage />} />

                {/* 4. Quản trị hệ thống */}
                <Route path="admin/profile" element={<ProfilePage />} />
                <Route path="admin/users" element={<UsersPage />} />
                <Route path="admin/settings" element={<SettingsPage />} />
                <Route path="admin/backup-settings" element={<BackupSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
