import { Navigate } from 'react-router-dom';

// Este componente envuelve al Dashboard. Si no hay sesión, te expulsa.
const RequireAuth = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;