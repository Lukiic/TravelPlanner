import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AppShell from './features/ui/layout/AppShell';
import AdminRoute from './features/ui/routes/AdminRoute';
import PrivateRoute from './features/ui/routes/PrivateRoute';
import NotFoundPage from './features/ui/pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private — inside AppShell */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppShell />}>

              {/* Admin */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
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