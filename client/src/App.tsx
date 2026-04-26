import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './features/admin/components/AdminLayout';
import AdminPlansPage from './features/admin/pages/AdminPlansPage';
import AdminUsersPage from './features/admin/pages/AdminUsersPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import SharedPlanPage from './features/sharing/pages/SharedPlanPage';
import CreatePlanPage from './features/travel-plan/pages/CreatePlanPage';
import DashboardPage from './features/travel-plan/pages/DashboardPage';
import EditPlanPage from './features/travel-plan/pages/EditPlanPage';
import PlanDetailPage from './features/travel-plan/pages/PlanDetailPage';
import AppShell from './features/ui/layout/AppShell';
import NotFoundPage from './features/ui/pages/NotFoundPage';
import AdminRoute from './features/ui/routes/AdminRoute';
import PrivateRoute from './features/ui/routes/PrivateRoute';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shared/:token" element={<SharedPlanPage />} />

          {/* Private — inside AppShell */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/plans/new" element={<CreatePlanPage />} />
              <Route path="/plans/:id" element={<PlanDetailPage />} />
              <Route path="/plans/:id/edit" element={<EditPlanPage />} />

              {/* Admin */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/plans" element={<AdminPlansPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastClassName="!bg-navy-800 !border !border-navy-700 !text-white !font-body"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}