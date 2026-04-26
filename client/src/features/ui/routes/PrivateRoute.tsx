import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../components/Spinner';

export default function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return <Spinner fullScreen />;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}