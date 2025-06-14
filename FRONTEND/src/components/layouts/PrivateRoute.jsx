import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/redux/features/user/userSlice';
import InvalidPage from '@/components/sections/InvalidPage';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <InvalidPage />;
  }

  return <Outlet />;
};

export default PrivateRoute; 