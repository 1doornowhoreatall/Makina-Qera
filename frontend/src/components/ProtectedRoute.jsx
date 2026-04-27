import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { eshteHyrur, loading, perdoruesi } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  if (!eshteHyrur) {
    return <Navigate to="/hyrje" replace />;
  }

  if (requiredRole && perdoruesi?.roli !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
