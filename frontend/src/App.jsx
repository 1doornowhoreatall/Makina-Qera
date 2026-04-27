import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Faqet e autentikimit
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Faqet e adminit
import DashboardPage from './pages/admin/DashboardPage';
import VehiclesPage from './pages/admin/VehiclesPage';
import InsurancePage from './pages/admin/InsurancePage';
import ClientsPage from './pages/admin/ClientsPage';
import RentalsPage from './pages/admin/RentalsPage';

// Faqet e klientit
import HomePage from './pages/client/HomePage';
import BookingPage from './pages/client/BookingPage';
import MyRentalsPage from './pages/client/MyRentalsPage';
import ProfilePage from './pages/client/ProfilePage';

const DRAWER_WIDTH = 260;

const AppContent = () => {
  const { eshteHyrur } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: '64px',
          ml: { md: eshteHyrur ? `${DRAWER_WIDTH}px` : 0 },
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 0.3s ease',
          maxWidth: { md: eshteHyrur ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' }
        }}
      >
        <Routes>
          {/* Publike */}
          <Route path="/hyrje" element={<LoginPage />} />
          <Route path="/regjistrim" element={<RegisterPage />} />

          {/* Klient */}
          <Route path="/" element={<HomePage />} />
          <Route path="/automjete" element={<HomePage />} />
          <Route path="/rezervo/:id" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/qirat-e-mia" element={
            <ProtectedRoute><MyRentalsPage /></ProtectedRoute>
          } />
          <Route path="/profili" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/automjete" element={
            <ProtectedRoute requiredRole="admin"><VehiclesPage /></ProtectedRoute>
          } />
          <Route path="/admin/sigurime" element={
            <ProtectedRoute requiredRole="admin"><InsurancePage /></ProtectedRoute>
          } />
          <Route path="/admin/kliente" element={
            <ProtectedRoute requiredRole="admin"><ClientsPage /></ProtectedRoute>
          } />
          <Route path="/admin/qiradhenie" element={
            <ProtectedRoute requiredRole="admin"><RentalsPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
