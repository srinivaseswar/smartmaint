import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MachinesPage } from '@/pages/MachinesPage';
import { MachineDetailPage } from '@/pages/MachineDetailPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { BreakdownsPage } from '@/pages/BreakdownsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ForecastingPage } from '@/pages/ForecastingPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { WarrantyPage } from '@/pages/WarrantyPage';
import { ServiceHistoryPage } from '@/pages/ServiceHistoryPage';
import { PredictivePage } from '@/pages/PredictivePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AuditPage } from '@/pages/AuditPage';
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAppSelector } from '@/store';
import { canAccessModule } from '@/lib/rbac';
import type { RoleKey } from '@/types';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, module }: { children: ReactNode; module?: string }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role) as RoleKey | undefined;
  const location = useLocation();

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && !canAccessModule(role, module)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="/machines" element={<ProtectedRoute module="machines"><MachinesPage /></ProtectedRoute>} />
        <Route path="/machines/:id" element={<ProtectedRoute module="machines"><MachineDetailPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute module="maintenance"><MaintenancePage /></ProtectedRoute>} />
        <Route path="/breakdowns" element={<ProtectedRoute module="breakdowns"><BreakdownsPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute module="inventory"><InventoryPage /></ProtectedRoute>} />
        <Route path="/forecasting" element={<ProtectedRoute module="forecasting"><ForecastingPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute module="suppliers"><SuppliersPage /></ProtectedRoute>} />
        <Route path="/warranty" element={<ProtectedRoute module="warranty"><WarrantyPage /></ProtectedRoute>} />
        <Route path="/service-history" element={<ProtectedRoute module="service_history"><ServiceHistoryPage /></ProtectedRoute>} />
        <Route path="/predictive" element={<ProtectedRoute module="predictive"><PredictivePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute module="notifications"><NotificationsPage /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute module="audit"><AuditPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
