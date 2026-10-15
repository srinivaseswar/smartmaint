import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { canAccessModule } from '@/lib/access';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EntityPage } from '@/pages/EntityPage';
import { MachineDetailPage } from '@/pages/MachineDetailPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ChecksPage } from '@/pages/ChecksPage';

function ModuleRoute({ module, children }: { module: string; children: ReactNode }) {
  const { user } = useStore();
  return user && canAccessModule(user.accessRole, module)
    ? children
    : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user, ready } = useStore();
  if (!ready) return <div className="flex min-h-full items-center justify-center text-sm text-slate-500">Loading…</div>;
  if (!user) return <AuthPage />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ModuleRoute module="dashboard"><DashboardPage /></ModuleRoute>} />
        <Route path="/machines" element={<ModuleRoute module="machines"><EntityPage entity="machines" /></ModuleRoute>} />
        <Route path="/machines/:id" element={<ModuleRoute module="machines"><MachineDetailPage /></ModuleRoute>} />
        <Route path="/checks" element={<ModuleRoute module="checks"><ChecksPage /></ModuleRoute>} />
        <Route path="/people" element={<ModuleRoute module="people"><PeoplePage /></ModuleRoute>} />
        <Route path="/messages" element={<ModuleRoute module="messages"><MessagesPage /></ModuleRoute>} />
        <Route path="/schedules" element={<ModuleRoute module="schedules"><EntityPage entity="schedules" /></ModuleRoute>} />
        <Route path="/spares" element={<ModuleRoute module="spares"><EntityPage entity="spares" /></ModuleRoute>} />
        <Route path="/suppliers" element={<ModuleRoute module="suppliers"><EntityPage entity="suppliers" /></ModuleRoute>} />
        <Route path="/warranties" element={<ModuleRoute module="warranties"><EntityPage entity="warranties" /></ModuleRoute>} />
        <Route path="/services" element={<ModuleRoute module="services"><EntityPage entity="services" /></ModuleRoute>} />
        <Route path="/supply-orders" element={<ModuleRoute module="supplyOrders"><EntityPage entity="supplyOrders" /></ModuleRoute>} />
        <Route path="/part-warranties" element={<ModuleRoute module="partWarranties"><EntityPage entity="partWarranties" /></ModuleRoute>} />
        <Route path="/part-history" element={<ModuleRoute module="partServices"><EntityPage entity="partServices" /></ModuleRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
